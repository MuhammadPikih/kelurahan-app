# Sistem Administrasi Kelurahan

Fullstack JS: React + Vite + TailwindCSS (frontend) | Express + Prisma + SQLite (backend)

## Cara Menjalankan

### Backend
```bash
cd backend
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173

**Login default:** `admin` / `admin123`

## Fitur
- Dashboard statistik (total penduduk, surat, grafik)
- Manajemen data penduduk (CRUD + pagination + search)
- Manajemen surat keterangan (Domisili, Tidak Mampu, Usaha, dll)
- Nomor surat otomatis
- Filter status surat
- Login dengan JWT
