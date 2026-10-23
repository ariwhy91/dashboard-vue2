<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import AppIcon from './AppIcon.vue'

const auth = useAuthStore()
const username = ref('')
const password = ref('')
const tampilkanPassword = ref(false)
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

const fitur = [
  { icon: 'chart', teks: 'Grafik penjualan per produk secara real-time' },
  { icon: 'receipt', teks: 'Pantau seluruh pesanan Anda di satu tempat' },
  { icon: 'shield', teks: 'Sesi aman berbasis token' },
]
</script>

<template>
  <div class="login-page">
    <div class="login-shell">
      <aside class="brand-panel">
        <div class="brand">
          <span class="brand-mark"><AppIcon name="zap" :size="18" /></span>
          <span class="brand-name">SalesBoard</span>
        </div>

        <div class="brand-copy">
          <h2>Manage Sales In a Single Dashboard</h2>
          <p>
            Ringkasan pendapatan, performa produk, dan pesanan — semuanya dalam satu dasboardgit
            statu.
          </p>
        </div>

        <ul class="fitur">
          <li v-for="f in fitur" :key="f.teks">
            <span class="fitur-icon"><AppIcon :name="f.icon" :size="16" /></span>
            {{ f.teks }}
          </li>
        </ul>
      </aside>

      <form class="login-form" novalidate @submit.prevent="kirim">
        <div class="form-head">
          <h1>Login Form</h1>
          <p>Masuk ke akun Anda untuk melanjutkan.</p>
        </div>

        <div v-if="keadaan === 'error'" class="alert" role="alert">
          <AppIcon name="alert" :size="18" />
          <span>{{ pesanError }}</span>
        </div>

        <label class="label" for="username">Username</label>
        <div class="field">
          <AppIcon name="user" :size="17" />
          <input
            id="username"
            v-model="username"
            class="input input-lg"
            type="text"
            placeholder="Masukkan username"
            autocomplete="username"
            required
            autofocus
          />
        </div>

        <label class="label" for="password">Password</label>
        <div class="field">
          <AppIcon name="lock" :size="17" />
          <input
            id="password"
            v-model="password"
            class="input input-lg has-toggle"
            :type="tampilkanPassword ? 'text' : 'password'"
            placeholder="Masukkan password"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="toggle-pass"
            :aria-label="tampilkanPassword ? 'Sembunyikan password' : 'Tampilkan password'"
            :aria-pressed="tampilkanPassword"
            @click="tampilkanPassword = !tampilkanPassword"
          >
            <AppIcon :name="tampilkanPassword ? 'eye-off' : 'eye'" :size="17" />
          </button>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-submit"
          :disabled="keadaan === 'loading' || !username || !password"
        >
          <AppIcon v-if="keadaan === 'loading'" name="loader" :size="18" class="spin" />
          <AppIcon v-else name="log-in" :size="18" />
          {{ keadaan === 'loading' ? 'Memeriksa...' : 'Masuk' }}
        </button>

        <p class="form-foot">
          <AppIcon name="shield" :size="14" />
          Sesi berakhir otomatis saat halaman dimuat ulang.
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background:
    radial-gradient(circle at 15% 20%, rgba(42, 120, 214, 0.12), transparent 45%),
    radial-gradient(circle at 85% 80%, rgba(91, 75, 196, 0.1), transparent 45%), var(--bg);
}

.login-shell {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 920px;
  min-height: 540px;
  background: var(--surface);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* ---------- Panel brand ---------- */
.brand-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2.5rem;
  color: #fff;
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.14), transparent 40%),
    linear-gradient(150deg, #1f63b8 0%, var(--brand-dark) 100%);
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.16);
}
.brand-name {
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.01em;
}
.brand-copy {
  margin-top: auto;
}
.brand-copy h2 {
  font-size: 26px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.brand-copy p {
  margin-top: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14.5px;
}
.fitur {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.fitur li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.88);
}
.fitur-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
}

/* ---------- Form ---------- */
.login-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2.75rem 2.5rem;
}
.form-head {
  margin-bottom: 1.75rem;
}
.form-head h1 {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.form-head p {
  margin-top: 0.35rem;
  color: var(--text-secondary);
}
.label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}
.field + .label {
  margin-top: 1rem;
}
.input-lg {
  height: 44px;
  font-size: 14.5px;
}
.input.has-toggle {
  padding-right: 2.75rem;
}
.toggle-pass {
  position: absolute;
  right: 0.35rem;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
}
.toggle-pass:hover {
  color: var(--text);
  background: var(--surface-muted);
}
.toggle-pass:focus-visible {
  outline: none;
  box-shadow: var(--ring);
}
.btn-submit {
  height: 44px;
  margin-top: 1.5rem;
  font-size: 14.5px;
  font-weight: 600;
}
.alert {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  padding: 0.7rem 0.85rem;
  border-radius: var(--radius-sm);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 13.5px;
  font-weight: 500;
}
.form-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 1.5rem;
  font-size: 12.5px;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 760px) {
  .login-shell {
    grid-template-columns: 1fr;
    min-height: 0;
    max-width: 440px;
  }
  .brand-panel {
    padding: 1.5rem 1.75rem;
    gap: 0;
  }
  .brand-copy,
  .fitur {
    display: none;
  }
  .login-form {
    padding: 2rem 1.75rem;
  }
}
</style>
