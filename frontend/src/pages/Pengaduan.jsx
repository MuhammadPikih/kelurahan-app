import React, { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'

/*
  Konfigurasi kategori pengaduan.
  Setiap kategori punya ikon dan label yang ditampilkan di UI.
*/
const KATEGORI = [
  { value: 'jalan_rusak', icon: '🛣️',  label: 'Jalan Rusak'  },
  { value: 'sampah',      icon: '🗑️',  label: 'Sampah'       },
  { value: 'lampu_mati',  icon: '💡',  label: 'Lampu Mati'   },
  { value: 'lainnya',     icon: '📌',  label: 'Lainnya'      },
]

/*
  Konfigurasi tampilan badge status pengaduan.
*/
const STATUS_CONFIG = {
  menunggu: { cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200', icon: '⏳', label: 'Menunggu' },
  diproses: { cls: 'bg-blue-100 text-blue-700 border border-blue-200',       icon: '🔄', label: 'Diproses' },
  selesai:  { cls: 'bg-green-100 text-green-700 border border-green-200',    icon: '✅', label: 'Selesai'  },
}

const emptyForm = { judul: '', isi: '', kategori: 'jalan_rusak', namaWarga: '', alamat: '' }

// Ambil data user dari localStorage
const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
const isWarga = currentUser.role === 'warga'
const isStaff = currentUser.role === 'admin' || currentUser.role === 'staff'

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { cls: 'bg-gray-100 text-gray-600', icon: '❓', label: status }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function KategoriBadge({ kategori }) {
  const cfg = KATEGORI.find(k => k.value === kategori) || { icon: '📌', label: kategori }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
      {cfg.icon} {cfg.label}
    </span>
  )
}

/*
  Komponen kartu pengaduan — tampilan card untuk warga.
  Admin/staff melihat tabel, warga melihat kartu.
*/
function PengaduanCard({ item, index, onUpdateStatus, onDelete }) {
  return (
    <div
      className="bg-white rounded-xl shadow p-5 card-hover animate-fadeInUp border-l-4 border-yellow-400"
      style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <KategoriBadge kategori={item.kategori} />
            <StatusBadge status={item.status} />
          </div>
          <h3 className="font-semibold text-gray-800 mt-2">{item.judul}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.isi}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            {item.namaWarga && <span>👤 {item.namaWarga}</span>}
            {item.alamat && <span>📍 {item.alamat}</span>}
            <span>🕐 {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Tombol aksi hanya untuk admin & staff */}
        {isStaff && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            {item.status === 'menunggu' && (
              <button
                onClick={() => onUpdateStatus(item.id, 'diproses')}
                className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-150 whitespace-nowrap"
              >
                🔄 Proses
              </button>
            )}
            {item.status === 'diproses' && (
              <button
                onClick={() => onUpdateStatus(item.id, 'selesai')}
                className="text-xs px-2.5 py-1 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-150 whitespace-nowrap"
              >
                ✅ Selesai
              </button>
            )}
            <button
              onClick={() => onDelete(item.id)}
              className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-150"
            >
              🗑️ Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Pengaduan() {
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)

  const fetchData = useCallback(async () => {
    setFetching(true)
    try {
      const res = await api.get('/pengaduan', { params: { status: filterStatus, page, limit: 10 } })
      setData(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } finally {
      setFetching(false)
    }
  }, [filterStatus, page])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/pengaduan', form)
      setModal(false)
      setForm(emptyForm)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim pengaduan')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(id, status) {
    try {
      await api.put(`/pengaduan/${id}`, { status })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal update status')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus pengaduan ini?')) return
    await api.delete(`/pengaduan/${id}`)
    fetchData()
  }

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pengaduan Masyarakat</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isWarga ? 'Laporkan masalah di lingkungan Anda' : `Total ${total} pengaduan masuk`}
          </p>
        </div>
        {/* Semua role bisa buat pengaduan */}
        <button
          onClick={() => { setForm(emptyForm); setModal(true) }}
          className="bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow hover:shadow-md btn-ripple flex items-center gap-2"
        >
          <span>📢</span> Buat Pengaduan
        </button>
      </div>

      {/* ===== FILTER STATUS ===== */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-2 animate-fadeInUp delay-100">
        {[
          { value: '',         label: '🗂️ Semua'    },
          { value: 'menunggu', label: '⏳ Menunggu' },
          { value: 'diproses', label: '🔄 Diproses' },
          { value: 'selesai',  label: '✅ Selesai'  },
        ].map(f => (
          /*
            Filter ditampilkan sebagai tombol pill.
            Tombol aktif punya background hijau.
          */
          <button
            key={f.value}
            onClick={() => { setFilterStatus(f.value); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm transition-all duration-150 ${
              filterStatus === f.value
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ===== DAFTAR PENGADUAN ===== */}
      <div className="space-y-3 animate-fadeInUp delay-200">
        {fetching ? (
          // Skeleton loading
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5">
              <div className="space-y-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
              </div>
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-16 text-center text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl">📭</span>
              <p className="font-medium">Belum ada pengaduan</p>
              {isWarga && <p className="text-sm">Klik "Buat Pengaduan" untuk melaporkan masalah</p>}
            </div>
          </div>
        ) : data.map((item, i) => (
          <PengaduanCard
            key={item.id}
            item={item}
            index={i}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors text-sm">
            ‹ Prev
          </button>
          <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors text-sm">
            Next ›
          </button>
        </div>
      )}

      {/* ===== MODAL FORM PENGADUAN ===== */}
      {modal && (
        <Modal title="📢 Buat Pengaduan" onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nama warga — warga isi sendiri, admin/staff opsional */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nama Pelapor</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder="Nama lengkap pelapor"
                value={form.namaWarga}
                onChange={e => setForm({ ...form, namaWarga: e.target.value })}
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Alamat / Lokasi Masalah</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder="Contoh: Jl. Merdeka RT 01/02"
                value={form.alamat}
                onChange={e => setForm({ ...form, alamat: e.target.value })}
              />
            </div>

            {/* Kategori — ditampilkan sebagai kartu pilihan */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Kategori Masalah</label>
              <div className="grid grid-cols-4 gap-2">
                {KATEGORI.map(k => (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => setForm({ ...form, kategori: k.value })}
                    className={`p-2 rounded-lg border-2 text-center transition-all duration-150 ${
                      form.kategori === k.value
                        ? 'border-yellow-400 bg-yellow-50 scale-[1.03]'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <div className="text-xl">{k.icon}</div>
                    <div className="text-xs text-gray-600 mt-1 leading-tight">{k.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Judul */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Judul Pengaduan</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder="Ringkasan singkat masalah"
                value={form.judul}
                onChange={e => setForm({ ...form, judul: e.target.value })}
                required
              />
            </div>

            {/* Isi laporan */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Detail Laporan</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all resize-none"
                rows={4}
                placeholder="Jelaskan masalah secara detail..."
                value={form.isi}
                onChange={e => setForm({ ...form, isi: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <button type="button" onClick={() => setModal(false)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button type="submit" disabled={loading}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm disabled:opacity-50 transition-all flex items-center gap-2 btn-ripple">
                {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Mengirim...' : '📢 Kirim Laporan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
