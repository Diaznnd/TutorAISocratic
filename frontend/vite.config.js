import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Saat dev, semua /api diteruskan ke backend sehingga tidak perlu mengatur CORS.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:4000' } },
});
