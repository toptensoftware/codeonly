import { defineConfig } from 'vite';

export default defineConfig({
  base: "./",
  build: {
    emptyOutDir: false,
    rollupOptions: {
      external: [
        "@toptensoftware/codeonly",
      ],
    },
  },
})