# LinkRio - Frontend Pemendek URL

Frontend modern dan responsif untuk aplikasi LinkRio, pemendek URL dengan fitur analitik dan sistem berlangganan terintegrasi dengan Midtrans.

![LinkRio Logo](https://example.com/linkrio-logo.png)

## Fitur Utama

- **Antarmuka Modern**: UI yang responsif dan elegan dengan Tailwind CSS dan shadcn/ui
- **Dashboard Pro**: Panel analitik komprehensif untuk melihat kunjungan dan performa URL
- **Status Berlangganan**: Pengecekan real-time status langganan dengan indikator visual
- **Pemendek URL**: Form pembuatan URL pendek dengan opsi kode kustom (untuk pengguna Pro)
- **Analitik URL**: Visualisasi kunjungan URL dengan grafik dan statistik
- **Otentikasi Pengguna**: Sistem login dan registrasi dengan JWT
- **Manajemen URL**: Fitur CRUD untuk URL yang dibuat pengguna
- **Integrasi Pembayaran**: Proses pembayaran langganan dengan Midtrans
- **Error Handling**: Penanganan error dengan retry mechanism dan graceful degradation
- **Caching Cerdas**: Sistem cache untuk meminimalkan permintaan API dan meningkatkan responsivitas

## Teknologi yang Digunakan

- **React 18** dengan TypeScript untuk type safety dan developer experience yang lebih baik
- **Vite** sebagai build tool untuk pengembangan yang cepat dan build yang optimal
- **Tailwind CSS** untuk styling yang efisien dan konsisten
- **shadcn/ui** untuk komponen UI berkualitas tinggi dan dapat dikustomisasi
- **React Router v6** untuk navigasi dan routing
- **Axios** untuk komunikasi API dengan backend
- **Lucide React** untuk icon yang konsisten dan berkualitas tinggi
- **React Hook Form** untuk validasi form yang efisien
- **React Query** untuk state management dan data fetching
- **LocalStorage** untuk caching data pengguna dan preferensi

## Arsitektur Aplikasi

```
src/
├── components/     # Komponen UI reusable
│   ├── ui/         # Komponen dasar shadcn/ui
│   ├── layout/     # Komponen layout (Navbar, Footer, dll)
│   └── common/     # Komponen umum aplikasi
├── lib/           # Utilitas, konfigurasi, dan service
│   ├── api.ts     # Konfigurasi axios dan endpoint API
│   └── utils/     # Helper functions
├── hooks/         # Custom React hooks
├── pages/         # Halaman utama aplikasi
├── utils/         # Fungsi utilitas (format, validasi, dll)
├── context/       # React context untuk state global
├── App.tsx        # Komponen utama aplikasi
└── main.tsx       # Entry point aplikasi
```

## Alur Sistem

### 1. Alur Autentikasi:

1. **Register**:

   - Pengguna mengisi form registrasi (email, password, nama)
   - Data dikirim ke endpoint `/auth/register`
   - Setelah berhasil, token JWT disimpan di localStorage
   - Redirect ke Dashboard

2. **Login**:

   - Pengguna mengisi form login (email, password)
   - Data dikirim ke endpoint `/auth/login`
   - Token JWT disimpan di localStorage
   - Redirect ke Dashboard

3. **Logout**:
   - Hapus token dari localStorage
   - Hapus data user dari localStorage
   - Redirect ke halaman utama

### 2. Alur Pembuatan URL Pendek:

1. Pengguna login dan masuk ke Dashboard
2. Mengisi form URL dengan URL original
3. Pengguna Pro dapat menambahkan kode kustom
4. Sistem mengirim request ke `/api/url`
5. URL pendek ditampilkan dan dapat disalin

### 3. Alur Analytics:

1. Pengguna mengklik link analitik di Dashboard
2. Request data analitik ke `/api/url/{code}/stats`
3. Data ditampilkan dalam bentuk grafik dan tabel
4. Data di-cache untuk akses cepat selanjutnya

### 4. Alur Berlangganan Pro:

1. Pengguna mengklik tombol "Upgrade to Pro" di Dashboard atau halaman Pricing
2. Sistem mengirim request ke `/api/subscription`
3. Pengguna diarahkan ke halaman pembayaran Midtrans
4. Setelah pembayaran berhasil, pengguna diarahkan kembali ke halaman success
5. Status langganan diperbarui di UI
6. Menu Pricing disembunyikan untuk pengguna Pro

## Optimasi Performa

1. **Caching Data**: Menyimpan data sementara di localStorage untuk akses cepat
2. **Lazy Loading**: Komponen dimuat sesuai kebutuhan untuk meningkatkan initial load time
3. **React.memo**: Mencegah render ulang komponen yang tidak perlu
4. **Debounce Input**: Mengurangi jumlah request pada input yang sering berubah
5. **Retry Mechanism**: Mengulang request yang gagal dengan exponential backoff
6. **Error Boundary**: Mencegah crash aplikasi saat terjadi error

## Fitur Error Handling

1. **Notification System**: Menampilkan error dengan UI yang user-friendly
2. **Retry Logic**: Mencoba kembali permintaan API yang gagal secara otomatis
3. **Offline Detection**: Mendeteksi status koneksi dan memberikan umpan balik yang sesuai
4. **Graceful Degradation**: Tetap berfungsi dengan kapabilitas terbatas saat terjadi error
5. **Logging**: Mencatat error di console untuk debugging

## Halaman Utama

1. **Landing Page**: Halaman utama dengan penjelasan produk dan CTA
2. **Features**: Menjelaskan fitur-fitur LinkRio secara detail
3. **Pricing**: Menampilkan paket Free dan Pro dengan perbandingan fitur
4. **Login/Register**: Form autentikasi pengguna
5. **Dashboard**: Panel kontrol utama dengan URL management
6. **Analytics**: Halaman detail analitik untuk URL tertentu
7. **Payment**: Halaman status pembayaran (success, pending, error)
8. **User Profile**: Halaman pengaturan profil pengguna

## Komponen Utama

1. **Navbar**: Navigasi dengan menu yang dinamis berdasarkan status login dan langganan
2. **LinkCard**: Komponen untuk menampilkan URL pendek dengan action buttons
3. **CreateLinkForm**: Form untuk membuat URL pendek baru
4. **AnalyticsCard**: Menampilkan statistik dasar URL
5. **SubscriptionBanner**: Menampilkan status langganan dan CTA untuk upgrade
6. **ErrorBoundary**: Menangkap error rendering dan menampilkan fallback UI
7. **WithRetry**: HOC untuk menambahkan retry logic ke komponen data-fetching

## Cara Memulai

### Prasyarat

- Node.js 16.x atau lebih baru
- npm atau yarn
- Backend LinkRio yang berjalan

### Instalasi

1. Clone repositori

   ```bash
   git clone https://github.com/yourusername/link-shorter.git
   cd link-shorter/frontend
   ```

2. Install dependensi

   ```bash
   npm install
   # atau
   yarn
   ```

3. Buat file `.env` dari `.env.example`

   ```bash
   cp .env.example .env
   ```

4. Edit file `.env` dan sesuaikan `VITE_API_URL` dengan URL backend Anda

   ```
   VITE_API_URL=http://localhost:3000
   ```

5. Jalankan server development

   ```bash
   npm run dev
   # atau
   yarn dev
   ```

6. Buka [http://localhost:5173](http://localhost:5173) di browser Anda

### Build untuk Production

1. Build aplikasi

   ```bash
   npm run build
   # atau
   yarn build
   ```

2. Hasil build akan tersedia di folder `dist/`

## Deployment

Untuk men-deploy frontend, Anda dapat menggunakan:

1. **Vercel**: Cara paling cepat dan mudah

   - Connect repositori GitHub Anda
   - Set environment variable `VITE_API_URL`
   - Deploy secara otomatis

2. **Netlify**: Alternatif yang bagus dengan fitur serupa

   - Connect repositori GitHub Anda
   - Set environment variable
   - Tambahkan file `_redirects` di folder `public/` dengan konten:
     ```
     /*    /index.html   200
     ```

3. **GitHub Pages**: Opsi gratis dengan GitHub Actions
   - Setup GitHub Action untuk build dan deploy

## Integrasi dengan Backend

Frontend LinkRio dirancang untuk bekerja dengan backend yang menyediakan API untuk:

1. **Autentikasi**: Register, login, dan verifikasi pengguna
2. **URL Management**: CRUD operasi untuk URL pendek
3. **Analytics**: Statistik penggunaan URL
4. **Subscription**: Manajemen langganan dan pembayaran

Pastikan backend Anda menyediakan endpoint yang sesuai. Lihat `src/lib/api.ts` untuk detail integrasi.

## Debugging & Troubleshooting

### Masalah Umum

1. **CORS Error**:

   - Pastikan backend mengizinkan origin frontend Anda
   - Cek konfigurasi CORS di backend

2. **Token Authentication Failed**:

   - Cek apakah token disimpan dengan benar di localStorage
   - Verifikasi format token di header request

3. **Page Not Found after Refresh**:

   - Tambahkan file `_redirects` untuk Netlify atau konfigurasi server untuk SPA routing

4. **Payment Integration Issues**:
   - Pastikan backend menyediakan URL redirect yang benar
   - Cek konfigurasi webhook di Midtrans dashboard

## Berkontribusi

1. Fork repositori
2. Buat branch fitur (`git checkout -b fitur-baru`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## Catatan Pengembangan

- Style mengikuti Tailwind CSS dengan tema custom LinkRio
- Komponen shadcn/ui dapat dikustomisasi di `components/ui`
- Perhatikan struktur folder untuk menempatkan komponen baru
- Gunakan TypeScript strict mode untuk type safety
- Semua request API harus menggunakan fungsi dari `src/lib/api.ts`
- Implementasikan error handling di setiap komponen yang fetch data

## Lisensi

ISC
