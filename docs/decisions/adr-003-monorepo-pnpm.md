# ADR-003 — Monorepo com pnpm workspaces (sem Nx/Turborepo por enquanto)

- **Status:** aceito
- **Data:** 2026-07-22
- **Task relacionada:** T-0.3 (decisão originada na spec v1.0, seção 3)

## Contexto

MFEs podem viver em polyrepo (um repositório por app — comum em empresas grandes, com times donos de repositórios) ou monorepo (tudo junto, apps independentes). Ferramentas como Nx e Turborepo adicionam cache e orquestração por cima.

## Opções consideradas

1. **Polyrepo** — (+) autonomia máxima por time; (−) para uma pessoa, multiplica burocracia (N clones, N configs, PRs coordenados para refactors).
2. **Monorepo + Nx/Turborepo** — (+) cache e grafo de dependências prontos; (−) abstrai (e esconde) exatamente o que queremos aprender: config de federation, pipelines por app, dependências entre pacotes.
3. **Monorepo com pnpm workspaces puro** — (+) aprendizado na unha, setup simples; (−) sem cache de build entre apps.

## Decisão

**Monorepo com pnpm workspaces puro.**

1. **Aprendizado na unha:** primeiro entender o mecanismo; ferramenta de produtividade vem depois.
2. **Monorepo ≠ acoplamento** — a provar na prática: cada app tem `package.json`, build, pipeline e deploy próprios; a integração entre apps é por URL em runtime (federation), nunca por import de workspace; o CI usa filtros de path para tratar cada app como unidade independente.
3. **pnpm** por ser o padrão de mercado atual para workspaces (rápido, eficiente em disco, protocolo `workspace:*`).
4. O modelo polyrepo será estudado em teoria na T-7.2, para dominar os dois discursos.

## Consequências

- (+) Setup simples, um `git clone` para tudo, refactors atômicos entre apps.
- (−) Sem cache de build entre apps — aceitável no nosso tamanho; Turborepo pode ser adicionado depois como estudo extra.
