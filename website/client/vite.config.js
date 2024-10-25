import { defineConfig } from 'vite';

export default defineConfig({
  base: "/",
  build: {
    emptyOutDir: false,
    outDir: './dist',
    rollupOptions: {
      external: [
      ],
    },
  },
})