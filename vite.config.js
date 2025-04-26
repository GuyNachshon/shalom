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
  assetsInclude: ['**/*.csv', '**/*.mp4', '**/*.png'],
  build: {
    outDir: 'dist',
    copyPublicDir: false,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1] ?? '';

          // Handle fonts and other assets
          if (assetInfo.name?.includes('node_modules') || 
              assetInfo.name?.includes('src/assets')) {
            return `assets/[name]-[hash][extname]`;
          }

          // Handle data files
          if (assetInfo.name?.includes('data/')) {
            return assetInfo.name;
          }

          // Handle media files
          if (['mp4', 'png'].includes(ext)) {
            const type = assetInfo.name?.includes('DOVE') ? 'dove' : 'hawk';
            return `data/1979/${type}/[name][extname]`;
          }

          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
})
