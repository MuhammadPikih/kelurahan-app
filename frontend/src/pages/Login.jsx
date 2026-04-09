import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Login() {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      // Simpan token dan data user ke localStorage agar bisa dipakai di halaman lain
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    /*
      Halaman login menggunakan full-screen gradient hijau.
      Kelas "animate-fadeIn" membuat seluruh halaman muncul
      dengan efek fade saat pertama kali dibuka.
    */
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 flex items-center justify-center p-4 animate-fadeIn">

      {/* Lingkaran dekoratif di background — efek visual saja */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-600 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500 rounded-full opacity-10 translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/*
        Kartu login muncul dari bawah ke atas (animate-fadeInUp).
        "relative z-10" supaya kartu tampil di atas lingkaran dekoratif.
      */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-fadeInUp">

        {/* Header kartu */}
        <div className="text-center mb-8">
          {/*
            Ikon bangunan dengan efek "bounce" ringan.
            animate-bounce adalah class bawaan Tailwind.
          */}
          <div className="text-6xl mb-4 inline-block animate-bounce">🏛️</div>
          <h1 className="text-2xl font-bold text-gray-800">Sistem Administrasi</h1>
          <p className="text-green-600 text-sm mt-1 font-medium">Kelurahan</p>
        </div>

        {/* Form login */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Input username */}
          <div className="animate-fadeInUp delay-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              /*
                "transition-all" membuat perubahan style (seperti ring focus)
                bergerak halus, bukan langsung muncul.
              */
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 hover:border-green-400"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          {/* Input password */}
          <div className="animate-fadeInUp delay-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 hover:border-green-400"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Pesan error — muncul dengan animasi fadeIn */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg animate-fadeIn">
              ⚠️ {error}
            </p>
          )}

          {/*
            Tombol submit dengan efek ripple (dari class btn-ripple di CSS).
            "scale-95 active:scale-95" membuat tombol sedikit mengecil saat diklik.
            "disabled:opacity-50" membuat tombol redup saat loading.
          */}
          <div className="animate-fadeInUp delay-300">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 btn-ripple flex items-center justify-center gap-2"
            >
              {/* Ikon spinner muncul saat loading */}
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Masuk...
                </>
              ) : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
