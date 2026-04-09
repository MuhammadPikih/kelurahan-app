import React, { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'

/*
  Daftar jenis surat yang tersedia.
  Disimpan di luar komponen agar tidak dibuat ulang setiap render.
*/
const JENIS_SURAT = ['Domisili', 'Tidak Mampu', 'Usaha', 'Kematian', 'Kelahiran', 'Pindah', 'Lainnya']

/*
  Konfigurasi tampilan badge status.
  Key = nilai status dari API, value = class Tailwind untuk warna.
*/
const STATUS_CONFIG = {
  pending: { cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200', icon: '⏳', label: 'Pending' },
  proses:  { cls: 'bg-blue-100 text-blue-700 border border-blue-200',       icon: '🔄', label: 'Proses'  },
  selesai: { cls: 'bg-green-100 text-green-700 border border-green-200',    icon: '✅', label: 'Selesai' },
}

// Form kosong untuk "Buat Surat" baru
const emptyForm = { pendudukId: '', jenisSurat: 'Domisili', keperluan: '', status: 'pending' }

/*
  Komponen badge status surat.
  Menampilkan ikon + label dengan warna sesuai status.
  Props: status = 'pending' | 'proses' | 'selesai'
*/
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { cls: 'bg-gray-100 text-gray-600', icon: '❓', label: status }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

/*
  Komponen skeleton baris tabel — ditampilkan saat data sedang dimuat.
  Lebar tiap skeleton dibuat acak agar terlihat lebih natural.
*/
function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded" style={{ width: `${50 + Math.random() * 50}%` }} />
        </td>
      ))}
    </tr>
  )
}

/*
  Komponen baris tabel surat dengan animasi stagger.
  Props:
  - row    : data satu surat
  - index  : urutan baris (untuk delay animasi)
  - onEdit, onDelete : fungsi aksi
*/
function TableRow({ row, index, onEdit, onDelete }) {
  return (
    /*
      Delay animasi dihitung dari index.
      Dibatasi max 500ms agar halaman tidak terasa lambat.
    */
    <tr
      className="hover:bg-green-50 transition-colors duration-150 animate-fadeInUp"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.nomorSurat}</td>
      <td className="px-4 py-3 font-medium text-gray-800">{row.penduduk?.nama}</td>
      <td className="px-4 py-3">
        {/* Badge jenis surat dengan warna hijau muda */}
        <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
          📋 {row.jenisSurat}
        </span>
      </td>
      <td className="px-4 py-3 max-w-xs truncate text-gray-600">{row.keperluan}</td>
      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
      <td className="px-4 py-3 text-gray-500 text-xs">
        {new Date(row.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row)}
            className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-150 hover:scale-105"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(row.id)}
            className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-150 hover:scale-105"
          >
            🗑️ Hapus
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function Surat() {
  const [data, setData]               = useState([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [totalPages, setTotalPages]   = useState(1)
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal]             = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [editId, setEditId]           = useState(null)
  const [loading, setLoading]         = useState(false)
  const [fetching, setFetching]       = useState(true)
  const [pendudukList, setPendudukList] = useState([])
  const [pendudukSearch, setPendudukSearch] = useState('')

  /*
    fetchData dibungkus useCallback agar referensinya stabil.
    Hanya dibuat ulang jika search, filterStatus, atau page berubah.
  */
  const fetchData = useCallback(async () => {
    setFetching(true)
    try {
      const res = await api.get('/surat', { params: { search, status: filterStatus, page, limit: 10 } })
      setData(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } finally {
      setFetching(false)
    }
  }, [search, filterStatus, page])

  useEffect(() => { fetchData() }, [fetchData])

  // Cari penduduk berdasarkan nama/NIK untuk dropdown di form
  async function searchPenduduk(q) {
    if (!q) return
    const res = await api.get('/penduduk', { params: { search: q, limit: 20 } })
    setPendudukList(res.data.data)
  }

  function openAdd() {
    setForm(emptyForm)
    setEditId(null)
    setPendudukList([])
    setPendudukSearch('')
    setModal('form')
  }

  function openEdit(row) {
    setForm({ pendudukId: row.pendudukId, jenisSurat: row.jenisSurat, keperluan: row.keperluan, status: row.status })
    setEditId(row.id)
    setPendudukSearch(row.penduduk?.nama || '')
    setModal('form')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editId) await api.put(`/surat/${editId}`, form)
      else        await api.post('/surat', form)
      setModal(null)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus surat ini?')) return
    await api.delete(`/surat/${id}`)
    fetchData()
  }

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* ===== HEADER HALAMAN ===== */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Surat Keterangan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {total} surat tercatat</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow hover:shadow-md btn-ripple flex items-center gap-2"
        >
          <span className="text-base">📝</span> Buat Surat
        </button>
      </div>

      {/* ===== FILTER & PENCARIAN ===== */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3 animate-fadeInUp delay-100">
        {/* Input pencarian dengan ikon */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Cari nomor surat atau nama..."
            className="border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 hover:border-green-400"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {/*
          Filter status — saat dipilih, tabel langsung difilter.
          Setiap opsi punya warna berbeda menggunakan inline style.
        */}
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
        >
          <option value="">🗂️ Semua Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="proses">🔄 Proses</option>
          <option value="selesai">✅ Selesai</option>
        </select>
      </div>

      {/* ===== TABEL DATA ===== */}
      <div className="bg-white rounded-xl shadow overflow-hidden animate-fadeInUp delay-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white text-xs uppercase">
              <tr>
                {['No. Surat', 'Nama Pemohon', 'Jenis Surat', 'Keperluan', 'Status', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetching ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📄</span>
                      <p>Tidak ada data surat</p>
                    </div>
                  </td>
                </tr>
              ) : data.map((row, i) => (
                <TableRow key={row.id} row={row} index={i} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINATION ===== */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm text-gray-600">
          <span>Menampilkan {data.length} dari {total} surat</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors duration-150"
            >
              ‹ Prev
            </button>
            <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors duration-150"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* ===== MODAL FORM BUAT/EDIT SURAT ===== */}
      {modal === 'form' && (
        <Modal title={editId ? '✏️ Edit Surat' : '📝 Buat Surat Keterangan'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ---- Pencarian Penduduk ---- */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cari Penduduk</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik nama atau NIK..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  value={pendudukSearch}
                  onChange={e => { setPendudukSearch(e.target.value); searchPenduduk(e.target.value) }}
                />
                <button
                  type="button"
                  onClick={() => searchPenduduk(pendudukSearch)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors duration-150"
                >
                  🔍 Cari
                </button>
              </div>

              {/*
                Dropdown hasil pencarian penduduk.
                Muncul hanya jika ada hasil pencarian.
                Saat salah satu dipilih, form.pendudukId diisi
                dan dropdown ditutup.
              */}
              {pendudukList.length > 0 && (
                <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-md animate-fadeInUp">
                  {pendudukList.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setForm({ ...form, pendudukId: p.id })
                        setPendudukSearch(p.nama)
                        setPendudukList([]) // tutup dropdown setelah pilih
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-100 hover:bg-green-50 ${
                        form.pendudukId === p.id ? 'bg-green-100 font-medium' : ''
                      }`}
                    >
                      {p.nama} — <span className="text-gray-400 font-mono text-xs">{p.nik}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Indikator penduduk sudah dipilih */}
              {form.pendudukId && (
                <p className="text-xs text-green-600 mt-1 animate-fadeIn">✅ Penduduk dipilih</p>
              )}
            </div>

            {/* ---- Jenis Surat ---- */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Surat</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                value={form.jenisSurat}
                onChange={e => setForm({ ...form, jenisSurat: e.target.value })}
              >
                {JENIS_SURAT.map(j => <option key={j}>{j}</option>)}
              </select>
            </div>

            {/* ---- Keperluan ---- */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Keperluan</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 resize-none"
                rows={3}
                placeholder="Jelaskan keperluan surat..."
                value={form.keperluan}
                onChange={e => setForm({ ...form, keperluan: e.target.value })}
                required
              />
            </div>

            {/*
              Field status hanya muncul saat mode edit.
              Saat membuat surat baru, status otomatis "pending".
            */}
            {editId && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="proses">🔄 Proses</option>
                  <option value="selesai">✅ Selesai</option>
                </select>
              </div>
            )}

            {/* ---- Tombol Aksi ---- */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors duration-150"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !form.pendudukId}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50 transition-all duration-200 flex items-center gap-2 btn-ripple"
              >
                {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Menyimpan...' : '💾 Simpan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
