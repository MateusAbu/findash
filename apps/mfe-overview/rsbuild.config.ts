import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      // Identidade do container em runtime (identificador JS válido).
      name: 'mfe_overview',
      // Host E remote desde a T-3.3: consome o DS, expõe a página.
      remotes: {
        ds: 'ds@http://localhost:3001/mf-manifest.json',
      },
      // API pública do remote: só o que está aqui é visível para hosts.
      exposes: {
        './OverviewPage': './src/pages/OverviewPage.tsx',
      },
      // Dependências negociadas no share scope. singleton: dois Reacts na
      // mesma página quebram hooks e context (ver T-1.3 da spec).
      // recharts fica FORA de shared (ADR-011): stateless (não exige
      // singleton), um único consumidor hoje — vai no chunk do expose.
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],

  source: {
    // Mesmo padrão do shell: main.tsx → import('./bootstrap').
    entry: { index: './src/main.tsx' },
  },

  // Porta contratual do overview (ver seção 2.2 da spec).
  server: { port: 3002 },

  html: { title: 'FinDash — Overview (standalone)' },
});
