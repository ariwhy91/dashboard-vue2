<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import LoginForm from './components/LoginForm.vue'
import PesananSaya from './components/PesananSaya.vue'
import GrafikProduk from './components/GrafikProduk.vue'
import KartuRingkasan from './components/KartuRingkasan.vue'
import DaftarPengguna from './components/DaftarPengguna.vue'
import AppIcon from './components/AppIcon.vue'
import { useAuthStore } from './stores/auth.js'

const auth = useAuthStore()

const menu = [
  { id: 'ringkasan', label: 'Ringkasan', icon: 'dashboard' },
  { id: 'analitik', label: 'Analitik Produk', icon: 'chart' },
  { id: 'pesanan', label: 'Pesanan Saya', icon: 'bag' },
  { id: 'pengguna', label: 'Pengguna', icon: 'users' },
]
const menuAktif = ref('ringkasan')
const sidebarTerbuka = ref(false)

const tanggalHariIni = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const sapaan = computed(() => {
  const jam = new Date().getHours()
  if (jam < 11) return 'Selamat pagi'
  if (jam < 15) return 'Selamat siang'
  if (jam < 19) return 'Selamat sore'
  return 'Selamat malam'
})

const namaPengguna = computed(() => auth.username || 'Pengguna')
const inisial = computed(() => namaPengguna.value.slice(0, 2).toUpperCase())

function bukaBagian(id) {
  menuAktif.value = id
  sidebarTerbuka.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Sorot menu sesuai bagian yang sedang terlihat saat di-scroll.
let observer = null
function pantauBagian() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      const terlihat = entries.filter((e) => e.isIntersecting)
      if (terlihat.length) menuAktif.value = terlihat[0].target.id
    },
    { rootMargin: '-80px 0px -60% 0px' },
  )
  menu.forEach((m) => {
    const el = document.getElementById(m.id)
    if (el) observer.observe(el)
  })
}

watch(
  () => auth.isLoggedIn,
  async (nilai) => {
    if (nilai) {
      await nextTick()
      pantauBagian()
    } else {
      observer?.disconnect()
      menuAktif.value = 'ringkasan'
    }
  },
  { immediate: true },
)
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <LoginForm v-if="!auth.isLoggedIn" />

  <div v-else class="layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarTerbuka }">
      <div class="sidebar-brand">
        <span class="brand-mark"><AppIcon name="zap" :size="18" /></span>
        <span>SalesBoard</span>
        <button
          class="btn-close"
          type="button"
          aria-label="Tutup menu"
          @click="sidebarTerbuka = false"
        >
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <p class="nav-heading">Menu</p>
      <nav class="nav">
        <a
          v-for="m in menu"
          :key="m.id"
          :href="`#${m.id}`"
          class="nav-item"
          :class="{ active: menuAktif === m.id }"
          :aria-current="menuAktif === m.id ? 'true' : undefined"
          @click.prevent="bukaBagian(m.id)"
        >
          <AppIcon :name="m.icon" :size="18" />
          {{ m.label }}
        </a>
      </nav>

      <div class="sidebar-foot">
        <div class="profile">
          <span class="avatar">{{ inisial }}</span>
          <div class="profile-info">
            <strong>{{ namaPengguna }}</strong>
            <span>Akun aktif</span>
          </div>
        </div>
        <button type="button" class="nav-item logout" @click="auth.logout">
          <AppIcon name="log-out" :size="18" />
          Keluar
        </button>
      </div>
    </aside>
    <div v-if="sidebarTerbuka" class="overlay" @click="sidebarTerbuka = false" />

    <!-- Konten -->
    <div class="content">
      <header class="topbar">
        <button
          class="btn btn-icon menu-toggle"
          type="button"
          aria-label="Buka menu"
          @click="sidebarTerbuka = true"
        >
          <AppIcon name="menu" :size="18" />
        </button>
        <div class="greeting">
          <h1>{{ sapaan }}, {{ namaPengguna }}</h1>
          <p>Berikut ringkasan performa penjualan Anda.</p>
        </div>
        <div class="topbar-actions">
          <span class="date-chip">
            <AppIcon name="calendar" :size="16" />
            {{ tanggalHariIni }}
          </span>
          <button type="button" class="btn topbar-logout" @click="auth.logout">
            <AppIcon name="log-out" :size="16" />
            <span class="hide-sm">Keluar</span>
          </button>
        </div>
      </header>

      <main class="main">
        <section id="ringkasan" class="anchor">
          <KartuRingkasan />
        </section>

        <div class="grid-2">
          <div id="analitik" class="anchor">
            <GrafikProduk />
          </div>
          <div id="pesanan" class="anchor">
            <PesananSaya />
          </div>
        </div>

        <div id="pengguna" class="anchor">
          <DaftarPengguna />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  --sidebar-w: 248px;
  min-height: 100vh;
}

/* ---------- Sidebar ---------- */
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  width: var(--sidebar-w);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1rem;
  background: var(--brand-dark);
  color: #cbd5e1;
  transition: transform 0.25s ease;
}
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem 0.5rem 1.5rem;
  color: #fff;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.01em;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--primary);
  color: #fff;
}
.btn-close {
  display: none;
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #cbd5e1;
  padding: 0.25rem;
}
.nav-heading {
  padding: 0 0.75rem 0.5rem;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}
.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  text-align: left;
  transition:
    background 0.15s,
    color 0.15s;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}
.nav-item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
}
.nav-item.active {
  background: rgba(42, 120, 214, 0.22);
  color: #fff;
}
.nav-item.active .icon {
  color: #7db4f0;
}
.sidebar-foot {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.profile {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.5rem 0.5rem 0.75rem;
}
.avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2a78d6, #5b4bc4);
  color: #fff;
  font-weight: 600;
  font-size: 13px;
}
.profile-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.profile-info strong {
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.profile-info span {
  font-size: 12px;
  color: #64748b;
}
.logout:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
}

/* ---------- Konten ---------- */
.content {
  margin-left: var(--sidebar-w);
  min-width: 0;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: rgba(244, 246, 250, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.menu-toggle,
.topbar-logout {
  display: none;
}
.greeting {
  min-width: 0;
}
.greeting h1 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.greeting p {
  font-size: 13px;
  color: var(--text-secondary);
}
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}
.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 38px;
  padding: 0 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.75rem 2rem 2.5rem;
  max-width: 1400px;
}
.grid-2 {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: stretch;
}
.grid-2 > .anchor > * {
  height: 100%;
}
.anchor {
  scroll-margin-top: 96px;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(15, 23, 42, 0.45);
}

@media (max-width: 1100px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 1024px) {
  .date-chip {
    display: none;
  }
}
@media (max-width: 860px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: var(--shadow-lg);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .btn-close {
    display: inline-flex;
  }
  .content {
    margin-left: 0;
  }
  .menu-toggle,
  .topbar-logout {
    display: inline-flex;
  }
  .topbar {
    padding: 0.85rem 1rem;
  }
  .main {
    padding: 1.25rem 1rem 2rem;
    gap: 1rem;
  }
  .grid-2 {
    gap: 1rem;
  }
}
@media (max-width: 520px) {
  .hide-sm {
    display: none;
  }
  .greeting h1 {
    font-size: 17px;
  }
  .greeting p {
    display: none;
  }
}
</style>
