import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use @ as shortcut for src/
      // Example: import Button from '@/components/ui/Button/Button'
      '@': path.resolve(__dirname, './src'),
    },
  },
})
