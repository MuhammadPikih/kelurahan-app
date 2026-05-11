import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { authenticate, authorize } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = Router()
const prisma = new PrismaClient()

// Semua route butuh login
router.use(authenticate)

// GET semua pengaduan
// - admin & staff : lihat semua
// - warga         : hanya lihat milik sendiri
router.get('/', async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const where = {}
  if (status) where.status = status
  if (req.user.role === 'warga') where.userId = req.user.id

  const [data, total] = await Promise.all([
    prisma.pengaduan.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.pengaduan.count({ where })
  ])

  res.json({ data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
})

/*
  POST buat pengaduan baru dengan foto (opsional).
  
  upload.single('foto') adalah middleware multer.
  Dia memproses file dari field "foto" di form-data,
  menyimpannya ke folder uploads/, lalu mengisi req.file
  dengan info file yang diupload.
  
  Kalau tidak ada foto, req.file = undefined (tidak error).
*/
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { judul, isi, kategori, namaWarga, alamat } = req.body

    // req.file.filename berisi nama file yang sudah disimpan
    // Kalau tidak ada foto, simpan null
    const foto = req.file ? req.file.filename : null

    const data = await prisma.pengaduan.create({
      data: {
        judul,
        isi,
        kategori: kategori || 'lainnya',
        namaWarga: namaWarga || '',
        alamat: alamat || '',
        userId: req.user.id,
        status: 'menunggu',
        foto
      }
    })
    res.status(201).json(data)
  } catch (e) {
    // Kalau ada file yang sudah terupload tapi gagal simpan ke DB,
    // hapus file tersebut agar tidak menumpuk di folder uploads
    if (req.file) fs.unlinkSync(`uploads/${req.file.filename}`)
    res.status(400).json({ message: e.message })
  }
})

// PUT update status — hanya admin & staff
router.put('/:id', authorize('admin', 'staff'), async (req, res) => {
  try {
    const data = await prisma.pengaduan.update({
      where: { id: Number(req.params.id) },
      data: { status: req.body.status }
    })
    res.json(data)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

// DELETE — hanya admin
// Saat hapus pengaduan, hapus juga file fotonya dari disk
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const pengaduan = await prisma.pengaduan.findUnique({ where: { id: Number(req.params.id) } })

    // Hapus file foto dari disk kalau ada
    if (pengaduan?.foto) {
      const filePath = `uploads/${pengaduan.foto}`
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    await prisma.pengaduan.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Pengaduan berhasil dihapus' })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

export default router
