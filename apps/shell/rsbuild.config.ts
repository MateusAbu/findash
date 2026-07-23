import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  // JSX/TSX + runtime automático + Fast Refresh (HMR preservando estado).
  plugins: [pluginReact()],

  source: {
    // Raiz do grafo de módulos. Padrão do projeto: main.tsx → import('./bootstrap')
    // (boundary assíncrono exigido pelo Module Federation a partir da T-1.3).
    entry: { index: './src/main.tsx' },
  },

  // Porta fixa por app (shell=3000, ds=3001, overview=3002...): as URLs dos
  // remotes são contrato, não podem variar entre execuções.
  server: { port: 3000 },

  html: { title: 'FinDash' },
});
