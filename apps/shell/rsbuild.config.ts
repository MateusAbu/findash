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
        ds: 'ds@http://localhost:3001/mf-manifest.json',
        mfe_overview: 'mfe_overview@http://localhost:3002/mf-manifest.json',
        mfe_transactions: 'mfe_transactions@http://localhost:3003/mf-manifest.json',
        mfe_goals: 'mfe_goals@http://localhost:3004/mf-manifest.json',
      },
      // loaded-first: sem pré-fetch de TODOS os manifests no init (o default
      // version-first derrubaria o shell inteiro se UM remote estiver fora —
      // T-4.1). Manifest de remote morto só falha no clique → ErrorBoundary.
      shareStrategy: 'loaded-first',
      // Singletons: react (hooks/context), router (um history só — T-4.1).
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
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
  // historyApiFallback: deep-linking de SPA — /transactions no F5 devolve o
  // index.html e o router client-side resolve (em prod: rewrites da Vercel).
  server: { port: 3000, historyApiFallback: true },

  html: { title: 'FinDash' },
});
