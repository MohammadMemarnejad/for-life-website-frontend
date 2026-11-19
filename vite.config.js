import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'https://damizistan.ir',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: 'https://damizistan.ir',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
