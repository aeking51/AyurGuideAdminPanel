import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'SUPABASE_'],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react'],
          'vendor-qr': ['qrcode']
        }
      }
    }
  },
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
