import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: 'esbuild',
    lib: {
      entry: fileURLToPath(new URL('./src/main.js', import.meta.url)),
      formats: ['es'],
      fileName: () => 'avatar-viewer.js',
    },
    outDir: fileURLToPath(new URL('../../../assets/viewer/', import.meta.url)),
    emptyOutDir: false,
  },
});
