import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import postcssTailwind from '@tailwindcss/postcss'  // ← plugin PostCSS
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        postcssTailwind(),   // le plugin PostCSS officiel de Tailwind
        autoprefixer()
      ]
    }
  }
})

