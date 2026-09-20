// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   build: {
//     rollupOptions: {
//       output: {
//         entryFileNames: `index.js`,
//         chunkFileNames: `index.js`,
//         assetFileNames: `index.[ext]`
//       }
//     }
//   }
// });










import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: 'esbuild', // Fixes the Tailwind v4 lightningcss build crash on Vercel
    rollupOptions: {
      output: {
        // Let Vite generate unique hashed names for optimal code splitting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});