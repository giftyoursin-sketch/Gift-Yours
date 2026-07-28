import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // App-specific aliases
      '@business': path.resolve(__dirname, 'Business Management'),
      '@ecommerce': path.resolve(__dirname, 'E-Commerce'),

      // Shared resources
      '@shared': path.resolve(__dirname, 'shared'),

      // Shared Supabase client
      // NOTE: Using @supabaseClient to avoid collision with the @supabase npm package
      '@supabaseClient': path.resolve(__dirname, 'supabase/client/index.js'),
    },
  },
})
