import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { authenticate, authorize } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authenticate)

// GET semua berita — semua role bisa baca
// Query: ?page=1&limit=10&kategori=bansos
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, kategori } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const where = {}
  if (kategori) where.kategori = kategori

  const [data, total] = await Promise.all([
    prisma.berita.findMany({
      where,
      skip,
      take: Number(limit),
      // Berita yang di-pin tampil duluan, lalu urut terbaru
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }]
    }),
    prisma.berita.count({ where })
  ])

  res.json({ data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
})

// GET satu berita by id
router.get('/:id', async (req, res) => {
  const data = await prisma.berita.findUnique({ where: { id: Number(req.params.id) } })
  if (!data) return res.status(404).json({ message: 'Berita tidak ditemukan' })
  res.json(data)
})

// POST buat berita baru — hanya admin & staff
// upload.single('foto') memproses file foto sampul (opsional)
router.post('/', authorize('admin', 'staff'), upload.single('foto'), async (req, res) => {
  try {
    const { judul, isi, kategori, pinned } = req.body
    const foto = req.file ? req.file.filename : null

    const data = await prisma.berita.create({
      data: {
        judul,
        isi,
        kategori: kategori || 'pengumuman',
        foto,
        // Simpan nama penulis dari token login agar tetap tampil meski user dihapus
        penulisId: req.user.id,
        penulis: req.user.nama || req.user.username,
        pinned: pinned === 'true' || pinned === true
      }
    })
    res.status(201).json(data)
  } catch (e) {
    if (req.file) fs.unlinkSync(`uploads/${req.file.filename}`)
    res.status(400).json({ message: e.message })
  }
})

// PUT update berita — hanya admin & staff
router.put('/:id', authorize('admin', 'staff'), upload.single('foto'), async (req, res) => {
  try {
    const { judul, isi, kategori, pinned } = req.body
    const existing = await prisma.berita.findUnique({ where: { id: Number(req.params.id) } })
    if (!existing) return res.status(404).json({ message: 'Berita tidak ditemukan' })

    // Kalau ada foto baru, hapus foto lama dari disk
    let foto = existing.foto
    if (req.file) {
      if (existing.foto && fs.existsSync(`uploads/${existing.foto}`)) {
        fs.unlinkSync(`uploads/${existing.foto}`)
      }
      foto = req.file.filename
    }

    const data = await prisma.berita.update({
      where: { id: Number(req.params.id) },
      data: {
        judul,
        isi,
        kategori,
        foto,
        pinned: pinned === 'true' || pinned === true
      }
    })
    res.json(data)
  } catch (e) {
    if (req.file) fs.unlinkSync(`uploads/${req.file.filename}`)
    res.status(400).json({ message: e.message })
  }
})

// DELETE berita — hanya admin & staff
router.delete('/:id', authorize('admin', 'staff'), async (req, res) => {
  try {
    const berita = await prisma.berita.findUnique({ where: { id: Number(req.params.id) } })
    // Hapus foto dari disk kalau ada
    if (berita?.foto && fs.existsSync(`uploads/${berita.foto}`)) {
      fs.unlinkSync(`uploads/${berita.foto}`)
    }
    await prisma.berita.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Berita berhasil dihapus' })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

export default router
