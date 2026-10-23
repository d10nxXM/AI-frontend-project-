import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves the app under /<repo>/; the deploy workflow sets BASE_PATH. Locally it is '/'.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
})
