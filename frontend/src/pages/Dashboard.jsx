import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import api from '../api/axios'

// Warna untuk chart — dipakai di PieChart
const COLORS = ['#16a34a', '#4ade80']

/*
  Komponen StatCard: kartu statistik kecil di bagian atas dashboard.
  Props:
  - icon    : emoji ikon
  - label   : teks keterangan
  - value   : angka yang ditampilkan
  - color   : class Tailwind untuk warna border kiri
  - delay   : class delay animasi (misal "delay-100")
*/
function StatCard({ icon, label, value, color, delay }) {
  return (
    /*
      "card-hover" adalah class kustom dari index.css
      yang membuat kartu naik saat di-hover.
      "animate-fadeInUp" + delay membuat kartu muncul
      satu per satu (stagger effect).
    */
    <div className={`bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 ${color} card-hover animate-fadeInUp ${delay}`}>
      {/* Ikon dengan background lingkaran */}
      <div className="text-3xl bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        {/*
          Angka ditampilkan besar dan tebal.
          "tabular-nums" membuat angka tidak bergeser saat berubah.
        */}
        <p className="text-2xl font-bold text-gray-800 tabular-nums">{value}</p>
      </div>
    </div>
  )
}

/*
  Komponen SkeletonCard: placeholder saat data belum dimuat.
  Menggunakan class "skeleton" dari index.css yang punya
  efek shimmer (kilap bergerak).
*/
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
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Ambil data statistik dari API saat komponen pertama kali dimuat
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(console.error)
  }, []) // [] = hanya jalan sekali saat mount

  /*
    Tampilkan skeleton loading saat data belum ada.
    Lebih menarik daripada teks "Memuat data..."
  */
  if (!stats) return (
    <div className="space-y-6 animate-fadeIn">
      <div className="skeleton h-7 w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5"><div className="skeleton h-64 w-full" /></div>
        <div className="bg-white rounded-xl shadow p-5"><div className="skeleton h-64 w-full" /></div>
      </div>
    </div>
  )

  // Siapkan data untuk PieChart (komposisi gender)
  const genderData = [
    { name: 'Laki-laki', value: stats.lakiLaki },
    { name: 'Perempuan', value: stats.perempuan }
  ]

  // Siapkan data untuk BarChart (surat per jenis)
  const suratData = stats.suratPerJenis.map(s => ({ name: s.jenisSurat, total: s._count }))

  return (
    <div className="space-y-6">

      {/* Judul halaman dengan animasi masuk */}
      <h1 className="text-xl font-bold text-gray-800 animate-fadeInUp">Dashboard</h1>

      {/* Grid 4 kartu statistik — masing-masing punya delay berbeda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Penduduk" value={stats.totalPenduduk} color="border-green-500"   delay="delay-100" />
        <StatCard icon="📄" label="Total Surat"    value={stats.totalSurat}    color="border-blue-500"    delay="delay-200" />
        <StatCard icon="⏳" label="Surat Pending"  value={stats.suratPending}  color="border-yellow-500"  delay="delay-300" />
        <StatCard icon="✅" label="Surat Selesai"  value={stats.suratSelesai}  color="border-emerald-500" delay="delay-400" />
      </div>

      {/* Grid 2 chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Pie chart komposisi gender */}
        <div className="bg-white rounded-xl shadow p-5 card-hover animate-fadeInUp delay-200">
          <h3 className="font-semibold text-gray-700 mb-4">Komposisi Penduduk</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%" cy="50%"
                outerRadius={80}
                dataKey="value"
                /*
                  "label" adalah fungsi yang menentukan teks di tiap slice.
                  Kita tampilkan nama + nilai.
                */
                label={({ name, value }) => `${name}: ${value}`}
                animationBegin={0}
                animationDuration={800} /* animasi chart selama 800ms */
              >
                {genderData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Bar chart surat per jenis */}
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
                <Bar
                  dataKey="total"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
