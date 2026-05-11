import multer from 'multer'
import path from 'path'
import fs from 'fs'

/*
  Konfigurasi penyimpanan file upload menggunakan multer.
  File disimpan di folder backend/uploads/
  
  Kenapa simpan lokal dan bukan cloud (S3, Cloudinary)?
  → Lebih simpel untuk development & project kecil.
  → Tidak butuh akun/API key tambahan.
  → Kalau nanti mau pindah ke cloud, cukup ganti bagian "storage" ini.
*/

// Pastikan folder uploads ada, kalau belum buat otomatis
const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  // Tentukan folder tujuan simpan file
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  // Buat nama file unik: timestamp + angka acak + ekstensi asli
  // Contoh hasil: 1715000000000-4823.jpg
  // Ini mencegah file dengan nama sama saling menimpa
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 9999)}`
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${unique}${ext}`)
  }
})

/*
  Filter file — hanya izinkan gambar.
  Cek berdasarkan mimetype, bukan ekstensi,
  karena ekstensi bisa dipalsukan.
*/
function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)  // izinkan
  } else {
    cb(new Error('Hanya file gambar (JPG, PNG, WEBP, GIF) yang diizinkan'), false)
  }
}

/*
  Ekspor instance multer yang sudah dikonfigurasi.
  Batas ukuran file: 5MB (5 * 1024 * 1024 bytes).
  
  Cara pakai di route:
    router.post('/', upload.single('foto'), handler)
  
  "foto" adalah nama field di form-data yang berisi file.
*/
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

export default upload
