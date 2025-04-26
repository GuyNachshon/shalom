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
  publicDir: 'data',
  build: {
    outDir: 'dist',
    copyPublicDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        assetFileNames: (assetInfo) => {
          // Skip files that are handled by copyPublicDir
          if (assetInfo.name?.includes('node_modules') || 
              assetInfo.name?.includes('src/assets')) {
            return 'assets/[name]-[hash][extname]';
          }
          // Keep original path for everything else
          return '[name][extname]';
        },
      },
    },
  },
})
