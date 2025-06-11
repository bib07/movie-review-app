import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend server URL
        changeOrigin: true, // Needed for virtual hosting sites
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Rewrite is often optional if target already handles /api
      },
    },
  },
})