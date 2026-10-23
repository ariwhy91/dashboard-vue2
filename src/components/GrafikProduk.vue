<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { useAgregasiStore } from '../stores/agregasi.js'
import { rupiah, rupiahRingkas } from '../format.js'
import AppIcon from './AppIcon.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
ChartJS.defaults.font.family = "'Inter', system-ui, sans-serif"
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#475569'

const WARNA_BATANG = '#2a78d6'
const WARNA_BATANG_HOVER = '#1f63b8'

const agregasi = useAgregasiStore()
const params = new URLSearchParams(window.location.search)
const produkFilter = ref(params.get('produk') || 'semua')
const tampilan = ref('grafik') // grafik | tabel

const semuaData = computed(() => agregasi.produk)

// Data terfilter, diurutkan dari nilai terbesar agar mudah dibandingkan.
const dataTampil = computed(() => {
  const data =
    produkFilter.value === 'semua'
      ? semuaData.value
      : semuaData.value.filter((d) => d.produk === produkFilter.value)
  return [...data].sort((a, b) => b.total_nilai - a.total_nilai)
})

const totalSemua = computed(() => agregasi.totalNilai)

const chartData = computed(() => ({
  labels: dataTampil.value.map((d) => d.produk),
  datasets: [
    {
      label: 'Total Nilai',
      data: dataTampil.value.map((d) => d.total_nilai),
      backgroundColor: WARNA_BATANG,
      hoverBackgroundColor: WARNA_BATANG_HOVER,
      borderRadius: 4,
      borderSkipped: 'start',
      barThickness: 'flex',
      maxBarThickness: 32,
      categoryPercentage: 0.7,
    },
  ],
}))

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 500 },
  layout: { padding: { right: 8 } },
  interaction: { mode: 'nearest', axis: 'y', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
      titleFont: { weight: '600', size: 13 },
      bodyFont: { size: 12.5 },
      callbacks: {
        label: (ctx) => {
          const porsi = totalSemua.value ? ((ctx.parsed.x / totalSemua.value) * 100).toFixed(1) : 0
          return [`Total: ${rupiah(ctx.parsed.x)}`, `Porsi: ${porsi}% dari semua produk`]
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: '#eef1f5' },
      ticks: { callback: (v) => rupiahRingkas(v), maxTicksLimit: 6, color: '#94a3b8' },
    },
    y: {
      border: { display: false },
      grid: { display: false },
      ticks: { color: '#334155', font: { weight: '500', size: 12.5 } },
    },
  },
}

// Tinggi grafik mengikuti jumlah batang supaya proporsional (tidak terlalu tinggi/pendek).
const tinggiGrafik = computed(() => Math.max(220, dataTampil.value.length * 52 + 48))

const waktuUpdate = computed(() => {
  if (!agregasi.terakhirDiperbarui) return ''
  return new Date(agregasi.terakhirDiperbarui).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

async function muatData(paksa = false) {
  await agregasi.ambilProduk(paksa)
}

watch(produkFilter, (val) => {
  const url = new URL(window.location)
  url.searchParams.set('produk', val)
  window.history.replaceState({}, '', url)
})

onMounted(() => muatData())
</script>

<template>
  <section class="card">
    <header class="card-header">
      <div>
        <h2 class="card-title">
          <AppIcon name="chart" :size="18" />
          Pendapatan per Produk
        </h2>
        <p class="card-subtitle">
          Total nilai pesanan (Rp)<template v-if="waktuUpdate"> · diperbarui {{ waktuUpdate }}</template>
        </p>
      </div>

      <div class="toolbar">
        <label class="sr-only" for="filter-produk">Filter produk</label>
        <div class="field filter">
          <AppIcon name="filter" :size="15" />
          <select id="filter-produk" v-model="produkFilter" class="select input">
            <option value="semua">Semua Produk</option>
            <option v-for="d in semuaData" :key="d.produk" :value="d.produk">{{ d.produk }}</option>
          </select>
        </div>

        <div class="segmented" role="group" aria-label="Mode tampilan">
          <button
            type="button"
            :class="{ active: tampilan === 'grafik' }"
            :aria-pressed="tampilan === 'grafik'"
            title="Tampilan grafik"
            @click="tampilan = 'grafik'"
          >
            <AppIcon name="chart" :size="16" />
          </button>
          <button
            type="button"
            :class="{ active: tampilan === 'tabel' }"
            :aria-pressed="tampilan === 'tabel'"
            title="Tampilan tabel"
            @click="tampilan = 'tabel'"
          >
            <AppIcon name="table" :size="16" />
          </button>
        </div>

        <button
          type="button"
          class="btn btn-icon"
          title="Muat ulang data"
          aria-label="Muat ulang data"
          :disabled="agregasi.sedangMemuat"
          @click="muatData(true)"
        >
          <AppIcon name="refresh" :size="16" :class="{ spin: agregasi.sedangMemuat }" />
        </button>
      </div>
    </header>

    <div class="card-body">
      <div v-if="agregasi.sedangMemuat && semuaData.length === 0" class="loading">
        <div v-for="i in 4" :key="i" class="skeleton" :style="{ height: '22px', width: `${95 - i * 15}%` }" />
      </div>

      <div v-else-if="agregasi.gagal && semuaData.length === 0" class="state is-error">
        <span class="state-icon"><AppIcon name="alert" :size="22" /></span>
        <p class="state-title">Gagal memuat grafik</p>
        <p class="state-desc">Periksa koneksi ke server, lalu coba lagi.</p>
        <button class="btn" type="button" @click="muatData(true)">
          <AppIcon name="refresh" :size="16" /> Coba lagi
        </button>
      </div>

      <div v-else-if="dataTampil.length === 0" class="state">
        <span class="state-icon"><AppIcon name="inbox" :size="22" /></span>
        <p class="state-title">Belum ada data</p>
        <p class="state-desc">Data penjualan produk akan muncul di sini.</p>
      </div>

      <div
        v-else-if="tampilan === 'grafik'"
        class="chart-wrap"
        :style="{ height: `${tinggiGrafik}px` }"
        role="img"
        aria-label="Grafik batang horizontal total nilai pesanan per produk"
      >
        <Bar :data="chartData" :options="chartOptions" />
      </div>

      <table v-else class="tabel">
        <thead>
          <tr>
            <th>Produk</th>
            <th class="num">Total Nilai</th>
            <th class="num">Porsi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in dataTampil" :key="d.produk">
            <td>{{ d.produk }}</td>
            <td class="num">{{ rupiah(d.total_nilai) }}</td>
            <td class="num">
              <div class="porsi">
                <span class="porsi-bar">
                  <span :style="{ width: `${totalSemua ? (d.total_nilai / totalSemua) * 100 : 0}%` }" />
                </span>
                {{ totalSemua ? ((d.total_nilai / totalSemua) * 100).toFixed(1) : 0 }}%
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.filter {
  min-width: 170px;
}
.filter .select {
  padding-left: 2.1rem;
}
.filter > .icon:first-child {
  left: 0.75rem;
}
.segmented {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
}
.segmented button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 30px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
}
.segmented button.active {
  background: var(--surface);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}
.segmented button:focus-visible {
  outline: none;
  box-shadow: var(--ring);
}
.chart-wrap {
  position: relative;
  width: 100%;
  transition: height 0.25s ease;
}
.loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.tabel {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.tabel th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  padding: 0 0.75rem 0.6rem;
  border-bottom: 1px solid var(--border);
}
.tabel td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
}
.tabel tr:last-child td {
  border-bottom: 0;
}
.tabel tbody tr:hover {
  background: var(--surface-muted);
}
.num {
  text-align: right !important;
  font-variant-numeric: tabular-nums;
}
.porsi {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}
.porsi-bar {
  width: 70px;
  height: 6px;
  border-radius: 99px;
  background: var(--primary-soft);
  overflow: hidden;
}
.porsi-bar span {
  display: block;
  height: 100%;
  background: var(--primary);
  border-radius: 99px;
}

@media (max-width: 560px) {
  .toolbar {
    width: 100%;
  }
  .filter {
    flex: 1;
    min-width: 0;
  }
}
</style>
