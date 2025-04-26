import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/shalom/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  assetsInclude: ['**/*.csv'],
  build: {
    outDir: 'dist',
    copyPublicDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        assetFileNames: (assetInfo) => {
          // Keep data directory structure
          if (assetInfo.source?.toString().includes('data/')) {
            return '[name][extname]';
          }
          // Other assets go to assets directory
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
})
