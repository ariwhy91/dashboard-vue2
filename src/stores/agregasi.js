import { defineStore } from 'pinia'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export const useAgregasiStore = defineStore('agregasi', {
  state: () => ({
    cache: {},
    produk: [], // data agregasi terakhir, dipakai bersama oleh kartu ringkasan & grafik
    sedangMemuat: false,
    gagal: false,
  }),
  getters: {
    totalNilai: (state) => state.produk.reduce((sum, d) => sum + (d.total_nilai || 0), 0),
    produkTerlaris: (state) =>
      state.produk.reduce((maks, d) => (!maks || d.total_nilai > maks.total_nilai ? d : maks), null),
    terakhirDiperbarui: (state) => state.cache.produk?.timestamp ?? null,
  },
  actions: {
    // paksa = true melewati cache (dipakai tombol "Muat Ulang").
    async ambilProduk(paksa = false) {
      const lama = this.cache.produk
      const kadaluarsa = !lama || Date.now() - lama.timestamp > 60_000

      if (!paksa && !kadaluarsa) {
        console.log('✅ PAKAI CACHE — tidak fetch ke server')
        this.produk = lama.data
        return lama.data
      }

      console.log('🌐 FETCH BARU ke server...')
      this.sedangMemuat = true
      this.gagal = false
      try {
        const res = await fetch(`${API}/orders/aggregasi/produk`)
        if (!res.ok) throw new Error('Status HTTP: ' + res.status)
        const data = await res.json()
        this.cache.produk = { data, timestamp: Date.now() }
        this.produk = data
        return data
      } catch (error) {
        console.error('Gagal memuat agregasi:', error)
        this.gagal = true
        return this.produk
      } finally {
        this.sedangMemuat = false
      }
    },
  },
})
