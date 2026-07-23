import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      // Identidade do container em runtime (identificador JS válido).
      name: 'mfe_overview',
      // API pública do remote: só o que está aqui é visível para hosts.
      exposes: {
        './OverviewPage': './src/pages/OverviewPage.tsx',
      },
      // Dependências negociadas no share scope. singleton: dois Reacts na
      // mesma página quebram hooks e context (ver T-1.3 da spec).
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
