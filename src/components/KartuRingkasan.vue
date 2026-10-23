<script setup>
import { computed } from 'vue'
import { useAgregasiStore } from '../stores/agregasi.js'
import { rupiah, angka } from '../format.js'
import AppIcon from './AppIcon.vue'

const agregasi = useAgregasiStore()

const kartu = computed(() => {
  const jumlah = agregasi.produk.length
  const total = agregasi.totalNilai
  const top = agregasi.produkTerlaris
  const porsiTop = top && total ? Math.round((top.total_nilai / total) * 100) : 0
  return [
    {
      label: 'Total Pendapatan',
      nilai: rupiah(total),
      catatan: 'Akumulasi seluruh produk',
      icon: 'wallet',
      tone: 'blue',
    },
    {
      label: 'Jumlah Produk',
      nilai: angka(jumlah),
      catatan: 'Jenis produk dengan transaksi',
      icon: 'package',
      tone: 'violet',
    },
    {
      label: 'Produk Terlaris',
      nilai: top ? top.produk : '—',
      catatan: top ? `${porsiTop}% dari total pendapatan` : 'Belum ada data',
      icon: 'trophy',
      tone: 'amber',
    },
    {
      label: 'Rata-rata per Produk',
      nilai: rupiah(jumlah ? total / jumlah : 0),
      catatan: 'Pendapatan rata-rata',
      icon: 'trending',
      tone: 'green',
    },
  ]
})

const memuatAwal = computed(() => agregasi.sedangMemuat && agregasi.produk.length === 0)
</script>

<template>
  <div class="stats">
    <article v-for="k in kartu" :key="k.label" class="card stat">
      <div class="stat-top">
        <span class="stat-label">{{ k.label }}</span>
        <span class="stat-icon" :class="`tone-${k.tone}`"><AppIcon :name="k.icon" :size="18" /></span>
      </div>
      <div v-if="memuatAwal" class="skeleton" style="height: 28px; width: 70%" />
      <p v-else class="stat-value" :title="k.nilai">{{ k.nilai }}</p>
      <p class="stat-note">{{ k.catatan }}</p>
    </article>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}
.stat {
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}
.stat:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}
.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}
.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}
.stat-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
}
.tone-blue {
  background: var(--primary-soft);
  color: var(--primary);
}
.tone-violet {
  background: var(--violet-soft);
  color: var(--violet);
}
.tone-amber {
  background: var(--warning-soft);
  color: var(--warning);
}
.tone-green {
  background: var(--success-soft);
  color: var(--success);
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stat-note {
  font-size: 12.5px;
  color: var(--text-muted);
}

@media (max-width: 1100px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .stats {
    gap: 0.75rem;
  }
  .stat {
    padding: 0.9rem;
  }
  .stat-icon {
    width: 30px;
    height: 30px;
  }
  .stat-label {
    font-size: 12px;
  }
  .stat-value {
    font-size: 17px;
  }
  .stat-note {
    font-size: 11.5px;
  }
}
</style>
