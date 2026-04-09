import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'kelurahan_secret_key'

/*
  Middleware AUTHENTICATE
  Tugasnya: memastikan request punya token JWT yang valid.
  Cara kerja:
  1. Ambil token dari header "Authorization: Bearer <token>"
  2. Verifikasi token dengan SECRET
  3. Kalau valid, simpan data user ke req.user lalu lanjut (next())
  4. Kalau tidak valid, tolak dengan status 401
*/
export function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token tidak valid' })
  }
}

/*
  Middleware AUTHORIZE
  Tugasnya: memastikan user yang sudah login punya role yang diizinkan.
  Ini adalah "Higher-Order Function" — fungsi yang mengembalikan fungsi lain.

  Cara pakai di route:
    router.delete('/user/:id', authenticate, authorize('admin'), handler)

  Parameter:
  - ...roles : satu atau lebih role yang diizinkan
    Contoh: authorize('admin') atau authorize('admin', 'staff')

  Cara kerja:
  1. authenticate() harus jalan dulu (req.user sudah terisi)
  2. Cek apakah req.user.role ada di dalam array roles
  3. Kalau tidak ada, tolak dengan 403 Forbidden
*/
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        message: `Akses ditolak. Hanya ${roles.join(' / ')} yang diizinkan.`
      })
    }
    next()
  }
}
