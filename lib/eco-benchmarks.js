// Nilai poin bersifat tetap dan sepenuhnya ditentukan backend.
// Carbon benchmark hanya diberikan jika foto + asumsi referensi cukup mendukung estimasi.
// Nilai 0 berarti aplikasi tidak mengklaim penghematan karbon dari bukti foto saja.

export const ECO_ACTION_BENCHMARKS = Object.freeze({
  reusable_bottle: {
    label: 'Menggunakan botol pakai ulang',
    points: 10,
    carbonSavedKg: 0.033,
    carbonNote: 'Estimasi benchmark satu kali penggunaan ulang botol 500 ml; hasil aktual bergantung pada jenis botol dan pola penggunaan.',
  },
  waste_sorting: {
    label: 'Memilah sampah',
    points: 15,
    carbonSavedKg: 0,
    carbonNote: 'Belum dihitung: foto tidak menunjukkan jenis dan berat material maupun proses pengolahannya.',
  },
  cycling: {
    label: 'Bersepeda',
    points: 15,
    carbonSavedKg: 0,
    carbonNote: 'Belum dihitung: foto tidak membuktikan jarak perjalanan atau kendaraan yang digantikan.',
  },
  reusable_bag: {
    label: 'Menggunakan tas pakai ulang',
    points: 10,
    carbonSavedKg: 0,
    carbonNote: 'Belum dihitung: manfaat tas pakai ulang bergantung pada jenis tas dan jumlah pemakaian ulang.',
  },
  energy_saving: {
    label: 'Menghemat energi',
    points: 10,
    carbonSavedKg: 0,
    carbonNote: 'Belum dihitung: foto tidak menunjukkan besaran energi (kWh) yang berhasil dihemat.',
  },
});
