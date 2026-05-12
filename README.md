# 🏛️ Sistem Administrasi Kelurahan

Aplikasi web full-stack untuk manajemen administrasi kelurahan.
Dibangun dengan **React + Vite** (frontend) dan **Express + Prisma** (backend).

---

## 📋 Daftar Isi

1. [Software yang Dibutuhkan](#1-software-yang-dibutuhkan)
2. [Cara Clone / Download Project](#2-cara-clone--download-project)
3. [Instalasi Lengkap dari Nol](#3-instalasi-lengkap-dari-nol)
4. [Cara Menjalankan Setiap Hari](#4-cara-menjalankan-setiap-hari)
5. [Akun Default](#5-akun-default)
6. [Struktur Folder](#6-struktur-folder)
7. [Catatan Per File](#7-catatan-per-file)
8. [Ganti Database](#8-ganti-database)
9. [Sistem Role & Hak Akses](#9-sistem-role--hak-akses)
10. [Teknologi yang Digunakan](#10-teknologi-yang-digunakan)
11. [Rencana Fitur Berikutnya](#11-rencana-fitur-berikutnya)

---

## 1. Software yang Dibutuhkan

Sebelum mulai, pastikan semua software ini sudah terinstall di komputer kamu.

### ✅ Node.js (wajib)
Runtime JavaScript untuk menjalankan backend dan tools frontend.

- Download di: https://nodejs.org
- Pilih versi **LTS** (Long Term Support) — lebih stabil
- Versi minimum yang dibutuhkan: **Node.js 18+**
- Setelah install, cek dengan perintah:
  ```bash
  node --version
  # harusnya muncul: v18.x.x atau lebih baru

  npm --version
  # harusnya muncul: 9.x.x atau lebih baru
  ```

### ✅ Git (wajib untuk clone dari GitHub)
Untuk mengunduh dan mengelola kode dari repository.

- Download di: https://git-scm.com
- Setelah install, cek:
  ```bash
  git --version
  # harusnya muncul: git version 2.x.x
  ```

### ✅ Code Editor (sangat disarankan)
- **VS Code** → https://code.visualstudio.com (paling populer, gratis)
- **Kiro** → IDE berbasis VS Code dengan AI assistant

### ✅ Browser Modern
- Google Chrome, Firefox, atau Edge (versi terbaru)
- Untuk debugging, gunakan DevTools (tekan F12)

---

## 2. Cara Clone / Download Project

### Opsi A — Clone via Git (disarankan)
```bash
git clone https://github.com/username/kelurahan-app.git
cd kelurahan-app
```

### Opsi B — Download ZIP
1. Buka halaman GitHub repository
2. Klik tombol hijau **Code** → **Download ZIP**
3. Extract ZIP ke folder yang kamu inginkan
4. Buka terminal, masuk ke folder tersebut:
   ```bash
   cd path/ke/folder/kelurahan-app
   ```

---

## 3. Instalasi Lengkap dari Nol

Lakukan langkah ini **hanya sekali** saat pertama kali setup project.

### Langkah 1 — Install semua dependency
```bash
npm run install:all
```
Perintah ini akan install dependency untuk backend dan frontend sekaligus.
Tunggu sampai selesai (bisa 1-3 menit tergantung koneksi internet).

> ⚠️ Kalau perintah di atas error, coba manual:
> ```bash
> cd backend && npm install
> cd ../frontend && npm install
> cd ..
> ```

### Langkah 2 — Buat tabel database
```bash
npm run db:push
```
Perintah ini membuat file database SQLite (`backend/prisma/dev.db`) dan semua tabelnya berdasarkan `schema.prisma`.

### Langkah 3 — Isi data awal (user default)
```bash
npm run db:seed
```
Perintah ini membuat akun user default untuk login pertama kali.

Kalau berhasil, akan muncul:
```
✅ Seed selesai!
   admin  / admin123  → akses penuh
   staff1 / staff123  → kelola data
   warga1 / warga123  → akses terbatas
```

### Langkah 4 — Jalankan aplikasi
```bash
npm run dev
```

Buka browser ke: **http://localhost:5173**

---

## 4. Cara Menjalankan Setiap Hari

Setelah setup selesai, setiap hari cukup jalankan:

```bash
npm run dev
```

dari folder root project (`kelurahan-app`).

Ini akan menjalankan backend dan frontend **sekaligus** di dua terminal terpisah.

| Layanan  | URL                     | Keterangan                    |
|----------|-------------------------|-------------------------------|
| Frontend | http://localhost:5173   | Buka ini di browser           |
| Backend  | http://localhost:5000   | Jangan dibuka di browser      |

> ⚠️ Kalau `npm run dev` dari root tidak mau jalan, buka **2 terminal terpisah**:
>
> Terminal 1 (backend):
> ```bash
> cd backend
> npm run dev
> ```
>
> Terminal 2 (frontend):
> ```bash
> cd frontend
> npm run dev
> ```

---

## 5. Akun Default

| Username | Password   | Role  | Hak Akses                                        |
|----------|------------|-------|--------------------------------------------------|
| admin    | admin123   | Admin | Akses penuh — kelola semua data + user           |
| staff1   | staff123   | Staff | Kelola penduduk & surat, tidak bisa kelola user  |
| warga1   | warga123   | Warga | Buat pengaduan & ajukan surat sendiri            |

> 💡 Untuk menambah atau mengubah user, login sebagai admin lalu buka menu **Manajemen User**.

---

## 6. Struktur Folder

```
kelurahan-app/
│
├── backend/                        ← Server Express (API)
│   ├── prisma/
│   │   ├── schema.prisma           ← Definisi struktur database & tabel
│   │   ├── seed.js                 ← Script isi data awal (user default)
│   │   ├── dev.db                  ← File database SQLite (dibuat otomatis)
│   │   └── migrations/             ← Riwayat perubahan database
│   ├── src/
│   │   ├── index.js                ← Entry point server Express
│   │   ├── middleware/
│   │   │   ├── auth.js             ← Middleware autentikasi & otorisasi role
│   │   │   └── upload.js           ← Middleware upload foto (multer)
│   │   └── routes/
│   │       ├── auth.js             ← Route login
│   │       ├── users.js            ← CRUD user (admin only)
│   │       ├── penduduk.js         ← CRUD data penduduk
│   │       ├── surat.js            ← CRUD surat keterangan
│   │       ├── pengaduan.js        ← CRUD pengaduan masyarakat
│   │       └── dashboard.js        ← Statistik dashboard
│   ├── uploads/                    ← Folder foto pengaduan (dibuat otomatis)
│   └── package.json
│
├── frontend/                       ← Aplikasi React (UI)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            ← Konfigurasi HTTP client
│   │   ├── components/
│   │   │   ├── Layout.jsx          ← Sidebar + header utama
│   │   │   └── Modal.jsx           ← Komponen modal reusable
│   │   ├── pages/
│   │   │   ├── Login.jsx           ← Halaman login
│   │   │   ├── Dashboard.jsx       ← Statistik & chart
│   │   │   ├── Penduduk.jsx        ← Manajemen data penduduk
│   │   │   ├── Surat.jsx           ← Manajemen surat (admin/staff)
│   │   │   ├── Users.jsx           ← Manajemen user (admin only)
│   │   │   ├── Pengaduan.jsx       ← Pengaduan masyarakat
│   │   │   └── AjukanSurat.jsx     ← Ajukan surat (khusus warga)
│   │   ├── App.jsx                 ← Routing utama + route guard
│   │   ├── main.jsx                ← Entry point React
│   │   └── index.css               ← Animasi & style kustom
│   ├── index.html
│   ├── vite.config.js              ← Konfigurasi Vite + proxy API
│   ├── tailwind.config.js          ← Konfigurasi Tailwind CSS
│   └── package.json
│
├── .gitignore                      ← File yang tidak ikut ke GitHub
├── package.json                    ← Script root (jalankan semua sekaligus)
└── README.md                       ← Dokumentasi ini
```

---

## 7. Catatan Per File

### `backend/prisma/schema.prisma`
Definisi **struktur database** — semua tabel dan kolomnya ada di sini.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Tambah kolom baru di tabel       → tambah field, lalu:
                                   npx prisma migrate dev --name nama_perubahan
Tambah tabel baru                → tambah model baru, lalu migrate
Ubah tipe data kolom             → ubah tipe, lalu migrate
Hapus kolom                      → hapus field, lalu migrate ⚠️ data hilang!
```

> ⚠️ Setelah migrate, jalankan `npm run db:seed` kalau data awal perlu diperbarui.

---

### `backend/prisma/seed.js`
Script untuk mengisi **data awal** ke database.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Ganti password default           → ubah string di bcrypt.hash('password_baru', 10)
Tambah user default              → tambah objek baru di array users[]
Tambah data contoh lain          → tambah blok upsert baru
```

Jalankan ulang:
```bash
npm run db:seed
```

> ✅ Aman dijalankan berkali-kali — menggunakan `upsert` sehingga tidak duplikat.

---

### `backend/src/index.js`
**Pintu masuk server Express.** Semua route dan middleware global didaftarkan di sini.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Ganti port server                → ubah PORT (default: 5000)
Tambah route baru                → import file route, tambah app.use('/api/...')
Aktifkan CORS domain tertentu    → ganti cors() dengan cors({ origin: 'https://domain.com' })
```

---

### `backend/src/middleware/auth.js`
Berisi dua middleware penting:

- `authenticate` — cek token JWT, wajib ada di semua route yang butuh login
- `authorize(...roles)` — cek role user, dipakai untuk batasi akses per role

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Ganti secret key JWT             → ubah variabel SECRET (atau set env JWT_SECRET)
Perpanjang masa berlaku token    → ubah '8h' di jwt.sign() → contoh: '24h', '7d'
Tambah role baru                 → tambah string role di authorize()
```

---

### `backend/src/middleware/upload.js`
Konfigurasi **upload foto** menggunakan Multer.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Ubah batas ukuran file           → ubah 5 * 1024 * 1024 (sekarang 5MB)
Tambah format file yang diizinkan → tambah mimetype di array allowed[]
Ganti folder penyimpanan         → ubah nilai uploadDir
Pindah ke cloud (Cloudinary/S3)  → ganti bagian storage dengan SDK cloud
```

---

### `backend/src/routes/auth.js`
Menangani proses **login**.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Tambah field di response login   → tambah field di jwt.sign() dan res.json()
Tambah fitur register            → buat route POST /register (mirip users.js)
```

---

### `backend/src/routes/users.js`
CRUD manajemen user — **hanya admin**.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Izinkan staff kelola user        → ubah authorize('admin') → authorize('admin','staff')
Tambah field user baru           → update schema.prisma dulu, lalu update route ini
```

---

### `backend/src/routes/penduduk.js` & `surat.js`
CRUD data penduduk dan surat keterangan.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Ubah siapa yang bisa hapus       → ubah authorize('admin') di route DELETE
Tambah filter pencarian          → tambah kondisi di objek where{}
Ubah jumlah data per halaman     → ubah nilai default limit di req.query
```

---

### `backend/src/routes/pengaduan.js`
CRUD pengaduan masyarakat + upload foto.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Tambah kategori baru             → tambah di KATEGORI array di Pengaduan.jsx
Izinkan warga hapus pengaduan sendiri → tambah kondisi di route DELETE
Tambah notifikasi email          → tambah logika kirim email setelah POST
```

---

### `frontend/src/api/axios.js`
Konfigurasi **Axios** — semua request HTTP ke backend melewati file ini.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Ganti URL backend                → ubah baseURL
Tambah header global             → tambah di interceptor request
Tangani error global             → tambah di interceptor response
```

---

### `frontend/src/App.jsx`
Konfigurasi **routing** dan **route guard** per role.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Tambah halaman baru              → import komponen, tambah <Route path="..." />
Tambah proteksi role baru        → buat komponen guard baru mirip AdminRoute
Ubah halaman default setelah login → ubah <Route index element={...} />
```

---

### `frontend/src/components/Layout.jsx`
Sidebar navigasi dan header utama.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Tambah menu baru                 → tambah objek di array navItems[]
Sembunyikan menu dari role       → tambah field roles: ['admin'] di objek menu
Ganti warna sidebar              → ubah class from-green-800 to-green-900
Ganti nama aplikasi              → ubah teks "🏛️ Kelurahan"
```

---

### `frontend/src/components/Modal.jsx`
Komponen modal yang **dipakai ulang** di semua halaman.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Ubah ukuran modal                → ubah max-w-2xl (pilihan: max-w-sm, max-w-lg, max-w-4xl)
Ubah kecepatan animasi           → ubah duration-250
Nonaktifkan tutup saat klik luar → hapus onClick={handleClose} di div overlay
```

---

### `frontend/src/index.css`
Semua **animasi kustom** dan class utility ada di sini.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Ubah kecepatan animasi fadeIn    → ubah 0.4s di .animate-fadeInUp
Tambah animasi baru              → buat @keyframes baru + class .animate-namaAnimasi
Ubah efek hover kartu            → ubah translateY(-3px) di .card-hover:hover
Ubah warna shimmer skeleton      → ubah warna di background: linear-gradient(...)
```

---

### `frontend/vite.config.js`
Konfigurasi **Vite** termasuk proxy ke backend.

```
Mau ubah apa?                      Caranya
────────────────────────────────────────────────────────────
Tambah proxy path baru           → tambah entry di objek proxy{}
Ganti port frontend              → tambah server: { port: 3000 }
```

---

## 8. Ganti Database

Saat ini menggunakan **SQLite** (file lokal `backend/prisma/dev.db`).
Cocok untuk development. Untuk production, disarankan pakai PostgreSQL atau MySQL.

### Ganti ke PostgreSQL

**1. Ubah `backend/prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**2. Buat file `backend/.env`:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/kelurahan_db"
```

**3. Jalankan migrasi:**
```bash
cd backend
npx prisma migrate dev --name init
node prisma/seed.js
```

---

### Ganti ke MySQL

**1. Ubah `backend/prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**2. Buat file `backend/.env`:**
```env
DATABASE_URL="mysql://username:password@localhost:3306/kelurahan_db"
```

**3. Jalankan migrasi:**
```bash
cd backend
npx prisma migrate dev --name init
node prisma/seed.js
```

---

### Ganti ke MongoDB

**1. Ubah `backend/prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

> ⚠️ MongoDB tidak pakai `@id @default(autoincrement())`.
> Semua field `id Int` harus diubah ke:
> ```prisma
> id String @id @default(auto()) @map("_id") @db.ObjectId
> ```

**2. Buat file `backend/.env`:**
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/kelurahan_db"
```

**3. Gunakan db push (MongoDB tidak pakai migrate):**
```bash
cd backend
npx prisma db push
node prisma/seed.js
```

---

### Database Online Gratis (untuk deploy)

| Layanan     | Database   | Free Tier | Link                        |
|-------------|------------|-----------|-----------------------------|
| Supabase    | PostgreSQL | ✅        | https://supabase.com        |
| Railway     | PostgreSQL | ✅        | https://railway.app         |
| Neon        | PostgreSQL | ✅        | https://neon.tech           |
| PlanetScale | MySQL      | ✅        | https://planetscale.com     |

Setelah daftar dan buat database, salin **connection string** ke `DATABASE_URL` di file `backend/.env`.

---

## 9. Sistem Role & Hak Akses

| Fitur                | Admin | Staff | Warga          |
|----------------------|-------|-------|----------------|
| Dashboard            | ✅    | ✅    | ✅             |
| Lihat Data Penduduk  | ✅    | ✅    | ❌             |
| Tambah/Edit Penduduk | ✅    | ✅    | ❌             |
| Hapus Penduduk       | ✅    | ❌    | ❌             |
| Kelola Surat         | ✅    | ✅    | ❌             |
| Hapus Surat          | ✅    | ❌    | ❌             |
| Ajukan Surat         | ❌    | ❌    | ✅             |
| Pengaduan            | ✅ semua | ✅ semua | ✅ milik sendiri |
| Update Status Pengaduan | ✅ | ✅   | ❌             |
| Hapus Pengaduan      | ✅    | ❌    | ❌             |
| Manajemen User       | ✅    | ❌    | ❌             |

---

## 10. Teknologi yang Digunakan

### Backend
| Package          | Versi   | Fungsi                              |
|------------------|---------|-------------------------------------|
| express          | ^4.18.2 | Framework server Node.js            |
| @prisma/client   | ^5.10.0 | ORM untuk query database            |
| prisma           | ^5.10.0 | CLI migrasi & generate client       |
| jsonwebtoken     | ^9.0.2  | Autentikasi token JWT               |
| bcryptjs         | ^2.4.3  | Enkripsi password                   |
| multer           | ^2.0.1  | Handle upload file/foto             |
| cors             | ^2.8.5  | Izinkan request dari frontend       |
| nodemon          | ^3.1.0  | Auto-restart server saat dev        |

### Frontend
| Package          | Versi   | Fungsi                              |
|------------------|---------|-------------------------------------|
| react            | ^18.2.0 | UI library utama                    |
| react-dom        | ^18.2.0 | Render React ke browser             |
| react-router-dom | ^6.22.0 | Routing antar halaman               |
| axios            | ^1.6.7  | HTTP client untuk request ke API    |
| recharts         | ^2.12.0 | Komponen chart/grafik               |
| vite             | ^5.1.4  | Build tool & dev server             |
| tailwindcss      | ^3.4.1  | Utility-first CSS framework         |

### Root
| Package      | Versi   | Fungsi                                    |
|--------------|---------|-------------------------------------------|
| concurrently | ^8.2.2  | Jalankan backend + frontend bersamaan     |

---

## 11. Rencana Fitur Berikutnya

- [x] Dashboard statistik
- [x] Manajemen data penduduk
- [x] Manajemen surat keterangan
- [x] Sistem login multi role (Admin / Staff / Warga)
- [x] Pengaduan masyarakat + upload foto bukti
- [x] Ajukan surat online (khusus warga)
- [ ] Notifikasi & Pengumuman kelurahan
- [ ] Manajemen Bantuan Sosial (BLT, sembako, dll)
- [ ] Arsip Digital + Download PDF
- [ ] QR Code verifikasi surat
- [ ] Antrian Online
- [ ] Booking Layanan (KTP, surat, dll)
- [ ] Sistem RT/RW (ketua RT bisa input data sendiri)
