import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import pendudukRoutes from './routes/penduduk.js'
import suratRoutes from './routes/surat.js'
import dashboardRoutes from './routes/dashboard.js'
import usersRoutes from './routes/users.js'
import pengaduanRoutes from './routes/pengaduan.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

/*
  Serve folder uploads sebagai static files.
  Artinya file di backend/uploads/foto.jpg
  bisa diakses via URL: http://localhost:5000/uploads/foto.jpg
  
  Frontend tinggal pakai: <img src="/uploads/namafile.jpg" />
  (karena Vite proxy /api ke backend, tapi /uploads juga perlu diproxy)
*/
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/penduduk', pendudukRoutes)
app.use('/api/surat', suratRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/pengaduan', pengaduanRoutes)

app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`))
