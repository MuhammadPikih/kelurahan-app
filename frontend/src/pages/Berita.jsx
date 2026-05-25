import React, { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'

/*
  Konfigurasi kategori berita.
  Setiap kategori punya warna dan ikon berbeda
  agar mudah dibedakan secara visual.
*/
const KATEGORI_CONFIG = {
  pengumuman: { icon: '📢', label: 'Pengumuman',  cls: 'bg-blue-100 text-blue-700'    },
  bansos:     { icon: '🤝', label: 'Bansos',      cls: 'bg-green-100 text-green-700'  },
  kesehatan:  { icon: '🏥', label: 'Kesehatan',   cls: 'bg-red-100 text-red-700'      },
  kegiatan:   { icon: '🎉', label: 'Kegiatan',    cls: 'bg-purple-100 text-purple-700'},
  lainnya:    { icon: '📌', label: 'Lainnya',     cls: 'bg-gray-100 text-gray-600'    },
}

const emptyForm = { judul: '', isi: '', kategori: 'pengumuman', pinned: false }

// Ambil role user dari localStorage
const getUser = () => JSON.parse(localStorage.getItem('user') || '{}')

function KategoriBadge({ kategori }) {
  const cfg = KATEGORI_CONFIG[kategori] || KATEGORI_CONFIG.lainnya
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

/*
  Komponen kartu berita di daftar.
  Props:
  - item       : data berita
  - index      : urutan untuk delay animasi
  - canManage  : boolean — true kalau user boleh edit/hapus (admin/staff)
  - onEdit, onDelete, onDetail
*/
function BeritaCard({ item, index, canManage, onEdit, onDelete, onDetail }) {
  return (
    <div
      className="bg-white rounded-xl shadow overflow-hidden card-hover animate-fadeInUp"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
    >
      {/* Foto sampul — tampil kalau ada */}
      {item.foto && (
        <img
          src={`/uploads/${item.foto}`}
          alt={item.judul}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-4">
        {/* Baris atas: badge kategori + pin indicator */}
        <div className="flex items-center gap-2 mb-2">
          <KategoriBadge kategori={item.kategori} />
          {item.pinned && (
            <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
              📌 Disematkan
            </span>
          )}
        </div>

        <h3
          className="font-semibold text-gray-800 cursor-pointer hover:text-green-700 transition-colors line-clamp-2"
          onClick={() => onDetail(item)}
        >
          {item.judul}
        </h3>

        {/* Ringkasan isi — potong 120 karakter */}
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {item.isi.length > 120 ? item.isi.slice(0, 120) + '...' : item.isi}
        </p>

        {/* Footer kartu: penulis + tanggal + tombol aksi */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="text-xs text-gray-400">
            <span>✍️ {item.penulis}</span>
            <span className="mx-1">·</span>
            <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          {/*
            Tombol Edit & Hapus hanya tampil kalau canManage = true.
            canManage dikirim dari komponen induk berdasarkan role user.
            Warga tidak akan melihat tombol ini sama sekali.
          */}
          {canManage && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all hover:scale-105"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-xs px-2 py-1 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-all hover:scale-105"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/*
  Modal detail berita — tampilkan isi lengkap.
  Dipakai saat judul diklik.
*/
function DetailModal({ item, onClose }) {
  return (
    <Modal title={item.judul} onClose={onClose}>
      <div className="space-y-4">
        {item.foto && (
          <img src={`/uploads/${item.foto}`} alt={item.judul} className="w-full rounded-lg object-cover max-h-64" />
        )}
        <div className="flex items-center gap-2">
          <KategoriBadge kategori={item.kategori} />
          {item.pinned && <span className="text-xs text-orange-500">📌 Disematkan</span>}
        </div>
        {/* Isi berita ditampilkan dengan whitespace-pre-wrap agar baris baru tetap tampil */}
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.isi}</p>
        <div className="text-xs text-gray-400 pt-2 border-t">
          ✍️ {item.penulis} · {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
      </div>
    </Modal>
  )
}

export default function Berita() {
  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterKategori, setFilterKategori] = useState('')
  const [modal, setModal]         = useState(null) // null | 'form' | 'detail'
  const [detailItem, setDetailItem] = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [fotoFile, setFotoFile]   = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [editId, setEditId]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true)

  const user = getUser()
  // canManage = true hanya untuk admin dan staff
  // Warga hanya bisa membaca berita, tidak bisa tulis/edit/hapus
  const canManage = user.role === 'admin' || user.role === 'staff'

  const fetchData = useCallback(async () => {
    setFetching(true)
    try {
      const res = await api.get('/berita', { params: { kategori: filterKategori, page, limit: 9 } })
      setData(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } finally {
      setFetching(false)
    }
  }, [filterKategori, page])

  useEffect(() => { fetchData() }, [fetchData])

  function openAdd() {
    setForm(emptyForm)
    setFotoFile(null)
    setFotoPreview(null)
    setEditId(null)
    setModal('form')
  }

  function openEdit(item) {
    setForm({ judul: item.judul, isi: item.isi, kategori: item.kategori, pinned: item.pinned })
    setFotoFile(null)
    // Tampilkan foto lama sebagai preview
    setFotoPreview(item.foto ? `/uploads/${item.foto}` : null)
    setEditId(item.id)
    setModal('form')
  }

  function openDetail(item) {
    setDetailItem(item)
    setModal('detail')
  }

  function handleFotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      /*
        Pakai FormData karena ada file foto.
        pinned dikirim sebagai string 'true'/'false'
        karena FormData tidak bisa kirim boolean langsung.
      */
      const fd = new FormData()
      fd.append('judul',    form.judul)
      fd.append('isi',      form.isi)
      fd.append('kategori', form.kategori)
      fd.append('pinned',   String(form.pinned))
      if (fotoFile) fd.append('foto', fotoFile)

      if (editId) await api.put(`/berita/${editId}`, fd)
      else        await api.post('/berita', fd)

      setModal(null)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan berita')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus berita ini?')) return
    try {
      await api.delete(`/berita/${id}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus')
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Info & Berita Desa</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pengumuman, bansos, kegiatan, dan informasi desa</p>
        </div>
        {/* Tombol tambah hanya untuk admin & staff */}
        {canManage && (
          <button
            onClick={openAdd}
            className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow hover:shadow-md btn-ripple flex items-center gap-2"
          >
            <span>✍️</span> Tulis Berita
          </button>
        )}
      </div>

      {/* ===== FILTER KATEGORI ===== */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-2 animate-fadeInUp delay-100">
        <button
          onClick={() => { setFilterKategori(''); setPage(1) }}
          className={`px-3 py-1.5 rounded-full text-sm transition-all duration-150 ${
            filterKategori === '' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🗂️ Semua
        </button>
        {Object.entries(KATEGORI_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => { setFilterKategori(key); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm transition-all duration-150 ${
              filterKategori === key ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {/* ===== GRID BERITA ===== */}
      {fetching ? (
        // Skeleton loading — 3 kartu placeholder
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="skeleton h-40 w-full" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-16 text-center text-gray-400">
          <span className="text-5xl block mb-2">📰</span>
          <p className="font-medium">Belum ada berita</p>
          {canManage && (
            <p className="text-sm mt-1">Klik "Tulis Berita" untuk membuat info pertama</p>
          )}
        </div>
      ) : (
        /*
          Grid responsif:
          - 1 kolom di layar kecil (mobile)
          - 2 kolom di layar sedang (tablet)
          - 3 kolom di layar besar (desktop)
        */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, i) => (
            <BeritaCard
              key={item.id}
              item={item}
              index={i}
              canManage={canManage}
              onEdit={openEdit}
              onDelete={handleDelete}
              onDetail={openDetail}
            />
          ))}
        </div>
      )}

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 animate-fadeIn">
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

      {/* ===== MODAL DETAIL BERITA ===== */}
      {modal === 'detail' && detailItem && (
        <DetailModal item={detailItem} onClose={() => setModal(null)} />
      )}

      {/* ===== MODAL FORM TULIS/EDIT BERITA ===== */}
      {modal === 'form' && (
        <Modal title={editId ? '✏️ Edit Berita' : '✍️ Tulis Berita Baru'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Judul */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Judul Berita</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="Judul berita atau pengumuman"
                value={form.judul}
                onChange={e => setForm({ ...form, judul: e.target.value })}
                required
              />
            </div>

            {/* Kategori — kartu pilihan */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Kategori</label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(KATEGORI_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, kategori: key })}
                    className={`p-2 rounded-lg border-2 text-center transition-all duration-150 ${
                      form.kategori === key
                        ? 'border-green-500 bg-green-50 scale-[1.03]'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-lg">{cfg.icon}</div>
                    <div className="text-xs text-gray-600 mt-0.5 leading-tight">{cfg.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Isi berita */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Isi Berita</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                rows={6}
                placeholder="Tulis isi berita atau pengumuman di sini..."
                value={form.isi}
                onChange={e => setForm({ ...form, isi: e.target.value })}
                required
              />
            </div>

            {/* Foto sampul */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Foto Sampul <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              {fotoPreview ? (
                <div className="relative inline-block">
                  <img src={fotoPreview} alt="Preview" className="h-32 w-full object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => { setFotoFile(null); setFotoPreview(null) }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                  <span className="text-xl">🖼️</span>
                  <span className="text-xs text-gray-500 mt-1">Klik untuk pilih foto sampul</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                </label>
              )}
            </div>

            {/* Toggle pin */}
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <input
                type="checkbox"
                id="pinned"
                checked={form.pinned}
                onChange={e => setForm({ ...form, pinned: e.target.checked })}
                className="w-4 h-4 accent-orange-500"
              />
              <label htmlFor="pinned" className="text-sm text-orange-700 cursor-pointer">
                📌 <strong>Sematkan</strong> — berita ini akan tampil paling atas
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <button type="button" onClick={() => setModal(null)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button type="submit" disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50 transition-all flex items-center gap-2 btn-ripple">
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
