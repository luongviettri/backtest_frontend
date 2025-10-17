import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174, // Cổng bạn muốn sử dụng
    strictPort: true, // Nếu cổng này bận, Vite sẽ báo lỗi thay vì tự đổi cổng khác

    // THÊM VÀO: Cấu hình proxy
    proxy: {
      // Bất kỳ request nào bắt đầu bằng '/api' sẽ được chuyển tiếp
      '/api': {
        target: 'http://127.0.0.1:8000', // Địa chỉ backend của bạn
        changeOrigin: true, // Cần thiết để proxy hoạt động đúng
      },
    },
  },
})
