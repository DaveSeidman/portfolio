import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
  ],
  assetsInclude: ['**/*.gltf', '**/*.hdr'],
  server: {
    port: 8080,
    host: true,
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer({}),
      ],
    },
  },
});
