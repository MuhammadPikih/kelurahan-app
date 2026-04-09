import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()
const prisma = new PrismaClient()
const SECRET = process.env.JWT_SECRET || 'kelurahan_secret_key'

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Username atau password salah' })

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '8h' })
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
})

export default router
