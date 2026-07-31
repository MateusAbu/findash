import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      // O remote de UI. Nos hosts: remotes: { ds: 'ds@http://localhost:3001/...' }
      name: 'ds',
      // T-6.1: embarca os tipos de deps internas (cva etc.) no @mf-types.zip —
      // sem isso, hosts sem essas deps degradam os tipos para `any` em
      // silêncio (skipLibCheck engole o import não resolvido).
      dts: { generateTypes: { extractThirdParty: true } },
      // Um expose por componente (decisão T-2.4): hosts baixam só o que usam
      // e o cache invalida por componente, não pela biblioteca inteira.
      exposes: {
        './Button': './src/components/Button/Button.tsx',
        './Card': './src/components/Card/Card.tsx',
        './Input': './src/components/Input/Input.tsx',
        './Label': './src/components/Input/Label.tsx',
        './FieldError': './src/components/Input/FieldError.tsx',
        './Select': './src/components/Select/Select.tsx',
        './Badge': './src/components/Badge/Badge.tsx',
        './ProgressBar': './src/components/ProgressBar/ProgressBar.tsx',
        './Skeleton': './src/components/Skeleton/Skeleton.tsx',
        './EmptyState': './src/components/EmptyState/EmptyState.tsx',
        './Toast': './src/components/Toast/Toast.tsx',
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

  server: { port: 3001 },

  html: { title: 'FinDash — Design System' },
});
