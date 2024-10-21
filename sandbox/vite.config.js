import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        "@toptensoftware/codeonly",
      ],
    },
  },
})