import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

/*
  authenticate dipakai untuk semua route di file ini.
  Artinya semua request harus login dulu.
  Untuk operasi write (POST/PUT/DELETE), ditambah authorize
  agar hanya admin dan staff yang bisa mengubah data.
*/
router.use(authenticate)

// GET semua penduduk
router.get('/', async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query
  const skip = (Number(page) - 1) * Number(limit)
  const where = search
    ? { OR: [{ nama: { contains: search } }, { nik: { contains: search } }] }
    : {}
  const [data, total] = await Promise.all([
    prisma.penduduk.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.penduduk.count({ where })
  ])
  res.json({ data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
})

// GET satu penduduk
router.get('/:id', async (req, res) => {
  const data = await prisma.penduduk.findUnique({ where: { id: Number(req.params.id) } })
  if (!data) return res.status(404).json({ message: 'Penduduk tidak ditemukan' })
  res.json(data)
})

// POST tambah penduduk — hanya admin & staff
router.post('/', authorize('admin', 'staff'), async (req, res) => {
  try {
    const data = await prisma.penduduk.create({ data: { ...req.body, tanggalLahir: new Date(req.body.tanggalLahir) } })
    res.status(201).json(data)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

// PUT update penduduk — hanya admin & staff
router.put('/:id', authorize('admin', 'staff'), async (req, res) => {
  try {
    const data = await prisma.penduduk.update({
      where: { id: Number(req.params.id) },
      data: { ...req.body, tanggalLahir: new Date(req.body.tanggalLahir) }
    })
    res.json(data)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

// DELETE penduduk — hanya admin
router.delete('/:id', authorize('admin'), async (req, res) => {
  await prisma.penduduk.delete({ where: { id: Number(req.params.id) } })
  res.json({ message: 'Penduduk berhasil dihapus' })
})

export default router
