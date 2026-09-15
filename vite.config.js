import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project from /kin-ho-profile/, so assets must not
  // resolve from the domain root.
  base: '/kin-ho-profile/',
  plugins: [react(), tailwindcss()],
})
