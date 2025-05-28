// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy các yêu cầu bắt đầu bằng '/api' đến backend server của bạn
      // Thay thế 'http://localhost:8080' bằng địa chỉ và cổng backend thực tế
      '/api': {
        target: 'http://localhost:8080', // Giữ nguyên target đến base URL của backend
        changeOrigin: true,
        // <<< Đã sửa: Thêm context path '/project1' vào đường dẫn
        rewrite: (path) => path.replace(/^\/api/, '/project1'),
      },
    },
  },
});