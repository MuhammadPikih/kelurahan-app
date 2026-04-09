import React, { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'

/*
  Halaman ini khusus untuk WARGA mengajukan surat.
  Berbeda dengan Surat.jsx (untuk admin/staff),
  halaman ini lebih sederhana dan fokus pada pengalaman warga.
*/

const JENIS_SURAT = [
  { value: 'Domisili',     icon: '🏠', desc: 'Keterangan tempat tinggal'     },
  { value: 'Tidak Mampu',  icon: '📋', desc: 'Keterangan ekonomi'            },
  { value: 'Usaha',        icon: '🏪', desc: 'Keterangan usaha/bisnis'       },
  { value: 'Kematian',     icon: '🕊️', desc: 'Keterangan kematian'           },
  { value: 'Kelahiran',    icon: '👶', desc: 'Keterangan kelahiran'          },
  { value: 'Pindah',       icon: '🚚', desc: 'Keterangan pindah domisili'    },
  { value: 'Lainnya',      icon: '📄', desc: 'Jenis surat lainnya'           },
]

const STATUS_CONFIG = {
  pending: { cls: 'bg-yellow-100 text-yellow-700', icon: '⏳', label: 'Menunggu'  },
  proses:  { cls: 'bg-blue-100 text-blue-700',     icon: '🔄', label: 'Diproses'  },
  selesai: { cls: 'bg-green-100 text-green-700',   icon: '✅', label: 'Selesai'   },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { cls: 'bg-gray-100 text-gray-600', icon: '❓', label: status }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

export default function AjukanSurat() {
  const [riwayat, setRiwayat]       = useState([])
  const [fetching, setFetching]     = useState(true)
  const [modal, setModal]           = useState(false)
  const [step, setStep]             = useState(1) // step 1: pilih jenis, step 2: isi form
  const [jenisPilihan, setJenisPilihan] = useState('')
  const [form, setForm]             = useState({ keperluan: '', pendudukId: '' })
  const [pendudukSearch, setPendudukSearch] = useState('')
  const [pendudukList, setPendudukList]     = useState([])
  const [loading, setLoading]       = useState(false)

  // Ambil riwayat surat yang pernah diajukan user ini
  const fetchRiwayat = useCallback(async () => {
    setFetching(true)
    try {
      const res = await api.get('/surat', { params: { limit: 20 } })
      setRiwayat(res.data.data)
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => { fetchRiwayat() }, [fetchRiwayat])

  async function searchPenduduk(q) {
    if (!q) return
    const res = await api.get('/penduduk', { params: { search: q, limit: 10 } })
    setPendudukList(res.data.data)
  }

  function openModal() {
    setStep(1)
    setJenisPilihan('')
    setForm({ keperluan: '', pendudukId: '' })
    setPendudukSearch('')
    setPendudukList([])
    setModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.pendudukId) return alert('Pilih data penduduk terlebih dahulu')
    setLoading(true)
    try {
      await api.post('/surat', { ...form, jenisSurat: jenisPilihan })
      setModal(false)
      fetchRiwayat()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengajukan surat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Ajukan Surat</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ajukan pembuatan surat keterangan secara online</p>
        </div>
        <button
          onClick={openModal}
          className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow hover:shadow-md btn-ripple flex items-center gap-2"
        >
          <span>📝</span> Ajukan Surat
        </button>
      </div>

      {/* ===== INFO CARA PENGAJUAN ===== */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fadeInUp delay-100">
        <p className="text-sm font-medium text-green-800 mb-2">📌 Cara Pengajuan:</p>
        <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
          <li>Klik tombol "Ajukan Surat"</li>
          <li>Pilih jenis surat yang dibutuhkan</li>
          <li>Isi data diri dan keperluan</li>
          <li>Tunggu konfirmasi dari petugas kelurahan</li>
        </ol>
      </div>

      {/* ===== RIWAYAT PENGAJUAN ===== */}
      <div className="animate-fadeInUp delay-200">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Riwayat Pengajuan Saya</h2>

        {fetching ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-5 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : riwayat.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
            <span className="text-4xl block mb-2">📭</span>
            <p>Belum ada pengajuan surat</p>
          </div>
        ) : (
          <div className="space-y-3">
            {riwayat.map((item, i) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-4 card-hover animate-fadeInUp border-l-4 border-green-400"
                style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{item.nomorSurat}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="font-medium text-gray-800">{item.jenisSurat}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.keperluan}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      👤 {item.penduduk?.nama} · 🕐 {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MODAL PENGAJUAN — 2 STEP ===== */}
      {modal && (
        <Modal title="📝 Ajukan Surat Keterangan" onClose={() => setModal(false)}>

          {/* STEP 1: Pilih jenis surat */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Pilih jenis surat yang ingin diajukan:</p>
              <div className="grid grid-cols-2 gap-3">
                {JENIS_SURAT.map(j => (
                  /*
                    Setiap jenis surat ditampilkan sebagai kartu.
                    Klik kartu = pilih jenis dan lanjut ke step 2.
                  */
                  <button
                    key={j.value}
                    type="button"
                    onClick={() => { setJenisPilihan(j.value); setStep(2) }}
                    className="p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 text-left transition-all duration-150 hover:scale-[1.02]"
                  >
                    <div className="text-2xl mb-1">{j.icon}</div>
                    <div className="text-sm font-semibold text-gray-700">{j.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{j.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Isi form pengajuan */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tombol kembali ke step 1 */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Ganti jenis surat
              </button>

              {/* Tampilkan jenis surat yang dipilih */}
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <p className="text-xs text-green-600">Jenis Surat Dipilih:</p>
                <p className="font-semibold text-green-800">
                  {JENIS_SURAT.find(j => j.value === jenisPilihan)?.icon} {jenisPilihan}
                </p>
              </div>

              {/* Cari data penduduk */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cari Data Diri (NIK / Nama)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="Ketik nama atau NIK..."
                    value={pendudukSearch}
                    onChange={e => { setPendudukSearch(e.target.value); searchPenduduk(e.target.value) }}
                  />
                  <button type="button" onClick={() => searchPenduduk(pendudukSearch)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors">
                    🔍
                  </button>
                </div>
                {pendudukList.length > 0 && (
                  <div className="border rounded-lg mt-1 max-h-36 overflow-y-auto shadow-sm animate-fadeInUp">
                    {pendudukList.map(p => (
                      <div
                        key={p.id}
                        onClick={() => { setForm({ ...form, pendudukId: p.id }); setPendudukSearch(p.nama); setPendudukList([]) }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-green-50 transition-colors ${form.pendudukId === p.id ? 'bg-green-100' : ''}`}
                      >
                        {p.nama} — <span className="text-gray-400 font-mono text-xs">{p.nik}</span>
                      </div>
                    ))}
                  </div>
                )}
                {form.pendudukId && (
                  <p className="text-xs text-green-600 mt-1 animate-fadeIn">✅ Data diri ditemukan</p>
                )}
              </div>

              {/* Keperluan */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Keperluan / Alasan</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                  rows={3}
                  placeholder="Jelaskan keperluan surat ini..."
                  value={form.keperluan}
                  onChange={e => setForm({ ...form, keperluan: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <button type="button" onClick={() => setModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading || !form.pendudukId}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50 transition-all flex items-center gap-2 btn-ripple">
                  {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Mengajukan...' : '📤 Ajukan Surat'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  )
}
