import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],

  source: {
    // Mesmo padrão do shell: main.tsx → import('./bootstrap').
    entry: { index: './src/main.tsx' },
  },

  // Porta contratual do overview (ver seção 2.2 da spec).
  server: { port: 3002 },

  html: { title: 'FinDash — Overview (standalone)' },
});
