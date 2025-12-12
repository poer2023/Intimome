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
      }
    };
});
