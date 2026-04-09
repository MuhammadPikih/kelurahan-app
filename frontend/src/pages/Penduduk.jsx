import React, { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'

/*
  Data awal form — semua field kosong/default.
  Dipakai saat membuka form "Tambah Penduduk".
  Dengan menyimpannya di luar komponen, kita tidak
  perlu mendefinisikan ulang setiap render.
*/
const emptyForm = {
  nik: '', nama: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'Laki-laki',
  agama: 'Islam', statusKawin: 'Belum Kawin', pekerjaan: '', alamat: '', rt: '', rw: '',
  kelurahan: 'Kelurahan Contoh', kecamatan: 'Kecamatan Contoh', kota: 'Kota Contoh'
}

/*
  Komponen badge gender — menampilkan label berwarna
  berdasarkan jenis kelamin.
  Props: value = 'Laki-laki' | 'Perempuan'
*/
function GenderBadge({ value }) {
  const isLaki = value === 'Laki-laki'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      isLaki ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
    }`}>
      {isLaki ? '♂ ' : '♀ '}{value}
    </span>
  )
}

/*
  Komponen baris tabel dengan animasi stagger.
  Setiap baris muncul satu per satu berdasarkan "index".
  Props:
  - row   : data satu penduduk
  - index : urutan baris (untuk delay animasi)
  - onEdit, onDelete : fungsi aksi
*/
function TableRow({ row, index, onEdit, onDelete }) {
  return (
    /*
      "animate-fadeInUp" membuat baris muncul dari bawah.
      style animationDelay dihitung dari index agar efek stagger
      (baris 1 muncul duluan, baris 2 sedikit terlambat, dst).
      Max delay dibatasi 500ms agar tidak terlalu lama.
    */
    <tr
      className="hover:bg-green-50 transition-colors duration-150 animate-fadeInUp"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.nik}</td>
      <td className="px-4 py-3 font-medium text-gray-800">{row.nama}</td>
      <td className="px-4 py-3"><GenderBadge value={row.jenisKelamin} /></td>
      <td className="px-4 py-3 max-w-xs truncate text-gray-600">{row.alamat}</td>
      <td className="px-4 py-3 text-gray-600">{row.rt}/{row.rw}</td>
      <td className="px-4 py-3 text-gray-600">{row.statusKawin}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          {/*
            Tombol Edit dan Hapus punya efek hover scale
            agar terasa lebih interaktif.
          */}
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

/*
  Komponen skeleton baris tabel — ditampilkan saat data sedang dimuat.
  Menggunakan class "skeleton" dari index.css (efek shimmer).
*/
function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function Penduduk() {
  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [editId, setEditId]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true) // state khusus untuk loading tabel

  /*
    useCallback memastikan fungsi fetchData tidak dibuat ulang
    setiap render, kecuali jika search atau page berubah.
    Ini penting agar useEffect tidak loop tak terbatas.
  */
  const fetchData = useCallback(async () => {
    setFetching(true)
    try {
      const res = await api.get('/penduduk', { params: { search, page, limit: 10 } })
      setData(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } finally {
      setFetching(false)
    }
  }, [search, page])

  // Jalankan fetchData setiap kali search atau page berubah
  useEffect(() => { fetchData() }, [fetchData])

  function openAdd() {
    setForm(emptyForm)
    setEditId(null)
    setModal('form')
  }

  function openEdit(row) {
    // slice(0,10) mengambil hanya bagian tanggal "YYYY-MM-DD" dari ISO string
    setForm({ ...row, tanggalLahir: row.tanggalLahir?.slice(0, 10) })
    setEditId(row.id)
    setModal('form')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editId) await api.put(`/penduduk/${editId}`, form)
      else        await api.post('/penduduk', form)
      setModal(null)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus penduduk ini?')) return
    await api.delete(`/penduduk/${id}`)
    fetchData()
  }

  return (
    /*
      "animate-fadeIn" membuat seluruh halaman muncul dengan fade
      saat pertama kali dirender.
    */
    <div className="space-y-4 animate-fadeIn">

      {/* ===== HEADER HALAMAN ===== */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Data Penduduk</h1>
          {/* Counter total penduduk dengan animasi fade */}
          <p className="text-sm text-gray-500 mt-0.5 animate-fadeIn">
            Total {total} penduduk terdaftar
          </p>
        </div>
        {/*
          Tombol tambah dengan efek hover scale dan shadow.
          "btn-ripple" dari index.css menambahkan efek gelombang saat diklik.
        */}
        <button
          onClick={openAdd}
          className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow hover:shadow-md btn-ripple flex items-center gap-2"
        >
          <span className="text-base">➕</span> Tambah Penduduk
        </button>
      </div>

      {/* ===== KOTAK PENCARIAN ===== */}
      <div className="bg-white rounded-xl shadow p-4 animate-fadeInUp delay-100">
        <div className="relative max-w-sm">
          {/* Ikon kaca pembesar di dalam input */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Cari nama atau NIK..."
            className="border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 hover:border-green-400"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* ===== TABEL DATA ===== */}
      <div className="bg-white rounded-xl shadow overflow-hidden animate-fadeInUp delay-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white text-xs uppercase">
              <tr>
                {['NIK', 'Nama', 'Jenis Kelamin', 'Alamat', 'RT/RW', 'Status Kawin', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/*
                Tampilkan skeleton saat data sedang dimuat,
                tampilkan pesan kosong jika tidak ada data,
                atau tampilkan baris data jika sudah ada.
              */}
              {fetching ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">👥</span>
                      <p>Tidak ada data penduduk</p>
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
          <span>Menampilkan {data.length} dari {total} data</span>
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

      {/* ===== MODAL FORM TAMBAH/EDIT ===== */}
      {modal === 'form' && (
        <Modal title={editId ? '✏️ Edit Penduduk' : '➕ Tambah Penduduk'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

            {/* Field input teks — dibuat dengan map agar tidak repetitif */}
            {[
              { label: 'NIK',          key: 'nik',          type: 'text' },
              { label: 'Nama Lengkap', key: 'nama',         type: 'text' },
              { label: 'Tempat Lahir', key: 'tempatLahir',  type: 'text' },
              { label: 'Tanggal Lahir',key: 'tanggalLahir', type: 'date' },
              { label: 'Pekerjaan',    key: 'pekerjaan',    type: 'text' },
              { label: 'Alamat',       key: 'alamat',        type: 'text' },
              { label: 'RT',           key: 'rt',            type: 'text' },
              { label: 'RW',           key: 'rw',            type: 'text' },
              { label: 'Kelurahan',    key: 'kelurahan',     type: 'text' },
              { label: 'Kecamatan',    key: 'kecamatan',     type: 'text' },
              { label: 'Kota',         key: 'kota',          type: 'text' },
            ].map(f => (
              /*
                Field "alamat" diberi col-span-2 agar memenuhi lebar penuh.
                Field lain hanya 1 kolom.
              */
              <div key={f.key} className={f.key === 'alamat' ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 hover:border-green-400"
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  required
                />
              </div>
            ))}

            {/* Field select (dropdown) */}
            {[
              { label: 'Jenis Kelamin', key: 'jenisKelamin', options: ['Laki-laki', 'Perempuan'] },
              { label: 'Agama',         key: 'agama',        options: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'] },
              { label: 'Status Kawin',  key: 'statusKawin',  options: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'] },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                >
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}

            {/* Tombol aksi form */}
            <div className="col-span-2 flex justify-end gap-3 pt-2 border-t">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors duration-150"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50 transition-all duration-200 flex items-center gap-2 btn-ripple"
              >
                {/* Spinner muncul saat loading */}
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
