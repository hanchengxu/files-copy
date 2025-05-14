import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  base: './', // 确保生产环境资源路径正确
  server: {
    port: 5173,
    strictPort: true // 如果端口被占用直接退出
  },
  build: {
    outDir: './dist', // 或者 './dist' 如果你想让构建结果在 renderer 目录内
    emptyOutDir: true
  }
})
