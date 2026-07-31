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
      shareStrategy: 'loaded-first',
      exposes: {
        './GoalsPage': './src/pages/GoalsPage.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        // Singleton do router: Links/hooks daqui falarão com o router do shell.
        'react-router-dom': { singleton: true },
        // T-5.1: a store DEVE ser instância única — sem isso, N stores
        // independentes (o bug do experimento da fase 5).
        zustand: { singleton: true },
        '@findash/store': { singleton: true },
      },
    }),
  ],

  source: {
    entry: { index: './src/main.tsx' },
  },

  server: { port: 3004 },

  html: { title: 'FinDash — Metas (standalone)' },
});
