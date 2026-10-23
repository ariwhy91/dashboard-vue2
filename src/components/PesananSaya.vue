<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { rupiah } from '../format.js'
import AppIcon from './AppIcon.vue'

const auth = useAuthStore()
const pesanan = ref([])
const keadaan = ref('idle') // idle | loading | empty | error | success

const totalBelanja = computed(() => pesanan.value.reduce((s, p) => s + (p.total || 0), 0))

async function muatPesanan() {
  keadaan.value = 'loading'
  try {
    const response = await auth.apiFetch('/orders/saya')
    if (!response.ok) {
      throw new Error('Status HTTP: ' + response.status)
    }
    const data = await response.json()
    pesanan.value = data
    keadaan.value = data.length === 0 ? 'empty' : 'success'
  } catch (error) {
    console.error('Gagal memuat pesanan:', error)
    keadaan.value = 'error'
  }
}

onMounted(muatPesanan)
</script>

<template>
  <section class="card pesanan">
    <header class="card-header">
      <div>
        <h2 class="card-title">
          <AppIcon name="bag" :size="18" />
          Pesanan Saya
          <span v-if="keadaan === 'success'" class="badge">{{ pesanan.length }}</span>
        </h2>
        <p class="card-subtitle">Riwayat pesanan akun Anda</p>
      </div>
      <button
        type="button"
        class="btn btn-icon"
        title="Muat ulang pesanan"
        aria-label="Muat ulang pesanan"
        :disabled="keadaan === 'loading'"
        @click="muatPesanan"
      >
        <AppIcon name="refresh" :size="16" :class="{ spin: keadaan === 'loading' }" />
      </button>
    </header>

    <div class="body">
      <div v-if="keadaan === 'loading' || keadaan === 'idle'" class="list-skeleton">
        <div v-for="i in 3" :key="i" class="row-skeleton">
          <div class="skeleton" style="width: 36px; height: 36px; border-radius: 10px" />
          <div style="flex: 1">
            <div class="skeleton" style="height: 12px; width: 60%; margin-bottom: 8px" />
            <div class="skeleton" style="height: 10px; width: 35%" />
          </div>
        </div>
      </div>

      <div v-else-if="keadaan === 'empty'" class="state">
        <span class="state-icon"><AppIcon name="inbox" :size="22" /></span>
        <p class="state-title">Belum ada pesanan</p>
        <p class="state-desc">Pesanan yang Anda buat akan tampil di sini.</p>
      </div>

      <div v-else-if="keadaan === 'error'" class="state is-error">
        <span class="state-icon"><AppIcon name="alert" :size="22" /></span>
        <p class="state-title">Gagal memuat pesanan</p>
        <button class="btn" type="button" @click="muatPesanan">
          <AppIcon name="refresh" :size="16" /> Coba lagi
        </button>
      </div>

      <template v-else>
        <ul class="list">
          <li v-for="p in pesanan" :key="p.id" class="item">
            <span class="item-icon"><AppIcon name="package" :size="17" /></span>
            <div class="item-main">
              <p class="item-name">{{ p.produk }}</p>
              <p class="item-meta">{{ p.jumlah }} item</p>
            </div>
            <p class="item-total">{{ rupiah(p.total) }}</p>
          </li>
        </ul>
        <footer class="summary">
          <span>Total belanja</span>
          <strong>{{ rupiah(totalBelanja) }}</strong>
        </footer>
      </template>
    </div>
  </section>
</template>

<style scoped>
.pesanan {
  display: flex;
  flex-direction: column;
}
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.list {
  align-self: stretch;
  list-style: none;
  margin: 0;
  padding: 0.5rem 0.75rem;
  max-height: 340px;
  overflow-y: auto;
}
.item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.65rem 0.5rem;
  border-radius: var(--radius-sm);
}
.item:hover {
  background: var(--surface-muted);
}
.item-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}
.item-main {
  flex: 1;
  min-width: 0;
}
.item-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-meta {
  font-size: 12.5px;
  color: var(--text-muted);
}
.item-total {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding: 0.9rem 1.25rem;
  border-top: 1px solid var(--border);
  background: var(--surface-muted);
  border-radius: 0 0 var(--radius) var(--radius);
  font-size: 13.5px;
  color: var(--text-secondary);
}
.summary strong {
  color: var(--text);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}
.list-skeleton {
  align-self: stretch;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.row-skeleton {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
</style>
