
// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
import replace from '@rollup/plugin-replace';

export default defineConfig({
  build: {
    outDir: '../dist',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, './codeonly.js'),
      name: 'codeonly',
      // the proper extensions will be added
      fileName: 'codeonly'
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      output: {},
      plugins: [
        replace({
          preventAssignment: true,
          values: {
            'Environment.browser': true,
          }
        }),
      ]
    },
  }
})