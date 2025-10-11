import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    open: true,
    // 👇 this ensures fallback to index.html for SPA routing in dev mode
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    // 👇 this ensures fallback to index.html for SPA routing in preview mode
    historyApiFallback: true,
  }
})
