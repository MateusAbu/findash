# FinDash

Dashboard de finanças pessoais construído com **microfrontends** — Module Federation 2.0 + Rsbuild. Projeto de estudo guiado por spec ([Spec-Driven Development](docs/spec.md)).

> O produto é simples de propósito. A complexidade — e o aprendizado — está na arquitetura.

## Arquitetura

| App                | Papel MF | Porta | Responsabilidade                                     |
| ------------------ | -------- | ----- | ---------------------------------------------------- |
| `shell`            | Host     | 3000  | Layout, rotas, composição e resiliência dos remotes  |
| `design-system`    | Remote   | 3001  | Componentes de UI consumidos em runtime pelos demais |
| `mfe-overview`     | Remote   | 3002  | Resumo financeiro: saldo, totais, gráficos           |
| `mfe-transactions` | Remote   | 3003  | CRUD de receitas e despesas                          |
| `mfe-goals`        | Remote   | 3004  | Metas de economia e aportes                          |

Pacotes de workspace (build-time, escopo `@findash/`): `tokens` (tema Tailwind), `domain` (tipos + repositórios), `store` (Zustand singleton), `config` (tsconfig/ESLint/Prettier).

## Stack e decisões

Rsbuild (Rspack) · Module Federation 2.0 · React · TypeScript strict · Tailwind CSS v4 · pnpm workspaces · GitHub Actions · Vercel.

Cada escolha tem o porquê registrado em [`docs/decisions/`](docs/decisions/). A fonte de verdade do projeto é a spec: [`docs/spec.md`](docs/spec.md).

## Comandos

Requisitos: Node ≥ 20 e pnpm via Corepack (`corepack enable`).

```bash
pnpm install    # instala todos os workspaces
pnpm lint       # ESLint (flat config compartilhada) em todos os pacotes
pnpm typecheck  # tsc --noEmit em todos os pacotes
```

### Rodando os apps

```bash
pnpm --filter shell dev          # host (shell) — http://localhost:3000
pnpm --filter mfe-overview dev   # remote overview — http://localhost:3002
```

Cada app roda standalone: nenhum depende de outro estar no ar para desenvolvimento.

Build de produção e prévia local: `pnpm --filter <app> build` e `pnpm --filter <app> preview`.

## Mapa das fases

| Fase | Tema                                             | Status |
| ---- | ------------------------------------------------ | ------ |
| 0    | Fundação do monorepo (workspaces, configs, ADRs) | ✅     |
| 1    | Prova de conceito: primeiro par host + remote    | —      |
| 2    | Design system federado com Tailwind              | —      |
| 3    | MFEs de domínio (overview, transactions, goals)  | —      |
| 4    | Integração e roteamento no shell                 | —      |
| 5    | Estado compartilhado e comunicação entre MFEs    | —      |
| 6    | Qualidade: tipos federados, testes, bundles      | —      |
| 7    | CI com pipelines independentes por app           | —      |
| 8    | Deploy em produção (Vercel, múltiplas origens)   | —      |
| 9    | Bônus: CLI de scaffolding `create-mfe`           | —      |

## Metodologia

Uma task por vez, na ordem da spec: conceitos explicados **antes** do código, critérios de aceite validados manualmente, um commit por task e nenhuma decisão técnica sem ADR.
