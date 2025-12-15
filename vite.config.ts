import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiTarget = env.VITE_API_BASE || 'http://localhost:8788';
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: mode === 'development' ? {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      } : undefined,
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // Copy public folder contents to dist
    publicDir: 'public',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Split React into its own chunk
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Split heavy charting library
            'recharts': ['recharts'],
            // Split icons library
            'lucide': ['lucide-react'],
          },
        },
      },
      // Enable minification optimizations
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      // Generate source maps for debugging but not in production
      sourcemap: false,
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 600,
    },
  };
});
