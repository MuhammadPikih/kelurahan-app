import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authenticate)

function generateNomor(jenis) {
  const now = new Date()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `${rand}/KEL/${jenis.toUpperCase().slice(0, 3)}/${now.getMonth() + 1}/${now.getFullYear()}`
}

router.get('/', async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query
  const skip = (Number(page) - 1) * Number(limit)
  const where = {}
  if (status) where.status = status
  if (search) where.OR = [
    { nomorSurat: { contains: search } },
    { penduduk: { nama: { contains: search } } }
  ]
  // Warga hanya lihat surat yang dia ajukan sendiri
  if (req.user.role === 'warga') {
    where.userId = req.user.id
  }
  const [data, total] = await Promise.all([
    prisma.surat.findMany({ where, skip, take: Number(limit), include: { penduduk: true }, orderBy: { createdAt: 'desc' } }),
    prisma.surat.count({ where })
  ])
  res.json({ data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
})

router.get('/:id', async (req, res) => {
  const data = await prisma.surat.findUnique({ where: { id: Number(req.params.id) }, include: { penduduk: true } })
  if (!data) return res.status(404).json({ message: 'Surat tidak ditemukan' })
  res.json(data)
})

router.post('/', authorize('admin', 'staff', 'warga'), async (req, res) => {
  try {
    const nomorSurat = generateNomor(req.body.jenisSurat)
    const data = await prisma.surat.create({
      data: {
        ...req.body,
        nomorSurat,
        pendudukId: Number(req.body.pendudukId),
        userId: req.user.id // simpan siapa yang mengajukan
      }
    })
    res.status(201).json(data)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

router.put('/:id', authorize('admin', 'staff'), async (req, res) => {
  try {
    const data = await prisma.surat.update({ where: { id: Number(req.params.id) }, data: req.body })
    res.json(data)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

router.delete('/:id', authorize('admin'), async (req, res) => {
  await prisma.surat.delete({ where: { id: Number(req.params.id) } })
  res.json({ message: 'Surat berhasil dihapus' })
})

export default router
