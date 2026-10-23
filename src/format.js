const rupiahFmt = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})
const ringkasFmt = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 })

export const rupiah = (n) => rupiahFmt.format(n || 0)
export const rupiahRingkas = (n) => 'Rp ' + ringkasFmt.format(n || 0)
export const angka = (n) => (n || 0).toLocaleString('id-ID')
