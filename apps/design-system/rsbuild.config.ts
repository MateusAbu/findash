import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      // O remote de UI. Nos hosts: remotes: { ds: 'ds@http://localhost:3001/...' }
      name: 'ds',
      exposes: {
        './Button': './src/components/Button/Button.tsx',
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
