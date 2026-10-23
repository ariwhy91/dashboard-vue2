<script setup>
import { ref, onMounted, watch } from 'vue'
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

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const agregasi = useAgregasiStore()
const chartData = ref({
  labels: [],
  datasets: [{ label: 'Total Nilai (Rp)', data: [], backgroundColor: '#2a78d6' }],
})
const chartOptions = { responsive: true, plugins: { legend: { display: false } } }

const semuaData = ref([]) // data mentah dari API, belum difilter
const params = new URLSearchParams(window.location.search)
const produkFilter = ref(params.get('produk') || 'semua')

function terapkanFilter() {
  const data =
    produkFilter.value === 'semua'
      ? semuaData.value
      : semuaData.value.filter((d) => d.produk === produkFilter.value)
  chartData.value = {
    labels: data.map((d) => d.produk),
    datasets: [
      {
        label: 'Total Nilai (Rp)',
        data: data.map((d) => d.total_nilai),
        backgroundColor: '#2a78d6',
      },
    ],
  }
}

async function muatData() {
  semuaData.value = await agregasi.ambilProduk() // ganti dari fetch() langsung jadi ini
  terapkanFilter()
}

watch(produkFilter, (val) => {
  const url = new URL(window.location)
  url.searchParams.set('produk', val)
  window.history.replaceState({}, '', url)
  terapkanFilter()
})

onMounted(muatData)
</script>

<template>
  <div>
    <label>
      Filter produk:
      <select v-model="produkFilter">
        <option value="semua">Semua Produk</option>
        <option v-for="d in semuaData" :key="d.produk" :value="d.produk">{{ d.produk }}</option>
      </select>
    </label>
    <button @click="muatData">Muat Ulang</button>
    <div role="img" aria-label="Grafik batang total nilai pesanan per produk">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
