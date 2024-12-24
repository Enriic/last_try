// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // Necesario para Ant Design
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './node_modules/'), // Alias para `src`
      '~antd': path.resolve(__dirname, './node_modules/antd'), // Alias para `node_modules/antd`
      
    },
  },
});
