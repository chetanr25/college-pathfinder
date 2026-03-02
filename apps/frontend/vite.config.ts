import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true, // Allow requests from ANY domain (true = disable host check)
    host: true,         // Listen on all network interfaces
    port: 5173,         // Default Vite port
  }
})
