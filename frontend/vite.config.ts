import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Видалено явну конфігурацію css.postcss, 
  // Vite автоматично підхопить postcss.config.js
})
