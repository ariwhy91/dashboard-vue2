<script setup>
import { ref, computed, watch } from 'vue'
import UserCard from './components/UserCard.vue'
import LoginForm from './components/LoginForm.vue'
import PesananSaya from './components/PesananSaya.vue'
import GrafikProduk from './components/GrafikProduk.vue'
import { useAuthStore } from './stores/auth.js'

const auth = useAuthStore()
const judul = 'Dashboard Vue — Pertemuan 10'
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

// Saat logout (atau sesi berakhir), buang data milik pengguna tadi.
watch(
  () => auth.isLoggedIn,
  (nilai) => {
    if (!nilai) {
      users.value = []
      keadaan.value = 'idle'
      queryPencarian.value = ''
    }
  },
)
</script>

<template>
  <header class="app-header">
    <h1>{{ judul }}</h1>
    <button v-if="auth.isLoggedIn" @click="auth.logout">Keluar</button>
  </header>
  <main class="app-main">
    <LoginForm v-if="!auth.isLoggedIn" />
    <template v-else>
      <PesananSaya />
      <GrafikProduk />
      <button @click="muatPengguna">Muat Pengguna</button>
      <input v-model="queryPencarian" type="text" placeholder="Cari username..." />

      <p v-if="keadaan === 'loading'">Memuat data...</p>
      <p v-else-if="keadaan === 'empty'">Tidak ada pengguna ditemukan.</p>
      <p v-else-if="keadaan === 'error'">Gagal memuat data. Coba lagi.</p>
      <ul v-else-if="keadaan === 'success'">
        <UserCard v-for="user in penggunaTersaring" :key="user.id" :user="user" />
      </ul>
    </template>
  </main>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #0b4f6c;
  color: white;
}
.app-main {
  padding: 1.5rem;
}
</style>
