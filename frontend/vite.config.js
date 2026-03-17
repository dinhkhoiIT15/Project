import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Đặt cổng 3000 cho giống thói quen cũ
    open: true, // Tự động mở trình duyệt khi chạy server
  },
});