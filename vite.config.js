import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' })
  ],
  resolve: {
    alias: {
      // App-specific aliases
      '@business': path.resolve(__dirname, 'Business Management'),
      '@ecommerce': path.resolve(__dirname, 'E-Commerce'),

      // Shared resources
      '@shared': path.resolve(__dirname, 'shared'),

      // Shared Supabase client
      '@supabaseClient': path.resolve(__dirname, 'supabase/client/index.js'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'react-vendor';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('lucide')) return 'lucide';
            if (id.includes('date-fns')) return 'date-fns';
            return 'vendor';
          }
        }
      }
    }
  }
})
