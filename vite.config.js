import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const backendProxy = (apiKey) => ({
  '/api': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: false,
    headers: apiKey ? { 'x-api-key': apiKey } : {},
  },
})

export default defineConfig(({ mode }) => {
  const apiKey = loadEnv(mode, process.cwd(), '').STOCK_API_KEY
  const proxy = backendProxy(apiKey)

  return {
    plugins: [react()],
    server: {
      fs: {
        deny: [
          '.env',
          '.env.*',
          '**/.env',
          '**/.env.*',
          '*.{crt,pem}',
          '**/.git/**',
          '**/server/private/**',
        ],
      },
      proxy,
    },
    preview: { proxy },
  }
})
