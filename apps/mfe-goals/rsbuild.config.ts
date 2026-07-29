import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'mfe_goals',
      // Host (consome o DS) e remote (expõe a página) — padrão da Fase 3.
      remotes: {
        ds: 'ds@http://localhost:3001/mf-manifest.json',
      },
      exposes: {
        './GoalsPage': './src/pages/GoalsPage.tsx',
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

  server: { port: 3004 },

  html: { title: 'FinDash — Metas (standalone)' },
});
