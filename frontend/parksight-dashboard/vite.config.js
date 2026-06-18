import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react';
          if (id.includes('node_modules/recharts/')) return 'vendor-recharts';
          if (id.includes('node_modules/@vis.gl/react-google-maps/')) return 'vendor-maps';
          if (id.includes('node_modules/lucide-react/')) return 'vendor-lucide';
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
