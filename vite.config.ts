import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    watch: {
      ignored: ['**/app/**', '**/build/**', '**/.gradle/**', '**/.build-outputs/**', '**/dist/**', '**/.env*']
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  }
});
