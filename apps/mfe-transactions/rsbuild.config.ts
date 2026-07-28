import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'mfe_transactions',
      // HOST e REMOTE ao mesmo tempo: consome o DS e expõe a página.
      // Confira o mf-manifest.json — remotes E exposes populados.
      remotes: {
        ds: 'ds@http://localhost:3001/mf-manifest.json',
      },
      exposes: {
        './TransactionsPage': './src/pages/TransactionsPage.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],

  source: {
    entry: { index: './src/main.tsx' },
  },

  server: { port: 3003 },

  html: { title: 'FinDash — Transações (standalone)' },
});
