import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  // JSX/TSX + runtime automático + Fast Refresh (HMR preservando estado).
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'shell',
      // alias → URL do manifest. import('mfe_overview/...') passa a resolver
      // para :3002 em runtime, não para node_modules.
      remotes: {
        mfe_overview: 'mfe_overview@http://localhost:3002/mf-manifest.json',
      },
      // Mesmos singletons do remote: a negociação exige os dois lados.
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],

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
