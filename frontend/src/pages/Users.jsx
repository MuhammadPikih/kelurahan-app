import React, { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'

/*
  Konfigurasi tampilan badge per role.
  Memisahkan data tampilan dari logika komponen
  membuat kode lebih mudah diubah.
*/
const ROLE_CONFIG = {
  admin: { cls: 'bg-red-100 text-red-700 border border-red-200',     icon: '👑', label: 'Admin'  },
  staff: { cls: 'bg-blue-100 text-blue-700 border border-blue-200',  icon: '🧑‍💼', label: 'Staff'  },
  warga: { cls: 'bg-gray-100 text-gray-600 border border-gray-200',  icon: '👤', label: 'Warga'  },
}

// Form kosong untuk tambah user baru
const emptyForm = { username: '', password: '', nama: '', role: 'staff' }

/*
  Komponen badge role — menampilkan ikon + label berwarna.
  Props: role = 'admin' | 'staff' | 'warga'
*/
function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || { cls: 'bg-gray-100 text-gray-600', icon: '❓', label: role }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

/*
  Komponen baris tabel user dengan animasi stagger.
  Props:
  - user       : data satu user
  - index      : urutan baris (untuk delay animasi)
  - currentId  : id user yang sedang login (untuk disable tombol hapus diri sendiri)
  - onEdit, onDelete
*/
function UserRow({ user, index, currentId, onEdit, onDelete }) {
  const isSelf = user.id === currentId // apakah ini akun sendiri?

  return (
    <tr
      className="hover:bg-green-50 transition-colors duration-150 animate-fadeInUp"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
    >
      <td className="px-4 py-3">
        {/* Avatar inisial — diambil dari huruf pertama nama */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user.nama ? user.nama[0].toUpperCase() : user.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">{user.nama || '-'}</p>
            {/* Label "Anda" muncul kalau ini akun sendiri */}
            {isSelf && <span className="text-xs text-green-600 font-medium">● Anda</span>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-gray-600">{user.username}</td>
      <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
      <td className="px-4 py-3 text-xs text-gray-400">
        {new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-150 hover:scale-105"
          >
            ✏️ Edit
          </button>
          {/*
            Tombol hapus dinonaktifkan kalau user ini adalah akun sendiri.
            Admin tidak boleh menghapus dirinya sendiri.
          */}
          <button
            onClick={() => onDelete(user.id)}
            disabled={isSelf}
            className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-150 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            🗑️ Hapus
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function Users() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState(emptyForm)
  const [editId, setEditId]   = useState(null)

  /*
    Ambil id user yang sedang login dari localStorage.
    Data ini disimpan saat login di Login.jsx.
    parseInt() karena JWT menyimpan id sebagai number.
  */
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchData = useCallback(async () => {
    setFetching(true)
    try {
      const res = await api.get('/users')
      setData(res.data)
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function openAdd() {
    setForm(emptyForm)
    setEditId(null)
    setModal('form')
  }

  function openEdit(user) {
    // Saat edit, password dikosongkan — hanya diisi kalau mau diubah
    setForm({ username: user.username, password: '', nama: user.nama, role: user.role })
    setEditId(user.id)
    setModal('form')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editId) await api.put(`/users/${editId}`, form)
      else        await api.post('/users', form)
      setModal(null)
      fetchData()
    } catch (err) {
      // Tampilkan pesan error spesifik dari server
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan'
      const status = err.response?.status || ''
      alert(`Error ${status}: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus user ini?')) return
    try {
      await api.delete(`/users/${id}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus')
    }
  }

  // Hitung jumlah user per role untuk ditampilkan di kartu ringkasan
  const countByRole = (role) => data.filter(u => u.role === role).length

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manajemen User</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola akun dan hak akses pengguna</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow hover:shadow-md btn-ripple flex items-center gap-2"
        >
          <span>➕</span> Tambah User
        </button>
      </div>

      {/* ===== KARTU RINGKASAN ROLE ===== */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { role: 'admin', icon: '👑', label: 'Admin',  color: 'border-red-400',  bg: 'bg-red-50',  text: 'text-red-700'  },
          { role: 'staff', icon: '🧑‍💼', label: 'Staff',  color: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' },
          { role: 'warga', icon: '👤', label: 'Warga',  color: 'border-gray-400', bg: 'bg-gray-50', text: 'text-gray-700' },
        ].map((item, i) => (
          /*
            Setiap kartu muncul dengan delay berbeda (stagger effect).
            "card-hover" dari index.css membuat kartu naik saat di-hover.
          */
          <div
            key={item.role}
            className={`bg-white rounded-xl shadow p-4 border-l-4 ${item.color} card-hover animate-fadeInUp`}
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`${item.bg} w-10 h-10 rounded-full flex items-center justify-center text-xl`}>
                {item.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`text-2xl font-bold ${item.text} tabular-nums`}>{countByRole(item.role)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== TABEL USER ===== */}
      <div className="bg-white rounded-xl shadow overflow-hidden animate-fadeInUp delay-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white text-xs uppercase">
              <tr>
                {['Nama', 'Username', 'Role', 'Dibuat', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetching ? (
                // Skeleton loading
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-4 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">👥</span>
                      <p>Belum ada user</p>
                    </div>
                  </td>
                </tr>
              ) : data.map((user, i) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={i}
                  currentId={currentUser.id}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL FORM TAMBAH/EDIT USER ===== */}
      {modal === 'form' && (
        <Modal title={editId ? '✏️ Edit User' : '➕ Tambah User'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nama lengkap */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nama Lengkap</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                placeholder="Nama lengkap user"
                value={form.nama}
                onChange={e => setForm({ ...form, nama: e.target.value })}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                placeholder="Username untuk login"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Password {editId && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                placeholder={editId ? 'Isi untuk mengubah password' : 'Password baru'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required={!editId} // wajib hanya saat tambah user baru
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Role & Hak Akses</label>
              {/*
                Pilihan role ditampilkan sebagai kartu yang bisa diklik,
                bukan dropdown biasa — lebih intuitif dan menarik.
              */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'admin', icon: '👑', label: 'Admin',  desc: 'Akses penuh'       },
                  { value: 'staff', icon: '🧑‍💼', label: 'Staff',  desc: 'Kelola data'       },
                  { value: 'warga', icon: '👤', label: 'Warga',  desc: 'Akses terbatas'    },
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                      form.role === r.value
                        ? 'border-green-500 bg-green-50 scale-[1.02]'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{r.icon}</div>
                    <div className="text-xs font-semibold text-gray-700">{r.label}</div>
                    <div className="text-xs text-gray-400">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tombol aksi */}
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
                disabled={loading}
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
