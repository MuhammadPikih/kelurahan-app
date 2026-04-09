import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

/*
  Konfigurasi menu navigasi.
  "roles" menentukan siapa yang bisa melihat menu.
  Kalau "roles" tidak ada, menu tampil untuk semua role.
*/
const navItems = [
  { to: '/',             label: 'Dashboard',        icon: '📊', end: true },
  { to: '/penduduk',     label: 'Data Penduduk',    icon: '👥',  roles: ['admin', 'staff'] },
  { to: '/surat',        label: 'Surat Keterangan', icon: '📄',  roles: ['admin', 'staff'] },
  { to: '/users',        label: 'Manajemen User',   icon: '🔐',  roles: ['admin'] },
  { to: '/pengaduan',    label: 'Pengaduan',        icon: '📢' }, // semua role
  { to: '/ajukan-surat', label: 'Ajukan Surat',     icon: '📝',  roles: ['warga'] },
]

const ROLE_BADGE = {
  admin: { cls: 'bg-red-500 text-white',  label: 'Admin' },
  staff: { cls: 'bg-blue-500 text-white', label: 'Staff' },
  warga: { cls: 'bg-gray-500 text-white', label: 'Warga' },
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const roleBadge = ROLE_BADGE[user.role] || { cls: 'bg-gray-400 text-white', label: user.role }

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  // Filter menu sesuai role user yang sedang login
  const visibleNav = navItems.filter(item =>
    !item.roles || item.roles.includes(user.role)
  )

  return (
    <div className="flex h-screen bg-gray-100">

      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-16'}
        bg-gradient-to-b from-green-800 to-green-900
        text-white flex flex-col
        transition-all duration-300 ease-in-out shadow-xl
      `}>

        {/* Header sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-green-700">
          <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            <span className="font-bold text-lg whitespace-nowrap">🏛️ Kelurahan</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:text-green-200 ml-auto transition-transform duration-300 hover:scale-110"
          >
            <span className={`inline-block transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}>◀</span>
          </button>
        </div>

        {/* Menu navigasi */}
        <nav className="flex-1 p-2 space-y-1">
          {visibleNav.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 text-sm font-medium
                animate-slideInLeft
                ${['delay-100','delay-200','delay-300','delay-400','delay-500'][index] || 'delay-400'}
                ${isActive
                  ? 'bg-green-600 text-white shadow-md scale-[1.02]'
                  : 'text-green-100 hover:bg-green-700 hover:translate-x-1'
                }
              `}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar: info user + logout */}
        <div className="p-4 border-t border-green-700">
          <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'h-auto opacity-100 mb-3' : 'h-0 opacity-0'}`}>
            <p className="text-xs text-green-300 mb-0.5">Login sebagai:</p>
            <p className="text-sm text-white font-medium">{user.nama || user.username}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge.cls}`}>
              {roleBadge.label}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-green-200 hover:text-white text-sm transition-all duration-200 hover:translate-x-1"
          >
            <span className="flex-shrink-0">🚪</span>
            <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
              Keluar
            </span>
          </button>
        </div>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between animate-fadeIn">
          <h2 className="text-gray-700 font-semibold">Sistem Administrasi Kelurahan</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{user.nama || user.username}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge.cls}`}>
              {roleBadge.label}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
