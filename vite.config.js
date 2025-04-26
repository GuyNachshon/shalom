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
          const filepath = assetInfo.source?.toString() || '';
          const dataMatch = filepath.match(/data\/(.+)$/);
          if (dataMatch) {
            // Preserve full path for data directory files
            return dataMatch[0];
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
})
