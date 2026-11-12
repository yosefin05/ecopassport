# EcoPassport Scan Backend Audit

Status: finalisasi demo, tanpa perubahan database remote, SQL remote, deploy, commit, push, scan, atau request Gemini.

## Baseline dan perubahan yang dipertahankan

Branch aktif adalah `main`. Sebelum finalisasi ini sudah terdapat perubahan uncommitted pada:

- `app/api/scan/route.js`
- `app/api/leaderboard/route.js`
- `app/leaderboard/page.js`

Perubahan tersebut tidak dihapus atau ditimpa.

## Perbaikan yang diterapkan

### Scan backend

- Model tetap menggunakan Google GenAI `generateContent` dengan model yang sudah dipilih sebelumnya.
- Validasi file server tetap memeriksa ukuran dan magic bytes JPEG, PNG, serta WEBP.
- Respons Gemini tetap divalidasi sebagai JSON dengan field dan batas nilai yang diharapkan.
- SHA-256 dihitung dari buffer gambar setelah validasi.
- Path Storage dibuat deterministik dari hash gambar dan extension hasil deteksi.
- Upload tetap menggunakan `upsert: false`.
- Konflik Storage duplicate dikembalikan sebagai HTTP 409 sebelum RPC pemberian poin.
- Cleanup Storage sekarang hanya berjalan setelah upload benar-benar berhasil pada request tersebut.
- RPC tetap menjadi satu-satunya jalur penambahan poin dan penyimpanan `action_logs`.
- Jika RPC gagal setelah upload berhasil, cleanup tetap dilakukan sebagai best effort.

### Leaderboard

- Ranking menggunakan competition ranking berdasarkan `green_points`.
- `created_at` dan `id` hanya menjadi tie-breaker untuk urutan tampilan.
- Data podium memuat seluruh pengguna dengan rank 1 sampai 3, termasuk pengguna yang tie.
- Pengguna podium tidak diduplikasi pada daftar utama.
- React key tetap memakai identifier user yang stabil.

## Verifikasi yang sudah dijalankan

- Syntax check berhasil untuk:
  - `app/api/scan/route.js`
  - `app/api/leaderboard/route.js`
  - `app/leaderboard/page.js`
- `git diff --check` berhasil.
- Sanity test SHA-256 berhasil: byte identik menghasilkan hash sama dan byte berbeda menghasilkan hash berbeda.
- Test competition ranking berhasil:
  - `[95, 95, 80]` menghasilkan `[1, 1, 3]`.
  - `[100, 90, 90, 80]` menghasilkan `[1, 2, 2, 4]`.
  - `[95, 95, 95]` menghasilkan `[1, 1, 1]`.
  - Satu user menghasilkan rank `1`.
- Tidak ada request Gemini, scan, atau koneksi remote yang dijalankan selama finalisasi.
- ESLint masih BLOCKED oleh konfigurasi repository: `ERR_PACKAGE_PATH_NOT_EXPORTED` untuk `eslint/config`. Konfigurasi lint tidak diubah karena berada di luar scope.

## Risiko yang belum terselesaikan

### BLOCKED — Identitas user

`user_name` masih dikirim dari browser dan dipercaya oleh backend. Tanpa login/session identity atau perubahan schema, backend tidak dapat membuktikan kepemilikan nama. Menyelesaikan ini membutuhkan keputusan produk dan autentikasi baru.

### BLOCKED — Duplikasi setelah transformasi

SHA-256 mencegah duplikasi byte-identik untuk object path deterministik baru. SHA-256 tidak mendeteksi resize, recompression berbeda, crop ringan, watermark, atau manipulasi visual. pHash/image similarity membutuhkan penyimpanan fingerprint dan kebijakan database.

### BLOCKED — Data lama

Object yang sebelumnya disimpan dengan UUID acak tidak dapat dicocokkan dengan SHA-256 baru karena hash belum disimpan pada `action_logs`.

### BLOCKED — Rate limit dan replay lintas instance

Belum ada rate limit persisten, idempotency key, atau batas scan per user/IP. Implementasi yang benar membutuhkan storage state bersama seperti database, Redis, atau layanan edge.

### BLOCKED — Atomicity Storage dan database

RPC database atomic untuk update user dan insert log, tetapi Storage berada di luar transaksi database. Crash di antara upload dan RPC masih dapat meninggalkan orphan object. Cleanup saat ini hanya best effort.

### BLOCKED — Keputusan poin dan review

Gemini masih memilih `score` secara langsung dan belum ada status `needs_review`. Backend hanya memvalidasi tipe serta rentang nilai. Rubrik poin, confidence threshold, dan review manual memerlukan keputusan produk.

### Dibatasi sesuai instruksi

- Tidak membuat login atau autentikasi baru.
- Tidak mengubah schema, migration, RPC, atau data database.
- Tidak mengubah bucket public/private.
- Tidak menambahkan dependency atau layanan eksternal.
- Tidak mengubah frontend di luar leaderboard.

## Checklist manual sebelum demo

- [ ] Pastikan environment variable server tersedia tanpa menampilkannya di client.
- [ ] Pastikan bucket `eco-actions` tersedia dan kebijakan existing memang sesuai demo.
- [ ] Kirim satu gambar valid dan pastikan hanya satu aktivitas/poin tercatat.
- [ ] Kirim ulang gambar byte-identik dan pastikan API mengembalikan HTTP 409 serta tidak menambah poin.
- [ ] Kirim gambar JPG, PNG, dan WEBP yang valid.
- [ ] Kirim file bukan gambar dengan ekstensi gambar dan pastikan ditolak oleh magic-byte validation.
- [ ] Uji gambar kosong dan gambar di atas batas ukuran.
- [ ] Pastikan respons Gemini valid menghasilkan `success: true` dan RPC menyimpan satu log.
- [ ] Pastikan respons Gemini invalid atau rate-limited tidak menambah poin.
- [ ] Pastikan RPC failure menghapus object yang baru diunggah bila cleanup berhasil.
- [ ] Pastikan leaderboard menampilkan tie sebagai `1, 1, 3`, bukan `1, 2, 3`.
- [ ] Pastikan semua user yang tie pada rank podium terlihat dan tidak memiliki React key duplikat.
- [ ] Jangan menganggap verifikasi identitas, pHash, rate limit persisten, atau atomic Storage/database sudah tersedia.
