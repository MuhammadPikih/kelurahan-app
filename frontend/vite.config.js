import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy request API ke backend Express
      '/api': 'http://localhost:5000',
      // Proxy request file upload ke backend juga
      // Tanpa ini, gambar tidak bisa ditampilkan di frontend
      '/uploads': 'http://localhost:5000'
    }
  }
})
