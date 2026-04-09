import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Semua route butuh login
router.use(authenticate)

// GET semua pengaduan
// - admin & staff: lihat semua
// - warga: hanya lihat milik sendiri (filter by userId)
router.get('/', async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const where = {}
  if (status) where.status = status

  // Kalau role warga, hanya tampilkan pengaduan milik sendiri
  if (req.user.role === 'warga') {
    where.userId = req.user.id
  }

  const [data, total] = await Promise.all([
    prisma.pengaduan.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.pengaduan.count({ where })
  ])

  res.json({ data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
})

// POST buat pengaduan baru — semua role boleh
router.post('/', async (req, res) => {
  try {
    const { judul, isi, kategori, namaWarga, alamat } = req.body
    const data = await prisma.pengaduan.create({
      data: {
        judul,
        isi,
        kategori: kategori || 'lainnya',
        namaWarga: namaWarga || '',
        alamat: alamat || '',
        userId: req.user.id, // otomatis dari token login
        status: 'menunggu'
      }
    })
    res.status(201).json(data)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

// PUT update status pengaduan — hanya admin & staff
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
router.delete('/:id', authorize('admin'), async (req, res) => {
  await prisma.pengaduan.delete({ where: { id: Number(req.params.id) } })
  res.json({ message: 'Pengaduan berhasil dihapus' })
})

export default router
