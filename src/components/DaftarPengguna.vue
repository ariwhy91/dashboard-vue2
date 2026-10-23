<script setup>
import { ref, computed, watch } from 'vue'
import UserCard from './UserCard.vue'
import AppIcon from './AppIcon.vue'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const users = ref([])
const keadaan = ref('idle') // idle | loading | empty | error | success

async function muatPengguna() {
  keadaan.value = 'loading'
  try {
    const response = await auth.apiFetch('/users')
    if (!response.ok) {
      throw new Error('Status HTTP: ' + response.status)
    }
    const data = await response.json()
    if (data.length === 0) {
      keadaan.value = 'empty'
      return
    }
    users.value = data
    keadaan.value = 'success'
  } catch (error) {
    console.error('Gagal memuat data:', error)
    keadaan.value = 'error'
  }
}

const queryPencarian = ref('')
const riwayatPencarian = ref([])

const penggunaTersaring = computed(() => {
  const q = queryPencarian.value.toLowerCase().trim()
  if (!q) return users.value
  return users.value.filter((user) => user.username.toLowerCase().includes(q))
})

watch(queryPencarian, (nilaiBaru) => {
  if (nilaiBaru.trim() !== '') {
    riwayatPencarian.value.push(nilaiBaru)
  }
})
</script>

<template>
  <section class="card">
    <header class="card-header">
      <div>
        <h2 class="card-title">
          <AppIcon name="users" :size="18" />
          Pengguna
          <span v-if="keadaan === 'success'" class="badge">{{ penggunaTersaring.length }}</span>
        </h2>
        <p class="card-subtitle">Daftar pengguna terdaftar</p>
      </div>
      <div class="toolbar">
        <div class="field search">
          <AppIcon name="search" :size="16" />
          <input
            v-model="queryPencarian"
            class="input"
            type="search"
            placeholder="Cari username..."
            aria-label="Cari username"
            :disabled="keadaan !== 'success'"
          />
        </div>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="keadaan === 'loading'"
          @click="muatPengguna"
        >
          <AppIcon
            :name="keadaan === 'loading' ? 'loader' : keadaan === 'success' ? 'refresh' : 'download'"
            :size="16"
            :class="{ spin: keadaan === 'loading' }"
          />
          {{ keadaan === 'success' ? 'Muat Ulang' : 'Muat Pengguna' }}
        </button>
      </div>
    </header>

    <div class="card-body">
      <div v-if="keadaan === 'idle'" class="state">
        <span class="state-icon"><AppIcon name="users" :size="22" /></span>
        <p class="state-title">Data pengguna belum dimuat</p>
        <p class="state-desc">Klik "Muat Pengguna" untuk menampilkan daftar.</p>
      </div>
      <div v-else-if="keadaan === 'loading'" class="grid">
        <div v-for="i in 6" :key="i" class="skeleton" style="height: 64px" />
      </div>
      <div v-else-if="keadaan === 'empty'" class="state">
        <span class="state-icon"><AppIcon name="inbox" :size="22" /></span>
        <p class="state-title">Tidak ada pengguna ditemukan</p>
      </div>
      <div v-else-if="keadaan === 'error'" class="state is-error">
        <span class="state-icon"><AppIcon name="alert" :size="22" /></span>
        <p class="state-title">Gagal memuat data</p>
        <p class="state-desc">Coba lagi beberapa saat lagi.</p>
      </div>
      <template v-else>
        <ul v-if="penggunaTersaring.length" class="grid">
          <UserCard v-for="user in penggunaTersaring" :key="user.id" :user="user" />
        </ul>
        <div v-else class="state">
          <span class="state-icon"><AppIcon name="search" :size="22" /></span>
          <p class="state-title">Tidak ada hasil</p>
          <p class="state-desc">Tidak ada username yang cocok dengan "{{ queryPencarian }}".</p>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.search {
  width: 240px;
}
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}
@media (max-width: 560px) {
  .toolbar,
  .search {
    width: 100%;
  }
  .toolbar .btn {
    flex: 1;
  }
}
</style>
