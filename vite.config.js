import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative asset paths work for both user/organisation pages and project pages.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
})
