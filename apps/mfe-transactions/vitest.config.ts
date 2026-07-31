import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // A fronteira federada é dependência EXTERNA no teste unitário: os
    // módulos ds/* viram stubs mínimos (integração federada real = E2E).
    alias: [
      {
        find: /^ds\/(.*)$/,
        replacement: new URL('./src/test/ds-stubs/$1.tsx', import.meta.url).pathname,
      },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
