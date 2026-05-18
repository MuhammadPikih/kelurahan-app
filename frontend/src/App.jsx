import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Penduduk from './pages/Penduduk'
import Surat from './pages/Surat'
import Users from './pages/Users'
import Pengaduan from './pages/Pengaduan'
import AjukanSurat from './pages/AjukanSurat'
import Berita from './pages/Berita'

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!localStorage.getItem('token')) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/" />
  return children
}

function StaffRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!localStorage.getItem('token')) return <Navigate to="/login" />
  if (!['admin', 'staff'].includes(user.role)) return <Navigate to="/" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />

        {/* Admin & Staff */}
        <Route path="penduduk"  element={<StaffRoute><Penduduk /></StaffRoute>} />
        <Route path="surat"     element={<StaffRoute><Surat /></StaffRoute>} />
        <Route path="users"     element={<AdminRoute><Users /></AdminRoute>} />

        {/* Semua role */}
        <Route path="pengaduan" element={<Pengaduan />} />
        <Route path="berita"    element={<Berita />} />

        {/* Khusus warga */}
        <Route path="ajukan-surat" element={<AjukanSurat />} />
      </Route>
    </Routes>
  )
}
