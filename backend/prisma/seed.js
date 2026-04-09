import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  /*
    Buat 3 user dengan role berbeda untuk testing.
    "upsert" = update kalau sudah ada, create kalau belum.
    Ini aman dijalankan berkali-kali tanpa duplikasi.
  */
  const users = [
    { username: 'admin',  password: 'admin123',  nama: 'Administrator',  role: 'admin'  },
    { username: 'staff1', password: 'staff123',  nama: 'Budi Staff',     role: 'staff'  },
    { username: 'warga1', password: 'warga123',  nama: 'Siti Warga',     role: 'warga'  },
  ]

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10)
    await prisma.user.upsert({
      where:  { username: u.username },
      update: {},
      create: { username: u.username, password: hashed, nama: u.nama, role: u.role }
    })
  }

  // Data penduduk contoh — pakai upsert karena SQLite tidak support skipDuplicates
  const pendudukData = [
    {
      nik: '3201010101010001', nama: 'Budi Santoso',
      tempatLahir: 'Jakarta', tanggalLahir: new Date('1990-01-01'),
      jenisKelamin: 'Laki-laki', agama: 'Islam', statusKawin: 'Kawin',
      pekerjaan: 'Wiraswasta', alamat: 'Jl. Merdeka No. 1', rt: '001', rw: '002'
    },
    {
      nik: '3201010101010002', nama: 'Siti Rahayu',
      tempatLahir: 'Bandung', tanggalLahir: new Date('1995-05-15'),
      jenisKelamin: 'Perempuan', agama: 'Islam', statusKawin: 'Belum Kawin',
      pekerjaan: 'Pegawai Swasta', alamat: 'Jl. Sudirman No. 5', rt: '003', rw: '001'
    }
  ]

  for (const p of pendudukData) {
    await prisma.penduduk.upsert({
      where:  { nik: p.nik },
      update: {},
      create: p
    })
  }

  console.log('✅ Seed selesai!')
  console.log('   admin  / admin123  → akses penuh')
  console.log('   staff1 / staff123  → kelola data, tidak bisa hapus')
  console.log('   warga1 / warga123  → akses terbatas')
}

main().catch(console.error).finally(() => prisma.$disconnect())
