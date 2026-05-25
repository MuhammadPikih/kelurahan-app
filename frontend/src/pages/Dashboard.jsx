import React, { useEffect, useState, useRef, useCallback } from 'react'
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

// Warna untuk PieChart
const COLORS = ['#16a34a', '#4ade80']

// Konfigurasi badge kategori berita
const KATEGORI_CONFIG = {
  pengumuman: { icon: '📢', label: 'Pengumuman',  cls: 'bg-blue-100 text-blue-700'     },
  bansos:     { icon: '🤝', label: 'Bansos',      cls: 'bg-green-100 text-green-700'   },
  kesehatan:  { icon: '🏥', label: 'Kesehatan',   cls: 'bg-red-100 text-red-700'       },
  kegiatan:   { icon: '🎉', label: 'Kegiatan',    cls: 'bg-purple-100 text-purple-700' },
  lainnya:    { icon: '📌', label: 'Lainnya',     cls: 'bg-gray-100 text-gray-600'     },
}

/*
  Komponen BeritaSlider — banner berita otomatis bergeser.

  Cara kerja:
  1. Simpan index slide aktif di state "current"
  2. useEffect pasang interval setiap 4 detik → geser ke slide berikutnya
  3. Saat user klik dot atau tombol panah → reset interval agar tidak loncat
  4. Animasi slide menggunakan CSS transform translateX
     - Semua slide ditaruh dalam satu baris (flex)
     - Container di-clip dengan overflow-hidden
     - translateX digeser sesuai index aktif

  Props:
  - items    : array data berita
  - onNavigate : fungsi navigate ke halaman berita
*/
function BeritaSlider({ items, onNavigate }) {
  const [current, setCurrent] = useState(0)
  // useRef untuk menyimpan referensi interval agar bisa di-clear
  const intervalRef = useRef(null)

  // Fungsi pindah slide — bisa ke depan atau belakang
  const goTo = useCallback((index) => {
    setCurrent((index + items.length) % items.length)
  }, [items.length])

  // Pasang auto-slide setiap 4 detik
  const startInterval = useCallback(() => {
    // Bersihkan interval lama dulu sebelum buat yang baru
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % items.length)
    }, 4000)
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1) return // tidak perlu slide kalau hanya 1 item
    startInterval()
    // Cleanup: hentikan interval saat komponen di-unmount
    return () => clearInterval(intervalRef.current)
  }, [items.length, startInterval])

  // Saat user klik manual → pindah slide + reset timer
  function handleManualNav(index) {
    goTo(index)
    startInterval() // reset interval agar tidak loncat terlalu cepat
  }

  if (items.length === 0) return null

  const item = items[current]
  const cfg  = KATEGORI_CONFIG[item.kategori] || KATEGORI_CONFIG.lainnya

  return (
    /*
      Container slider — tinggi tetap, overflow hidden agar slide
      yang sedang tidak aktif tidak terlihat.
    */
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg animate-fadeInUp"
         style={{ height: '280px' }}>

      {/*
        Track slide — semua slide ditaruh di sini dalam satu baris.
        Lebar track = jumlah slide × 100% lebar container.
        transform translateX menggeser track: slide ke-N = geser -(N × 100/jumlahSlide)%
        
        Contoh 2 slide:
        - Track lebar 200%
        - Slide 1 aktif → translateX(0%)
        - Slide 2 aktif → translateX(-50%) karena 50% dari 200% = 100% viewport
      */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{
          width: `${items.length * 100}%`,
          transform: `translateX(-${(current * 100) / items.length}%)`
        }}
      >
        {items.map((b, i) => {
          const bcfg = KATEGORI_CONFIG[b.kategori] || KATEGORI_CONFIG.lainnya
          return (
            /*
              Tiap slide lebarnya 100% / jumlah slide dari total track.
              Karena track sudah diperlebar, ini setara 100% viewport.
              Contoh: 2 slide → tiap slide 50% dari track 200% = 100% viewport.
            */
            <div
              key={b.id}
              className="relative flex-shrink-0 cursor-pointer"
              style={{ width: `${100 / items.length}%` }}
              onClick={() => onNavigate('/berita')}
            >
              {/* Background: foto atau gradient hijau */}
              {b.foto ? (
                <img
                  src={`/uploads/${b.foto}`}
                  alt={b.judul}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-700 via-green-600 to-emerald-500" />
              )}

              {/*
                Overlay gelap di bawah teks agar teks tetap terbaca
                meski foto terang. Gradient dari transparan ke hitam.
              */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Konten teks di atas overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${bcfg.cls}`}>
                    {bcfg.icon} {bcfg.label}
                  </span>
                  {b.pinned && (
                    <span className="text-xs text-orange-300 font-medium">📌 Disematkan</span>
                  )}
                </div>
                <h2 className="text-white font-bold text-lg leading-snug line-clamp-2 drop-shadow">
                  {b.judul}
                </h2>
                <p className="text-white/70 text-xs mt-1">
                  ✍️ {b.penulis} · {new Date(b.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tombol panah kiri — hanya tampil kalau lebih dari 1 slide */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handleManualNav(current - 1) }}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleManualNav(current + 1) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
          >
            ›
          </button>

          {/*
            Dot indicator di bawah slider.
            Dot aktif lebih lebar (w-6) dan berwarna putih penuh.
            Dot tidak aktif lebih kecil dan transparan.
          */}
          <div className="absolute bottom-3 right-5 flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); handleManualNav(i) }}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/*
            Progress bar di bagian atas slider.
            Lebar berubah dari 0% ke 100% setiap 4 detik.
            "key={current}" memaksa animasi restart setiap slide berganti.
          */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20">
            <div
              key={current}
              className="h-full bg-white/70"
              style={{ animation: 'progressBar 4s linear forwards' }}
            />
          </div>
        </>
      )}
    </div>
  )
}

/*
  Komponen StatCard — kartu statistik kecil.
*/
function StatCard({ icon, label, value, color, delay }) {
  return (
    <div className={`bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 ${color} card-hover animate-fadeInUp ${delay}`}>
      <div className="text-3xl bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800 tabular-nums">{value}</p>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 border-gray-200">
      <div className="skeleton w-14 h-14 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-6 w-16" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [berita, setBerita] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Ambil statistik dan berita terbaru secara paralel (lebih efisien)
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/berita', { params: { limit: 5 } }) // ambil 5 untuk slider
    ]).then(([statsRes, beritaRes]) => {
      setStats(statsRes.data)
      setBerita(beritaRes.data.data)
    }).catch(console.error)
  }, [])

  // Skeleton loading saat data belum ada
  if (!stats) return (
    <div className="space-y-6 animate-fadeIn">
      {/* Skeleton slider */}
      <div className="skeleton rounded-2xl" style={{ height: '280px' }} />
      <div className="skeleton h-7 w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )

  const genderData = [
    { name: 'Laki-laki', value: stats.lakiLaki },
    { name: 'Perempuan', value: stats.perempuan }
  ]
  const suratData = stats.suratPerJenis.map(s => ({ name: s.jenisSurat, total: s._count }))

  return (
    <div className="space-y-6">

      {/*
        ===== SLIDER BERITA — PALING ATAS =====
        Ditampilkan pertama sebelum statistik agar langsung terlihat.
        Kalau belum ada berita, section ini tidak tampil sama sekali.
      */}
      {berita.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 animate-fadeInUp">
            <h2 className="font-semibold text-gray-700">📰 Info & Berita Desa</h2>
            <button
              onClick={() => navigate('/berita')}
              className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Lihat semua →
            </button>
          </div>
          <BeritaSlider items={berita} onNavigate={navigate} />
        </div>
      )}

      {/* ===== JUDUL + KARTU STATISTIK ===== */}
      <h1 className="text-xl font-bold text-gray-800 animate-fadeInUp">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Penduduk" value={stats.totalPenduduk} color="border-green-500"   delay="delay-100" />
        <StatCard icon="📄" label="Total Surat"    value={stats.totalSurat}    color="border-blue-500"    delay="delay-200" />
        <StatCard icon="⏳" label="Surat Pending"  value={stats.suratPending}  color="border-yellow-500"  delay="delay-300" />
        <StatCard icon="✅" label="Surat Selesai"  value={stats.suratSelesai}  color="border-emerald-500" delay="delay-400" />
      </div>

      {/* ===== CHART ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-5 card-hover animate-fadeInUp delay-200">
          <h3 className="font-semibold text-gray-700 mb-4">Komposisi Penduduk</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%" cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                animationBegin={0}
                animationDuration={800}
              >
                {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-5 card-hover animate-fadeInUp delay-300">
          <h3 className="font-semibold text-gray-700 mb-4">Surat per Jenis</h3>
          {suratData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Belum ada data surat</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={suratData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(22,163,74,0.08)' }} />
                <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
