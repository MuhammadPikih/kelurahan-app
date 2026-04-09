import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

/*
  Semua route di file ini membutuhkan:
  1. authenticate — harus login dulu
  2. authorize('admin') — hanya admin yang boleh akses

  Ini adalah pola "middleware chaining" di Express.
  Middleware dijalankan dari kiri ke kanan sebelum handler.
*/

// GET /api/users — ambil semua user (tanpa password)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, nama: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json(users)
})

// POST /api/users — buat user baru
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { username, password, nama, role } = req.body

  // Validasi role yang diizinkan
  if (!['admin', 'staff', 'warga'].includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid' })
  }

  try {
    // Hash password sebelum disimpan — JANGAN simpan plain text!
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, password: hashed, nama: nama || '', role },
      select: { id: true, username: true, nama: true, role: true, createdAt: true }
    })
    res.status(201).json(user)
  } catch (err) {
    // Kode P2002 = unique constraint violation (username sudah ada)
    if (err.code === 'P2002') return res.status(400).json({ message: 'Username sudah digunakan' })
    res.status(500).json({ message: 'Gagal membuat user' })
  }
})

// PUT /api/users/:id — update user
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { username, password, nama, role } = req.body
  const id = parseInt(req.params.id)

  // Cegah admin menghapus/mengubah role dirinya sendiri
  if (id === req.user.id && role !== 'admin') {
    return res.status(400).json({ message: 'Tidak bisa mengubah role akun sendiri' })
  }

  try {
    // Siapkan data yang akan diupdate
    const data = { username, nama, role }
    // Password hanya diupdate kalau diisi
    if (password) data.password = await bcrypt.hash(password, 10)

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, nama: true, role: true, createdAt: true }
    })
    res.json(user)
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Username sudah digunakan' })
    res.status(500).json({ message: 'Gagal update user' })
  }
})

// DELETE /api/users/:id — hapus user
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const id = parseInt(req.params.id)

  // Admin tidak bisa hapus dirinya sendiri
  if (id === req.user.id) {
    return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' })
  }

  await prisma.user.delete({ where: { id } })
  res.json({ message: 'User berhasil dihapus' })
})

export default router
