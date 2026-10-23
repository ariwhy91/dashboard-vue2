<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const username = ref('')
const password = ref('')
const keadaan = ref('idle') // idle | loading | error
const pesanError = ref('')

async function kirim() {
  keadaan.value = 'loading'
  try {
    await auth.login(username.value, password.value)
    password.value = ''
    keadaan.value = 'idle'
  } catch (error) {
    pesanError.value = error.message
    keadaan.value = 'error'
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="kirim">
    <h2>Masuk</h2>
    <input v-model="username" type="text" placeholder="Username" autocomplete="username" required />
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      autocomplete="current-password"
      required
    />
    <button type="submit" :disabled="keadaan === 'loading'">
      {{ keadaan === 'loading' ? 'Memeriksa...' : 'Masuk' }}
    </button>
    <p v-if="keadaan === 'error'" class="pesan-error">{{ pesanError }}</p>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 20rem;
}
.pesan-error {
  color: #b00020;
}
</style>
