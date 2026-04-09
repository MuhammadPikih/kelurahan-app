import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authenticate)

router.get('/stats', async (req, res) => {
  const [totalPenduduk, totalSurat, suratPending, suratSelesai, lakiLaki, perempuan] = await Promise.all([
    prisma.penduduk.count(),
    prisma.surat.count(),
    prisma.surat.count({ where: { status: 'pending' } }),
    prisma.surat.count({ where: { status: 'selesai' } }),
    prisma.penduduk.count({ where: { jenisKelamin: 'Laki-laki' } }),
    prisma.penduduk.count({ where: { jenisKelamin: 'Perempuan' } })
  ])

  const suratPerJenis = await prisma.surat.groupBy({ by: ['jenisSurat'], _count: true })
  const suratBulanIni = await prisma.surat.findMany({
    where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    orderBy: { createdAt: 'asc' }
  })

  res.json({ totalPenduduk, totalSurat, suratPending, suratSelesai, lakiLaki, perempuan, suratPerJenis, suratBulanIni: suratBulanIni.length })
})

export default router
