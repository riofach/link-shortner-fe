# LinkRio - Frontend

Frontend untuk aplikasi pemendek URL LinkRio menggunakan React, TypeScript, dan Tailwind CSS dengan ShadCN UI.

## Teknologi yang Digunakan

- React 18 dengan TypeScript
- Vite sebagai build tool
- Tailwind CSS untuk styling
- ShadCN UI untuk komponen UI
- React Router untuk routing
- React Query untuk state management dan fetching data
- Axios untuk komunikasi API

## Fitur

- **Halaman Landing**: Menampilkan informasi produk dan fitur
- **Autentikasi**: Register dan login pengguna
- **Dashboard**: Mengelola dan melacak URL pendek
- **Analitik**: Melihat statistik kunjungan URL
- **Fitur URL Pendek**:
  - Pembuatan URL pendek dengan kode otomatis
  - Opsi untuk menggunakan kode kustom
  - Salin URL dengan sekali klik
  - Statistik waktu nyata

## Cara Memulai

### Prasyarat

- Node.js 16.x atau lebih baru
- npm atau yarn

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

## Menghubungkan dengan Backend

Frontend ini dirancang untuk bekerja dengan backend LinkRio. Pastikan Anda telah mengatur dan menjalankan backend sebelum menggunakan frontend. Backend menyediakan API untuk:

- Autentikasi pengguna
- Pembuatan dan pengelolaan URL pendek
- Pengalihan URL
- Analitik dan statistik

## Struktur Direktori

```
frontend/
├── public/            # Asset publik
├── src/               # Kode sumber
│   ├── components/    # Komponen UI
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilitas dan API
│   ├── pages/         # Halaman utama
│   ├── App.tsx        # Komponen root
│   └── main.tsx       # Entry point
├── .env.example       # Template variabel lingkungan
├── index.html         # HTML template
├── package.json       # Dependensi dan skrip
├── tailwind.config.ts # Konfigurasi Tailwind
├── tsconfig.json      # Konfigurasi TypeScript
└── vite.config.ts     # Konfigurasi Vite
```

## Deployment

Untuk men-deploy frontend, Anda dapat menggunakan:

1. Vercel: Sambungkan repositori GitHub Anda dan konfigurasi variabel lingkungan
2. Netlify: Sambungkan repositori GitHub Anda dan konfigurasi variabel lingkungan
3. GitHub Pages: Deploy folder `dist/` menggunakan GitHub Actions

## Kontribusi

1. Fork repositori
2. Buat branch fitur (`git checkout -b fitur-baru`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request
