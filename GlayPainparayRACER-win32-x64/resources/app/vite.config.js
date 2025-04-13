import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': './'
    }
  },
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          threeBundle: ['three'],
          cannonBundle: ['cannon-es']
        }
      }
    }
  }
});


