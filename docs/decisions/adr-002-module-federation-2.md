# ADR-002 — Module Federation 2.0 (não 1.x)

- **Status:** aceito
- **Data:** 2026-07-22
- **Task relacionada:** T-0.3 (decisão originada na spec v1.0, seção 3)

## Contexto

O MF 1.x (nativo do Webpack 5) resolve o compartilhamento de módulos em runtime, mas tem dores conhecidas: nenhum tipo TypeScript entre remotes, descoberta de remotes estática (URL do `remoteEntry.js` fixa) e debugging difícil.

## Opções consideradas

1. **MF 1.x** — (+) mais simples, uma camada a menos; (−) sem tipos entre apps (a maior crítica histórica a MFE com TypeScript), sem manifest, sem tooling de inspeção.
2. **MF 2.0** — (+) tipos federados (DTS), manifest com metadados, runtime independente de bundler, Chrome DevTools dedicados; (−) mais uma camada de abstração para entender.

## Decisão

**Module Federation 2.0** via `@module-federation/rsbuild-plugin` (que usa `@module-federation/enhanced` por baixo). O que ele dá — e que vamos explorar item a item:

- **Tipos federados (DTS):** o remote gera `@mf-types` e o host consome — autocomplete e typecheck para módulos que só existem em runtime.
- **Manifest (`mf-manifest.json`):** o host lê um manifesto com metadados (versões, shared, chunks) em vez de apontar direto para `remoteEntry.js` — base para descoberta dinâmica e preload.
- **Runtime independente de bundler:** a lógica de federation vive em `@module-federation/runtime`, não mais dentro do bundler.
- **DevTools** dedicados para inspecionar a federation.

## Consequências

- (+) TypeScript de ponta a ponta, inclusive entre apps.
- (+) Base conceitual alinhada com o futuro da tecnologia.
- (−) Mais uma camada de abstração (runtime + plugin + bundler) — a Fase 1 dedica a T-1.4 a dissecá-la.
