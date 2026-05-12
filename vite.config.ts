/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// BASE_PATH lets the Vercel build set base to `/` while GitHub Pages keeps `/us-app/`.
const base = process.env.BASE_PATH ?? '/us-app/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
  },
})
