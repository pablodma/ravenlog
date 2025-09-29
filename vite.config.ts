import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ravenlog/shared": path.resolve(__dirname, "./shared/src")
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Simplificar build para Vercel
    rollupOptions: {
      output: {
        // Remover manual chunks - usar build estándar
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000,
  },
})
