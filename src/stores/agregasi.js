import { defineStore } from 'pinia'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export const useAgregasiStore = defineStore('agregasi', {
  state: () => ({
    cache: {},
    sedangMemuat: false,
  }),
  actions: {
    async ambilProduk() {
      const lama = this.cache.produk
      const kadaluarsa = !lama || Date.now() - lama.timestamp > 60_000

      if (!kadaluarsa) {
        console.log('✅ PAKAI CACHE — tidak fetch ke server')
        return lama.data
      }

      console.log('🌐 FETCH BARU ke server...')
      this.sedangMemuat = true
      const res = await fetch(`${API}/orders/aggregasi/produk`)
      const data = await res.json()
      this.cache.produk = { data, timestamp: Date.now() }
      this.sedangMemuat = false
      return data
    },
  },
})
