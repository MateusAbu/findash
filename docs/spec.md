# SPEC — FinDash: Dashboard de Finanças Pessoais com Microfrontends

> **Versão:** 1.0 · **Data:** Julho/2026 · **Autor:** Mateus (com apoio de IA)
> **Metodologia:** Spec-Driven Development (SDD)
> **Status:** Pronto para execução

---

## 0. Como usar este documento

Este documento é a **fonte de verdade** do projeto. Ele foi escrito para ser executado em parceria com uma IA (Claude Code, Claude.ai ou similar), task por task, no estilo Spec-Driven Development.

### Fluxo de trabalho recomendado

1. Anexe esta spec (ou as seções relevantes) ao contexto da IA.
2. Peça a execução de **uma task por vez**, na ordem.
3. A IA deve **explicar os conceitos antes de escrever código** — o objetivo é aprendizado, não só entrega.
4. Ao final de cada task, valide os **critérios de aceite** antes de avançar.
5. Commits pequenos e frequentes, um por task (ou menos), com mensagem referenciando o ID da task.

### Prompt padrão para cada task

```text
Estamos desenvolvendo o projeto FinDash seguindo a spec em anexo.
Execute a task T-X.Y.

Regras:
1. Antes de escrever qualquer código, explique os conceitos listados
   em "Conceitos a explicar" da task, de forma didática e com exemplos.
2. Liste os arquivos que serão criados/alterados e o porquê de cada um.
3. Implemente a task respeitando as decisões dos ADRs da spec.
4. Ao final, mostre como eu valido cada critério de aceite manualmente.
5. Se precisar tomar uma decisão não coberta pela spec, PARE e me
   apresente as opções com prós e contras antes de prosseguir.
```

### Regra de ouro

> **Nenhuma decisão técnica sem registro.** Se durante o desenvolvimento surgir uma decisão não prevista aqui, ela deve virar um novo ADR na pasta `docs/decisions/` antes do código ser escrito.

---

## 1. Visão geral

### 1.1 O que é o FinDash

Um **dashboard de finanças pessoais** construído com arquitetura de **microfrontends (MFE)**. O usuário registra receitas e despesas, acompanha um resumo financeiro com gráficos e gerencia metas de economia.

O produto em si é intencionalmente simples. **A complexidade está na arquitetura** — e é exatamente aí que mora o aprendizado.

### 1.2 Objetivos de aprendizado (o "porquê" do projeto)

| # | Objetivo | Onde aparece |
|---|----------|--------------|
| 1 | Entender o que é um microfrontend e quando faz sentido | Fases 1 e 7 |
| 2 | Dominar **Module Federation 2.0** (expor, consumir, shared, singleton, manifest, tipos federados) | Fases 1, 2, 3, 6 |
| 3 | Criar um **design system próprio** com Tailwind, distribuído como remote | Fase 2 |
| 4 | Resolver **roteamento** entre shell e remotes | Fase 4 |
| 5 | Resolver **estado compartilhado e comunicação** entre MFEs | Fase 5 |
| 6 | Entender **Rspack/Rsbuild** e o modelo mental de bundlers (herança do Webpack) | Fases 0, 1 e ADR-001 |
| 7 | Montar **CI/CD com builds e deploys independentes** por MFE | Fases 7 e 8 |
| 8 | Fazer **deploy real** com remotes servidos de origens diferentes (CORS, URLs por ambiente) | Fase 8 |
| 9 | Criar **scaffolding** (CLI que gera um novo MFE padronizado) | Fase 9 (bônus) |

### 1.3 Fora de escopo (importante!)

Para manter o foco, este projeto **NÃO** inclui:

- **Backend e autenticação/JWT** → reservados para o Projeto 2 (Plataforma de Cursos). Aqui os dados vivem em `localStorage`.
- Server-Side Rendering (SSR) com Module Federation.
- Testes E2E (Playwright/Cypress) — apenas testes unitários/componente como amostra.
- Acessibilidade completa WCAG — aplicaremos o básico (semântica, foco, contraste dos tokens), sem auditoria formal.
- Micro-otimizações de performance (preload avançado, chunk tuning).

### 1.4 Resultado final esperado

Ao concluir, você terá:

1. Um monorepo com **5 aplicações independentes** rodando integradas.
2. Cada MFE com **pipeline e deploy próprios** (mudou o `mfe-goals`? Só ele é buildado e publicado).
3. Um **design system versionável** consumido em runtime pelos demais apps.
4. Um **CLI próprio** que gera novos MFEs com um comando.
5. Uma pasta `docs/decisions/` que conta a história de cada decisão — seu material de estudo permanente.

---

## 2. Arquitetura

### 2.1 Visão macro

```text
                        ┌──────────────────────────────────────────┐
                        │              SHELL (host)                │
                        │  · Layout (sidebar, header)              │
                        │  · Roteamento top-level                  │
                        │  · Orquestra os remotes                  │
                        │  · Error boundaries + fallbacks          │
                        │  porta 3000                              │
                        └───────┬──────────┬──────────┬────────────┘
                                │ consome  │ consome  │ consome
              ┌─────────────────┴──┐  ┌────┴───────┐  ┌┴──────────────┐
              │  MFE OVERVIEW      │  │ MFE        │  │ MFE GOALS     │
              │  · Cards resumo    │  │ TRANSACTIONS│ │ · Metas       │
              │  · Gráficos        │  │ · CRUD     │  │ · Progresso   │
              │  porta 3002        │  │ porta 3003 │  │ porta 3004    │
              └─────────┬──────────┘  └────┬───────┘  └───────┬───────┘
                        │ consomem componentes │               │
                        └──────────┬───────────┴───────────────┘
                                   ▼
                        ┌──────────────────────┐
                        │   DESIGN SYSTEM      │
                        │   (remote de UI)     │
                        │  · Button, Card...   │
                        │  · Tokens Tailwind   │
                        │  porta 3001          │
                        └──────────────────────┘

   Pacotes de workspace (compartilhados em build, não federados):
   · @findash/tokens        → tokens de design (CSS @theme do Tailwind)
   · @findash/store         → store Zustand (singleton via MF shared)
   · @findash/domain        → tipos, modelo de dados, repositório localStorage
```

### 2.2 As cinco aplicações

| App | Papel MF | Porta dev | Responsabilidade |
|-----|----------|-----------|------------------|
| `shell` | **Host** | 3000 | Layout global, roteamento, composição dos remotes, resiliência (um remote fora do ar não derruba o app) |
| `design-system` | **Remote** | 3001 | Expõe componentes de UI (`Button`, `Card`, `Input`...) já estilizados com Tailwind |
| `mfe-overview` | **Remote** | 3002 | Página de visão geral: saldo, totais do mês, gráfico de despesas por categoria |
| `mfe-transactions` | **Remote** | 3003 | Página de transações: listagem, cadastro, edição e exclusão de receitas/despesas |
| `mfe-goals` | **Remote** | 3004 | Página de metas: criar meta, registrar aporte, barra de progresso |

> **Conceito-chave:** *host* é quem consome módulos remotos em runtime; *remote* é quem expõe. No MF 2.0 um app pode ser os dois ao mesmo tempo (os MFEs de domínio são remotes do shell **e** hosts do design system).

### 2.3 O que trafega entre os apps em runtime

Cada remote publica um **manifesto** (`mf-manifest.json`) descrevendo o que expõe, suas dependências compartilhadas e onde estão os chunks. O host lê esse manifesto em runtime e baixa apenas o necessário. É isso que permite **deploy independente**: publicar uma nova versão do `mfe-goals` atualiza o app final sem rebuild do shell.

---

## 3. Decisões técnicas documentadas (ADRs)

> **ADR** = Architecture Decision Record. Cada decisão relevante tem: contexto, opções avaliadas, decisão e consequências. Este formato é usado em empresas reais — pratique-o. Durante o projeto, novas decisões viram arquivos em `docs/decisions/adr-NNN-titulo.md`.

### ADR-001 — Bundler: Rsbuild (motor Rspack), não Webpack puro nem Vite

**Contexto.** Module Federation nasceu no Webpack 5 (2020). Em 2026 existem três caminhos viáveis: Webpack 5, Rspack/Rsbuild e Vite (via plugin). Precisamos escolher com base em: (a) relevância no mercado de trabalho, (b) qualidade do suporte a Module Federation, (c) experiência de desenvolvimento.

**Opções avaliadas.**

| Critério | Webpack 5 | Rspack / Rsbuild | Vite |
|---|---|---|---|
| Situação no mercado | Ainda é o bundler mais instalado; domina codebases enterprise e legadas | Adoção crescente acelerada; é o "Webpack reescrito em Rust" pela ByteDance, usado em produção no TikTok | Domina projetos **novos** de React/Vue/Svelte |
| Suporte a Module Federation | Berço do MF; v1 e v2 | **Suporte first-class**: o time do Rspack trabalha junto com os mantenedores do MF; MF 2.0 nativo | Funcional via `@module-federation/vite`, porém menos maduro; historicamente com limitações em dev mode |
| Compatibilidade de API | — (é a referência) | ~98% compatível com a API do Webpack (loaders, plugins, config) | Modelo totalmente diferente (plugins Rollup, `import.meta.env`) |
| Velocidade de build | Lento (referência) | 5–10× mais rápido que Webpack | Dev server muito rápido (esbuild); build com Rollup |
| Curva de aprendizado transferível | Alta relevância p/ vagas | **Aprender Rspack ≈ aprender Webpack** (mesmo modelo mental) | Conhecimento pouco transferível p/ Webpack |

**Decisão.** Usar **Rsbuild** (ferramenta de build de alto nível construída sobre o Rspack) com o plugin oficial `@module-federation/rsbuild-plugin`.

**Justificativa detalhada (o raciocínio de mercado que você pediu):**

1. **Microfrontends vivem no mundo corporativo.** Empresas que usam MFE em produção majoritariamente vêm do ecossistema Webpack. O Rspack preserva esse modelo mental (config, loaders, plugins, chunks) — ou seja, **tudo que você aprender aqui se transfere para uma vaga que use Webpack**, e vice-versa.
2. **É o caminho recomendado pelos próprios mantenedores do Module Federation.** O MF 2.0 tem integração de primeira classe com Rspack/Rsbuild (tipos federados, DevTools, manifest). No Vite o suporte existe, mas é o caminho com mais arestas justamente na feature central do nosso estudo.
3. **DX moderna sem abrir mão do ecossistema.** Builds em Rust, HMR rápido — resolve a maior dor histórica do Webpack (lentidão) sem trocar de paradigma.
4. **Por que Rsbuild e não Rspack "cru"?** Rsbuild está para o Rspack assim como o Vite está para o Rollup: entrega convenções prontas (TS, React, CSS, HTML) em cima do motor. Config enxuta, mas com *escape hatch* (`tools.rspack`) para tocar no motor quando quisermos aprender o nível de baixo. Teremos uma task específica para abrir o capô.

**Consequências.**
- (+) Conhecimento transferível para Webpack (mercado) e para o estado da arte (Rspack).
- (+) Melhor suporte a MF 2.0 disponível hoje.
- (−) Comunidade menor que a do Vite para dúvidas genéricas de build.
- (−) Se um dia migrarmos para Vite, a config não é reaproveitável.

### ADR-002 — Module Federation 2.0 (não 1.x)

**Contexto.** O MF 1.x (nativo do Webpack 5) resolve o compartilhamento de módulos, mas tem dores conhecidas: nada de tipos TypeScript entre remotes, descoberta de remotes estática, debugging difícil.

**Decisão.** Usar **Module Federation 2.0** via `@module-federation/rsbuild-plugin` (que usa `@module-federation/enhanced` por baixo).

**O que o MF 2.0 nos dá (e vamos explorar cada item):**
- **Tipos federados (DTS):** o remote gera `@mf-types` automaticamente e o host consome — autocomplete e checagem de tipo para módulos que só existem em runtime. Isso resolve a maior crítica histórica a MFE com TypeScript.
- **Manifest (`mf-manifest.json`):** em vez de apontar direto para `remoteEntry.js`, o host lê um manifesto com metadados (versões, shared, chunks) — base para descoberta dinâmica e preload.
- **Runtime independente de bundler:** a lógica de federation vive em `@module-federation/runtime`, não mais dentro do bundler.
- **Chrome DevTools** dedicados para inspecionar a federation.

**Consequências.**
- (+) TypeScript de ponta a ponta, inclusive entre apps.
- (+) Base conceitual alinhada com o futuro da tecnologia.
- (−) Mais uma camada de abstração para entender (runtime + plugin + bundler). A Fase 1 dedica uma task só para dissecar isso.

### ADR-003 — Monorepo com pnpm workspaces (sem Nx/Turborepo por enquanto)

**Contexto.** MFEs podem viver em polyrepo (um repositório por app — comum em empresas grandes, times donos de repositórios) ou monorepo (tudo junto, apps independentes). Ferramentas como Nx e Turborepo adicionam cache e orquestração.

**Decisão.** **Monorepo com pnpm workspaces puro.**

**Justificativa:**
1. **Aprendizado na unha.** Nx abstrai (e esconde) exatamente o que queremos aprender: config de federation, pipelines por app, dependências entre pacotes. Primeiro entendemos o mecanismo; ferramenta de produtividade vem depois.
2. **Monorepo ≠ acoplamento.** Vamos provar isso na prática: mesmo no monorepo, cada app tem `package.json`, build, pipeline e deploy próprios. O CI usará filtros de path para tratar cada app como unidade independente.
3. **pnpm** por ser o padrão de mercado atual para workspaces (rápido, eficiente em disco, `workspace:*` protocol).
4. **Polyrepo simulado:** a Fase 7 discute o que mudaria em polyrepo, para você dominar os dois discursos em entrevista.

**Consequências.**
- (+) Setup simples, um `git clone` para tudo, refactors atômicos.
- (−) Sem cache de build entre apps (aceitável no nosso tamanho; Turborepo pode ser adicionado depois como estudo extra).

### ADR-004 — Design System como remote federado (não como pacote npm)

**Contexto.** Um design system pode ser distribuído como (a) pacote npm instalado em build-time, ou (b) remote federado consumido em runtime.

**Decisão.** **Remote federado**, com um pacote de workspace auxiliar apenas para tokens (`@findash/tokens`).

**Justificativa:**
1. É o cenário que mais ensina Module Federation: *versionamento em runtime*. Publicou um `Button` novo → todos os apps recebem **sem rebuild e sem bump de versão**.
2. Expõe o trade-off real que empresas enfrentam: runtime = atualização instantânea porém acoplamento em runtime; npm = builds reprodutíveis porém rollout lento. Você vai vivenciar o lado runtime e documentar o comparativo.
3. O pacote `@findash/tokens` (CSS de tema do Tailwind) fica **fora** da federation, importado em build-time por todos — tokens mudam raramente e precisam estar disponíveis no CSS de cada app.

**Consequências.**
- (+) Vivência do principal argumento de venda de MFE (release desacoplado).
- (−) O shell depende do design system estar no ar (mitigado com error boundaries + fallback na Fase 4).

### ADR-005 — Tailwind CSS v4 e a estratégia de CSS em microfrontends

**Contexto.** CSS é um dos pontos mais traiçoeiros de MFE: estilos são globais por natureza, e cada app compila seu próprio bundle. Perguntas que precisamos responder: onde o CSS do design system é compilado? Como evitar conflito e duplicação? Como compartilhar tema?

**Decisão.**
1. **Tailwind CSS v4** em todos os apps (config CSS-first via `@theme`, sem `tailwind.config.js`).
2. Tokens de design centralizados em `@findash/tokens` (um arquivo CSS com `@theme` — cores, espaçamentos, fontes) importado por todos os apps.
3. **Cada app compila o próprio CSS.** O design system compila e carrega o CSS **dos seus componentes** junto com os chunks federados (o Rsbuild extrai o CSS e o runtime do MF o injeta quando o componente é carregado).
4. Classes utilitárias do Tailwind são **determinísticas** (`.p-4` gera sempre o mesmo CSS), então a duplicação entre bundles é inofensiva em comportamento — o custo é alguns KB repetidos, que aceitamos e mediremos na Fase 6.

**Alternativas rejeitadas:**
- *CSS Modules/Scoped por app + tema via CSS vars manuais:* mais isolamento, porém abre mão do Tailwind pedido no projeto.
- *Um único CSS global compilado pelo shell:* quebraria o deploy independente (novo componente no DS exigiria rebuild do shell).
- *Prefixo de classes por MFE:* necessário quando MFEs usam **versões diferentes** do Tailwind; no nosso monorepo todos usam a mesma versão, então não precisamos.

**Consequências.**
- (+) Tema único, mudança de token propaga para todos.
- (−) Alguns KB de utilitários duplicados entre remotes (mensurável, aceitável).

### ADR-006 — Roteamento: o shell é o dono das rotas; remotes expõem páginas

**Contexto.** Três padrões comuns: (a) shell dono de todas as rotas e remotes expõem componentes de página; (b) cada remote tem seu próprio router interno montado sob um prefixo (`/transactions/*`); (c) roteamento distribuído com eventos de navegação.

**Decisão.** Padrão **(a)** como base: React Router v7 (modo library) instalado **apenas** no shell; remotes expõem componentes de página "burros" em relação à URL. Compartilharemos `react-router-dom` como singleton para que os remotes possam usar `<Link>` e hooks de navegação apontando para o router do shell.

**Justificativa:** é o padrão mais simples e mais comum para dashboards; deixa clara a separação "shell orquestra, remote renderiza". O padrão (b) será explicado em uma task teórica e fica como extensão sugerida (sub-rotas dentro de `mfe-transactions`).

**Consequências.**
- (+) Um único lugar define o mapa de navegação; deep-linking funciona naturalmente.
- (−) Adicionar página nova a um remote exige tocar no shell (trade-off consciente; o padrão (b) resolve isso ao custo de complexidade).

### ADR-007 — Estado compartilhado: Zustand singleton + Custom Events

**Contexto.** Os MFEs precisam se comunicar: ao criar uma transação no `mfe-transactions`, o `mfe-overview` (saldo) e o `mfe-goals` podem precisar reagir. Opções comuns: props do shell, Custom Events do DOM, store compartilhada (Redux/Zustand como singleton), BroadcastChannel.

**Decisão.** Usaremos **dois mecanismos, de propósito**, para você dominar os dois estilos:
1. **Store compartilhada:** pacote `@findash/store` com Zustand, declarado em `shared` com `singleton: true` em todos os apps. Guarda estado vivo de sessão (transações carregadas, metas). *Por que singleton é crítico:* sem isso, cada MFE embarcaria sua própria cópia do módulo e teríamos N stores independentes — o bug clássico de MFE.
2. **Custom Events (`window.dispatchEvent`)** com contrato tipado e prefixo `findash:` para notificações pontuais e desacopladas (ex.: `findash:transaction-added` dispara um toast no shell). Demonstra comunicação sem dependência de módulo algum.

**Regra de uso:** estado que múltiplos MFEs **leem continuamente** → store; notificação efêmera "aconteceu algo" → evento. A Fase 5 termina com uma task comparando os dois na prática.

**Consequências.**
- (+) Repertório completo dos dois padrões dominantes de comunicação em MFE.
- (−) Dois mecanismos = disciplina para não misturar responsabilidades (a regra acima existe para isso).

### ADR-008 — Persistência: localStorage atrás de um repositório

**Contexto.** O projeto não tem backend (ADR consciente para manter o foco em arquitetura frontend).

**Decisão.** Dados persistidos em `localStorage`, acessados **exclusivamente** via camada de repositório no pacote `@findash/domain` (`TransactionRepository`, `GoalRepository`). Nenhum MFE toca `localStorage` diretamente.

**Justificativa:** simula a fronteira que uma API ocuparia. No Projeto 2 (com backend + JWT), trocaremos a implementação do repositório por chamadas HTTP **sem alterar os MFEs** — prova prática de inversão de dependência.

### ADR-009 — CI/CD: GitHub Actions com pipelines independentes por app

**Contexto.** Você domina Azure DevOps do trabalho. Para um projeto pessoal público, GitHub Actions é o padrão de facto (integração nativa com o repositório, gratuito para repos públicos, e é a segunda ferramenta mais pedida em vagas).

**Decisão.** **GitHub Actions**, com um workflow de CI para PRs (lint, typecheck, test, build **apenas dos apps alterados**, via filtros de path) e workflows de deploy por app. Cada conceito terá o paralelo com Azure DevOps comentado (trigger `paths` ⇆ `trigger.paths`, jobs ⇆ stages etc.) para você mapear um mundo no outro.

**Consequências.**
- (+) Aprende a segunda plataforma de CI mais relevante mapeando-a sobre a que já domina.
- (+) O "pulo do gato" de MFE em CI: pipelines que só rodam para o que mudou.

### ADR-010 — Deploy: Vercel, um projeto por app

**Contexto.** Precisamos hospedar 5 apps estáticos em origens distintas (para simular times/domínios independentes), com HTTPS, headers CORS configuráveis e deploy via CLI/CI. Candidatos: Vercel, Netlify, Cloudflare Pages, Azure Static Web Apps.

**Decisão.** **Vercel**, com **5 projetos** apontando para o mesmo repositório, cada um com *Root Directory* diferente (`apps/shell`, `apps/design-system`...).

**Justificativa:**
1. Free tier confortável, CLI excelente e integração trivial com GitHub Actions.
2. Cada app ganha uma URL própria (`findash-shell.vercel.app`, `findash-ds.vercel.app`...) — reproduz o cenário real de remotes em origens diferentes, nos obrigando a resolver **CORS** e **URLs por ambiente** (aprendizado central da Fase 8).
3. Azure Static Web Apps seria familiar, mas o objetivo aqui é ampliar repertório; os conceitos (headers, env vars, preview deploys) são transferíveis.

**Consequências.**
- (+) Cenário de produção realista com múltiplas origens.
- (−) Limites do free tier (aceitáveis para estudo).

---

## 4. Estrutura do monorepo

```text
findash/
├── apps/
│   ├── shell/                      # Host — porta 3000
│   │   ├── src/
│   │   │   ├── main.tsx            # entry: apenas import('./bootstrap')
│   │   │   ├── bootstrap.tsx       # monta o React (boundary assíncrono do MF)
│   │   │   ├── App.tsx             # rotas + layout
│   │   │   ├── layout/             # Sidebar, Header (usam o DS)
│   │   │   ├── remotes/            # wrappers lazy dos remotes + ErrorBoundary
│   │   │   └── styles/index.css    # @import tailwindcss + tokens
│   │   ├── rsbuild.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── design-system/              # Remote de UI — porta 3001
│   │   ├── src/
│   │   │   ├── components/         # Button/, Card/, Input/... (1 pasta por componente)
│   │   │   ├── playground/         # showcase local dos componentes ("mini storybook")
│   │   │   └── index.ts            # barrel: o que o DS expõe
│   │   └── ...
│   ├── mfe-overview/               # Remote — porta 3002
│   ├── mfe-transactions/           # Remote — porta 3003
│   └── mfe-goals/                  # Remote — porta 3004
├── packages/
│   ├── tokens/                     # @findash/tokens — CSS @theme (cores, fontes, radii)
│   ├── domain/                     # @findash/domain — tipos + repositórios (localStorage)
│   ├── store/                      # @findash/store — Zustand (compartilhado como singleton)
│   └── config/                     # @findash/config — tsconfig base, eslint preset
├── tools/
│   └── create-mfe/                 # Fase 9: CLI de scaffolding
├── docs/
│   ├── decisions/                  # ADRs novos criados durante o desenvolvimento
│   └── learnings/                  # suas anotações por fase (recomendado!)
├── .github/workflows/              # ci.yml + deploy-*.yml
├── pnpm-workspace.yaml
├── package.json                    # scripts raiz (dev, lint, typecheck, build)
└── README.md
```

**Convenções:**
- Apps em `apps/`, bibliotecas em `packages/`, ferramentas em `tools/`.
- Pacotes internos usam o escopo `@findash/` e são referenciados com `workspace:*`.
- Todo remote segue o padrão `main.tsx → import('./bootstrap')` (explicado na T-1.3).

---

## 5. Modelo de dados

Definido em `@findash/domain`. **Valores monetários em centavos (inteiro)** — nunca `float` para dinheiro (0.1 + 0.2 !== 0.3). Formatação apenas na borda da UI com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

```ts
// packages/domain/src/types.ts

export type TransactionType = 'income' | 'expense';

export type Category =
  | 'salary' | 'freelance' | 'investments'          // receitas
  | 'housing' | 'food' | 'transport' | 'health'
  | 'leisure' | 'education' | 'other';              // despesas

export interface Transaction {
  id: string;               // crypto.randomUUID()
  type: TransactionType;
  amountCents: number;      // sempre positivo; o type dá o sinal
  category: Category;
  description: string;
  date: string;             // ISO 8601 (yyyy-mm-dd)
  createdAt: string;        // ISO datetime
}

export interface Goal {
  id: string;
  name: string;             // "Reserva de emergência"
  targetCents: number;
  savedCents: number;
  deadline?: string;        // ISO date, opcional
  color: string;            // token de cor do DS (ex.: 'emerald')
  createdAt: string;
}
```

**Contratos dos repositórios** (implementação `localStorage` nesta versão):

```ts
export interface TransactionRepository {
  list(): Promise<Transaction[]>;
  add(input: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  update(id: string, patch: Partial<Transaction>): Promise<Transaction>;
  remove(id: string): Promise<void>;
}
// GoalRepository análogo: list/add/update/remove + addContribution(id, cents)
```

**Contrato dos Custom Events** (tipado em `@findash/domain/events.ts`):

| Evento | detail | Emissor | Consumidores |
|---|---|---|---|
| `findash:transaction-added` | `{ transaction: Transaction }` | mfe-transactions | shell (toast), mfe-overview |
| `findash:goal-contribution` | `{ goalId: string; amountCents: number }` | mfe-goals | shell (toast) |

---

## 6. Requisitos funcionais por MFE

### 6.1 Shell
- **RF-S1** Layout com sidebar fixa (Dashboard, Transações, Metas) e header com título da página.
- **RF-S2** Rotas: `/` → Overview · `/transactions` → Transações · `/goals` → Metas.
- **RF-S3** Cada remote carrega via `React.lazy` + `Suspense` com skeleton do DS.
- **RF-S4** Se um remote falhar (fora do ar), exibir card de erro amigável com botão "tentar de novo" — o restante do app segue funcionando.
- **RF-S5** Toast global ouvindo os Custom Events (`findash:*`).

### 6.2 Design System (componentes mínimos)
`Button` (variants: primary/secondary/ghost/danger · sizes: sm/md/lg) · `Card` (com header/footer opcionais) · `Input` + `Label` + `FieldError` · `Select` · `Badge` · `ProgressBar` · `Skeleton` · `EmptyState` · `Toast`.
- **RF-D1** Todos consomem exclusivamente tokens de `@findash/tokens` (nenhuma cor hardcoded).
- **RF-D2** Playground local em `/` do próprio app (porta 3001) exibindo todos os componentes e variantes.
- **RF-D3** Props tipadas e exportadas; tipos fluem para os consumidores via DTS federado.

### 6.3 MFE Overview
- **RF-O1** Cards: saldo do mês, total de receitas, total de despesas (mês corrente).
- **RF-O2** Gráfico de barras: despesas por categoria no mês (Recharts).
- **RF-O3** Lista das 5 transações mais recentes.
- **RF-O4** Reage em tempo real a transações criadas em outro MFE (via store — prova do singleton).

### 6.4 MFE Transactions
- **RF-T1** Tabela com todas as transações (data, descrição, categoria, valor colorido por tipo).
- **RF-T2** Formulário de criação (validação: descrição obrigatória, valor > 0, data válida).
- **RF-T3** Edição e exclusão (exclusão com confirmação).
- **RF-T4** Filtro por tipo e por categoria.
- **RF-T5** Ao criar, emite `findash:transaction-added`.

### 6.5 MFE Goals
- **RF-G1** Grid de cards de metas com `ProgressBar` (percentual salvo/alvo).
- **RF-G2** Criar meta (nome, valor alvo, prazo opcional, cor).
- **RF-G3** Registrar aporte em uma meta; ao completar 100%, badge "Concluída 🎉".
- **RF-G4** Ao aportar, emite `findash:goal-contribution`.

---

## 7. Plano de execução — Fases e Tasks

> **Formato de cada task:**
> - **Objetivo** — o que existe ao final.
> - **Instruções para a IA** — o que implementar/fazer.
> - **Conceitos a explicar** — a IA deve ensinar isso ANTES de codar. É a parte mais importante.
> - **Critérios de aceite** — como você valida.
>
> Estimativas assumem sessões de estudo de 1–2h. Não pule a validação manual: rodar, quebrar e consertar é onde o aprendizado fixa.

---

### FASE 0 — Fundação do monorepo

#### T-0.1 — Inicializar o monorepo pnpm
- **Objetivo:** repositório Git com pnpm workspaces configurado e estrutura de pastas vazia (`apps/`, `packages/`, `tools/`, `docs/`).
- **Instruções para a IA:** criar `pnpm-workspace.yaml` (padrões `apps/*`, `packages/*`, `tools/*`), `package.json` raiz (`private: true`, `packageManager` fixado, engines com Node ≥ 20), `.gitignore`, `.npmrc` com `shamefully-hoist=false`, e `docs/decisions/` com um `template.md` de ADR.
- **Conceitos a explicar:** o que é um workspace e como o pnpm resolve dependências internas (symlinks + protocolo `workspace:*`); diferença entre hoisting do npm/yarn clássico e o node_modules estrito do pnpm (e por que isso evita "dependências fantasma"); por que fixar `packageManager` (Corepack).
- **Critérios de aceite:** `pnpm install` roda sem erro na raiz; `git log` mostra commit inicial; estrutura de pastas conforme a seção 4.

#### T-0.2 — Configurações base compartilhadas
- **Objetivo:** pacote `@findash/config` com `tsconfig.base.json` (strict) e preset de ESLint (flat config) + Prettier, consumidos por referência em todos os futuros apps.
- **Instruções para a IA:** criar `packages/config`; `tsconfig.base.json` com `strict: true`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `verbatimModuleSyntax: true`; ESLint 9 flat config com typescript-eslint + react-hooks; Prettier com config mínima; scripts raiz `lint` e `typecheck` usando `pnpm -r`.
- **Conceitos a explicar:** por que centralizar configs em monorepos (consistência, um upgrade só); o que cada flag strict do TS pega na prática (2 exemplos de bug real que `strictNullChecks` evita); `moduleResolution: bundler` e por que é o correto para apps bundlados.
- **Critérios de aceite:** `pnpm lint` e `pnpm typecheck` rodam na raiz (ainda sem apps, sem erro); um arquivo `.ts` de teste com erro proposital é acusado pelo typecheck.

#### T-0.3 — README e diário de decisões
- **Objetivo:** `README.md` com visão do projeto, comandos e mapa das fases; primeiro ADR real gravado (`adr-001-bundler.md`, resumo do ADR-001 desta spec).
- **Instruções para a IA:** gerar README enxuto (o detalhe fica na spec) e converter os ADRs 001, 002 e 003 desta spec para arquivos em `docs/decisions/`.
- **Conceitos a explicar:** o formato ADR (contexto → decisão → consequências) e por que times sênior o usam; a diferença entre spec (o que construir) e ADR (por que assim).
- **Critérios de aceite:** README renderiza bem no GitHub; 3 ADRs versionados.

---

### FASE 1 — Prova de conceito: o primeiro par host + remote

> Meta da fase: shell consumindo um componente do `mfe-overview` via Module Federation, com você entendendo **cada linha** da configuração.

#### T-1.1 — Criar o app shell (ainda sem federation)
- **Objetivo:** `apps/shell` rodando em `localhost:3000` com Rsbuild + React 19 + TS, exibindo um layout mínimo hardcoded.
- **Instruções para a IA:** usar `@rsbuild/core` + `@rsbuild/plugin-react`; estrutura `main.tsx → import('./bootstrap')` **desde já** (mesmo sem MF, para o hábito); `App.tsx` com um `<h1>` e placeholder de sidebar; scripts `dev`, `build`, `preview`.
- **Conceitos a explicar:** o que o Rsbuild faz por baixo (Rspack, HTML template, dev server, HMR); anatomia do `rsbuild.config.ts` (`plugins`, `server.port`, `source.entry`, `html`); relação Rsbuild ⇆ Rspack ⇆ Webpack (a "árvore genealógica" e o que é compatível com o quê).
- **Critérios de aceite:** `pnpm --filter shell dev` abre em :3000; HMR funciona (editar o h1 atualiza sem reload); `pnpm --filter shell build` gera `dist/` e `preview` a serve.

#### T-1.2 — Criar o mfe-overview mínimo
- **Objetivo:** `apps/mfe-overview` em `localhost:3002`, standalone, com uma página `OverviewPage` simples ("Olá, sou o Overview").
- **Instruções para a IA:** mesmo esqueleto do shell (repetir de propósito — a repetição vira insumo do CLI da Fase 9); porta 3002.
- **Conceitos a explicar:** por que todo remote deve rodar standalone (desenvolvimento e teste isolados — um dos pilares de MFE: times autônomos); o custo da duplicação de boilerplate e como scaffolding resolve (gancho para a Fase 9).
- **Critérios de aceite:** :3002 abre o OverviewPage sozinho, independente do shell.

#### T-1.3 — Federar: expor OverviewPage e consumir no shell ⭐ (task central do projeto)
- **Objetivo:** shell renderizando `OverviewPage` carregado **em runtime** de :3002.
- **Instruções para a IA:** adicionar `@module-federation/rsbuild-plugin` nos dois apps. No remote: `name: 'mfe_overview'`, `exposes: { './OverviewPage': './src/pages/OverviewPage.tsx' }`, `shared: { react: { singleton: true }, 'react-dom': { singleton: true } }`. No shell: `remotes: { mfe_overview: 'mfe_overview@http://localhost:3002/mf-manifest.json' }` + mesmos shared. Consumir com `const OverviewPage = React.lazy(() => import('mfe_overview/OverviewPage'))` + `Suspense`. Habilitar DTS e criar tipagem do remote se necessário.
- **Conceitos a explicar (a explicação mais importante da spec — pedir com calma e exemplos):**
  1. O papel de cada campo: `name`, `filename`/manifest, `exposes`, `remotes`, `shared`.
  2. **`shared` e `singleton`:** o que aconteceria com DOIS Reacts na página (quebra de hooks/context) e como o MF negocia versões em runtime.
  3. **Por que `main.tsx → import('./bootstrap')`:** o boundary assíncrono que dá tempo ao runtime de resolver os shared antes do React executar.
  4. O que é o `mf-manifest.json` e o que mudou do MF 1.x (remoteEntry direto) para o 2.0.
  5. O fluxo completo de rede: quem baixa o quê, quando (relacionar com a aba Network).
- **Critérios de aceite:** :3000 exibe o conteúdo vindo de :3002; derrubar o dev server do overview e recarregar o shell mostra erro de carregamento (ainda sem tratamento — será a T-4.1); na aba Network aparecem `mf-manifest.json` e chunks vindos de :3002; só existe UMA cópia do React (verificável via `window.__FEDERATION__` ou DevTools do MF).

#### T-1.4 — Dissecar a federation (task de estudo guiado, sem código novo)
- **Objetivo:** você conseguir explicar de memória o que acontece do F5 ao render.
- **Instruções para a IA:** guiar uma investigação: (1) abrir `dist/mf-manifest.json` do remote e explicar cada bloco; (2) na aba Network, mapear a ordem das requisições; (3) inspecionar `window.__FEDERATION__`; (4) instalar a extensão Module Federation DevTools e explorar; (5) responder em conjunto: "o que acontece se o remote publicar uma versão nova enquanto o shell está aberto?".
- **Conceitos a explicar:** share scope em runtime; versionamento/negociação de shared; diferença carregar manifest vs. remoteEntry.
- **Critérios de aceite:** você escreve em `docs/learnings/fase-1.md` um parágrafo explicando o fluxo com suas palavras (peça para a IA revisar a precisão técnica).

---

### FASE 2 — Design System federado com Tailwind

#### T-2.1 — Pacote de tokens (`@findash/tokens`)
- **Objetivo:** tema único do projeto num pacote de workspace.
- **Instruções para a IA:** criar `packages/tokens` exportando `theme.css` com `@theme` do Tailwind v4: paleta da marca (primária, superfícies, sucesso/erro/aviso), radius, fonte (ex.: Inter), escala de espaçamento se customizada. Documentar cada token em comentário.
- **Conceitos a explicar:** Tailwind v4 e a config CSS-first (`@theme` no lugar do `tailwind.config.js`); o que são design tokens e por que viram a "constituição visual" (uma mudança propaga para todos os apps); tokens em CSS custom properties vs. em JS.
- **Critérios de aceite:** pacote publicável no workspace; nenhum app ainda o usa (vem na T-2.2).

#### T-2.2 — App design-system: primeiro componente exposto
- **Objetivo:** `apps/design-system` (porta 3001) com Tailwind v4 + tokens, expondo `Button` via MF, com playground local.
- **Instruções para a IA:** setup Tailwind v4 no Rsbuild (via PostCSS `@tailwindcss/postcss`); `src/styles.css` com `@import 'tailwindcss'` + `@import '@findash/tokens/theme.css'`; `Button` com variants/sizes via props tipadas (usar `class-variance-authority` — explicar a lib); playground na rota raiz mostrando todas as variações; expor `./Button` no MF config com os mesmos shared singletons.
- **Conceitos a explicar:** como o Tailwind v4 escaneia fontes e gera CSS no build do Rsbuild; CVA (variantes tipadas sem if/else de classes); anatomia de um bom componente de DS (API de props, composição, `forwardRef`, `className` merge com `tailwind-merge`).
- **Critérios de aceite:** :3001 mostra o playground do Button; `Button` exposto no manifest (conferir `mf-manifest.json`).

#### T-2.3 — Consumir o Button no shell e resolver o CSS ⭐
- **Objetivo:** shell usando `ds/Button` **com estilo carregando corretamente** — e você entendendo por quê.
- **Instruções para a IA:** adicionar o remote `ds` no shell; substituir um botão hardcoded; investigar juntos na aba Network **de onde vem o CSS do Button** (chunk CSS do remote carregado pelo runtime do MF); provar o isolamento removendo o Tailwind do shell temporariamente e observando que o Button continua estilizado.
- **Conceitos a explicar:** a estratégia de CSS do ADR-005 na prática (quem compila o quê); por que classes utilitárias idênticas duplicadas não conflitam; os riscos reais de CSS em MFE (reset/base divergente, versões diferentes de Tailwind, especificidade em CSS não-utilitário) e como detectá-los.
- **Critérios de aceite:** Button estilizado no shell; você identifica na aba Network o arquivo CSS vindo de :3001; anotação em `docs/learnings/fase-2.md`.

#### T-2.4 — Completar a biblioteca de componentes
- **Objetivo:** todos os componentes do RF-D disponíveis e expostos.
- **Instruções para a IA:** implementar `Card`, `Input`+`Label`+`FieldError`, `Select`, `Badge`, `ProgressBar`, `Skeleton`, `EmptyState`, `Toast` (um commit por componente ou por dupla); atualizar playground e `exposes` (avaliar expor um único `./components` barrel vs. um por componente — discutir trade-off de chunks); habilitar DTS.
- **Conceitos a explicar:** granularidade de `exposes` e impacto em chunks/carregamento; acessibilidade básica dos componentes de formulário (label ↔ input via `htmlFor`, `aria-invalid`, foco visível com tokens).
- **Critérios de aceite:** playground completo; shell consegue importar dois componentes diferentes com autocomplete de props funcionando (DTS ok).

---

### FASE 3 — MFEs de domínio

#### T-3.1 — Pacote `@findash/domain` (tipos + repositórios)
- **Objetivo:** modelo de dados e repositórios `localStorage` prontos e testados manualmente.
- **Instruções para a IA:** implementar a seção 5 (tipos, repos com try/catch e validação leve na leitura, seed opcional de dados de exemplo, contrato dos events); helper `formatCents(cents): string` com `Intl.NumberFormat`.
- **Conceitos a explicar:** por que dinheiro em centavos inteiros (mostrar `0.1 + 0.2` no console); o padrão Repository e a inversão de dependência (o gancho concreto: no Projeto 2 este pacote vira HTTP + JWT sem tocar nos MFEs); riscos do localStorage (síncrono, 5MB, por origem — o que implica em MFEs de origens diferentes? Discutir!).
- **Critérios de aceite:** num script de teste rápido, criar/ler/atualizar/excluir funciona; dados sobrevivem ao reload.

#### T-3.2 — mfe-transactions completo
- **Objetivo:** RF-T1 a RF-T5 funcionando standalone em :3003.
- **Instruções para a IA:** página com tabela + formulário usando componentes do DS (consumidos via federation — este app é remote do shell E host do DS); estado local com `useState`/`useReducer` + repositório; validação de formulário manual (sem lib, para entender o problema); filtros; emitir o Custom Event ao criar; expor `./TransactionsPage`.
- **Conceitos a explicar:** um app sendo host e remote ao mesmo tempo (olhar o manifest dele!); onde termina estado local e começa estado compartilhado (por enquanto tudo local — a Fase 5 muda isso e o refactor será proposital, para você sentir a diferença).
- **Critérios de aceite:** CRUD completo standalone; validações bloqueiam dados inválidos; evento visível no console ao criar transação.

#### T-3.3 — mfe-overview real + decisão de shared com Recharts ⭐
- **Objetivo:** RF-O1 a RF-O3 com gráfico Recharts; decisão documentada sobre compartilhar ou não a lib.
- **Instruções para a IA:** implementar cards e gráfico de despesas por categoria; ANTES de instalar o Recharts, conduzir a análise: "Recharts (~100KB+) deve entrar em `shared`?" — analisar: só o overview usa hoje; se o goals usar amanhã, sem shared haverá duplicação; com shared, todos pagam a negociação. Decidir juntos, medir o bundle (`rsbuild build` + analyzer) e registrar `docs/decisions/adr-011-recharts.md`.
- **Conceitos a explicar:** critérios para `shared` (singleton obrigatório? tamanho? quantos consumidores? estabilidade de versão?); ler o output do bundle analyzer.
- **Critérios de aceite:** overview standalone completo em :3002; ADR-011 escrito com números reais de bundle.

#### T-3.4 — mfe-goals completo
- **Objetivo:** RF-G1 a RF-G4 standalone em :3004.
- **Instruções para a IA:** grid de metas com `ProgressBar` do DS, criação e aporte, badge de concluída, Custom Event no aporte; expor `./GoalsPage`. Encorajar: tente fazer esta sozinho, com a IA apenas revisando — é o terceiro MFE, o padrão já se repetiu duas vezes.
- **Conceitos a explicar:** (revisão ativa) peça para a IA fazer 5 perguntas sobre o que você aprendeu nas fases 1–3 antes de começar, e corrigir suas respostas.
- **Critérios de aceite:** fluxo de metas completo standalone; código revisado pela IA com feedback.

---

### FASE 4 — Integração e roteamento no shell

#### T-4.1 — Rotas + lazy + resiliência ⭐
- **Objetivo:** as 3 páginas acessíveis por URL no shell, com skeleton no carregamento e fallback de erro por remote (RF-S2/S3/S4).
- **Instruções para a IA:** React Router v7 (library mode) no shell; `react-router-dom` entra em `shared` singleton em TODOS os apps; wrappers em `src/remotes/` combinando `lazy` + `Suspense` (Skeleton do DS) + `ErrorBoundary` com card de erro e botão retry (re-tentar o import); rotas `/`, `/transactions`, `/goals`.
- **Conceitos a explicar:** por que o router precisa ser singleton (dois routers = históricos divergentes); ErrorBoundary (só classe pega erro de render/lazy) e a técnica de retry de dynamic import; deep-linking: por que `/transactions` funciona direto (e o papel do fallback do dev server/hosting para SPA).
- **Critérios de aceite:** navegação e URL direta funcionam; derrubar :3003 → página Transações mostra card de erro com retry e o resto do app segue vivo; subir :3003 e clicar retry recupera sem F5.

#### T-4.2 — Layout final com o DS
- **Objetivo:** shell com cara de produto (RF-S1): sidebar com navegação ativa, header com título dinâmico.
- **Instruções para a IA:** construir Sidebar/Header com componentes do DS + `NavLink`; título via mapa de rotas; ajustes visuais finais no playground se necessário.
- **Conceitos a explicar:** padrões de layout raiz com React Router (`<Outlet/>`); manter o shell "burro" — regra prática: shell não conhece regras de negócio, só composição.
- **Critérios de aceite:** visual coeso nas 3 páginas; item ativo destacado na sidebar.

---

### FASE 5 — Estado compartilhado e comunicação entre MFEs

#### T-5.1 — Store compartilhada (`@findash/store`) como singleton ⭐
- **Objetivo:** transações e metas vivendo num store Zustand único, com todos os MFEs lendo/escrevendo a MESMA instância.
- **Instruções para a IA:** criar `packages/store` com slices `transactions` e `goals` (estado + actions que chamam os repositórios); **declarar `@findash/store` e `zustand` em `shared: { singleton: true }` em todos os MF configs**; refatorar os 3 MFEs para consumir o store; overview passa a reagir a criações feitas no transactions (RF-O4).
- **Conceitos a explicar (o segundo conceito mais importante do projeto):**
  1. O experimento de prova: ANTES de marcar como singleton, rodar sem, criar uma transação em /transactions, navegar para / e ver que o overview NÃO atualiza (duas instâncias!). Depois ligar o singleton e ver funcionar. Errar de propósito aqui vale ouro.
  2. Como o share scope entrega o mesmo módulo para todos.
  3. Zustand em 10 minutos (store fora do React, hooks seletores, por que menos boilerplate que Redux aqui).
  4. Trade-off honesto: estado compartilhado é acoplamento; em MFE de verdade, minimize-o (regra: compartilhe o mínimo viável).
- **Critérios de aceite:** criar transação em /transactions → saldo em / atualiza sem reload; o experimento "sem singleton" foi executado e anotado em `docs/learnings/fase-5.md`.

#### T-5.2 — Custom Events + Toast global
- **Objetivo:** shell exibindo toasts para `findash:transaction-added` e `findash:goal-contribution` (RF-S5).
- **Instruções para a IA:** hook `useFindashEvent(name, handler)` tipado (wrapper de `addEventListener` com cleanup) em `@findash/domain`; shell escuta e dispara `Toast` do DS; garantir payloads tipados via contrato da seção 5.
- **Conceitos a explicar:** CustomEvent e `detail`; por que eventos DOM são o mecanismo MAIS desacoplado (zero dependência de módulo — funcionaria até entre frameworks diferentes); tipagem de eventos (declaration merging em `WindowEventMap`).
- **Critérios de aceite:** toasts aparecem nas duas ações, disparados de MFEs diferentes do que os renderiza.

#### T-5.3 — Retrospectiva: store vs. eventos (estudo guiado)
- **Objetivo:** critérios claros de quando usar cada padrão.
- **Instruções para a IA:** montar comparativo com os DOIS casos reais implementados; simular 3 cenários novos ("badge de notificações no header", "filtro global de mês", "MFE de relatórios em Vue") e decidir juntos qual mecanismo usaria; registrar em `docs/learnings/`.
- **Critérios de aceite:** tabela de decisão escrita com suas palavras e revisada pela IA.

---

### FASE 6 — Qualidade: tipos federados, testes e higiene

#### T-6.1 — DTS federado de ponta a ponta
- **Objetivo:** autocomplete e typecheck dos módulos remotos funcionando nos hosts, com CI-friendly setup.
- **Instruções para a IA:** revisar `dts: true` nos remotes; entender a pasta `@mf-types` gerada nos hosts (gitignore ou versionar? discutir); garantir que `pnpm typecheck` da raiz passa mesmo sem os dev servers rodando (estratégia para tipos em CI).
- **Conceitos a explicar:** como o MF 2.0 gera/distribui tipos (build do remote → zip de d.ts → host baixa); hot types reload em dev; limitações conhecidas.
- **Critérios de aceite:** quebrar a prop de um componente do DS de propósito → typecheck do shell acusa o erro.

#### T-6.2 — Testes de amostra com Vitest + Testing Library
- **Objetivo:** padrão de teste estabelecido com exemplos reais (não cobertura total — amostra didática).
- **Instruções para a IA:** configurar Vitest + @testing-library/react no `design-system` (testar `Button`: variantes, click, disabled) e no `mfe-transactions` (testar validação do formulário); script `test` na raiz.
- **Conceitos a explicar:** por que testar MFEs isoladamente é natural nessa arquitetura (cada app testa o seu — autonomia de novo); o que NÃO testamos aqui (integração federada de verdade exige E2E — citar como seria com Playwright).
- **Critérios de aceite:** `pnpm test` verde na raiz; um teste falha quando você quebra a validação de propósito.

#### T-6.3 — Medição de bundles
- **Objetivo:** consciência do custo de cada app e da duplicação de CSS aceita no ADR-005.
- **Instruções para a IA:** rodar builds de produção com analyzer; montar tabela (app × JS inicial × CSS × chunks federados); conferir o custo real da duplicação de utilitários Tailwind; comparar com o cenário hipotético sem `shared` (React duplicado).
- **Critérios de aceite:** tabela em `docs/learnings/fase-6.md` com números reais e 3 conclusões suas.

---

### FASE 7 — CI com pipelines independentes

#### T-7.1 — Workflow de CI para PRs ⭐
- **Objetivo:** PR roda lint + typecheck + test + build **apenas dos apps/pacotes afetados**.
- **Instruções para a IA:** `.github/workflows/ci.yml` com: detecção de mudanças por path (ex.: `dorny/paths-filter`) mapeando cada app/pacote; jobs por app condicionados ao filtro; regra de dependência (mudou `packages/*` → roda tudo que depende); cache do pnpm; **comentar no YAML o paralelo de cada conceito com Azure DevOps** (trigger paths, jobs/stages, condições, cache).
- **Conceitos a explicar:** por que CI independente é METADE do valor de MFE (build de 10 min do monolito → 2 min do app tocado); matriz vs. jobs explícitos; o problema "mudou o pacote compartilhado" e as estratégias (grafo de dependência manual vs. ferramentas como Turborepo/Nx `affected`).
- **Critérios de aceite:** PR alterando só `mfe-goals` dispara apenas o job dele (+ raiz); PR alterando `packages/domain` dispara os dependentes; badge de CI no README.

#### T-7.2 — (Estudo) Monorepo vs. polyrepo em CI
- **Objetivo:** você dominar o discurso completo para entrevistas/decisões reais.
- **Instruções para a IA:** discutir: como seria este projeto em 5 repositórios? (contratos de tipos entre repos, versionamento do manifest, orquestração de deploys, ownership); quando cada modelo vence; escrever resumo em `docs/learnings/fase-7.md`.
- **Critérios de aceite:** resumo escrito; você consegue defender os dois modelos em 2 minutos cada (teste oral com a IA).

---

### FASE 8 — Deploy em produção

#### T-8.1 — Deploy dos remotes na Vercel
- **Objetivo:** `design-system`, `mfe-overview`, `mfe-transactions`, `mfe-goals` publicados, cada um com URL própria.
- **Instruções para a IA:** guiar a criação dos 4 projetos Vercel (mesmo repo, Root Directory de cada app, build `pnpm build`, output `dist/`); configurar `vercel.json` de cada remote com **headers CORS** (`Access-Control-Allow-Origin` para o manifest e chunks) e cache adequado (manifest sem cache agressivo; chunks com hash → cache imutável).
- **Conceitos a explicar:** por que CORS aparece AGORA (origens diferentes de verdade — em dev tudo era localhost); a política correta de cache para artefatos federados (o manifest é o "ponteiro" que muda, os chunks são imutáveis) — este é um dos aprendizados mais valiosos de MFE em produção.
- **Critérios de aceite:** cada URL de remote serve seu `mf-manifest.json` acessível de outra origem (testar com `fetch` no console de outra página).

#### T-8.2 — URLs de remotes por ambiente no shell
- **Objetivo:** shell alternando remotes localhost (dev) ↔ URLs Vercel (prod) sem tocar em código.
- **Instruções para a IA:** extrair as URLs dos remotes para variáveis `PUBLIC_REMOTE_*` (Rsbuild expõe `PUBLIC_` ao client); `.env.development` com localhost e env de produção configurada na Vercel; montar o objeto `remotes` a partir delas.
- **Conceitos a explicar:** env vars em build de frontend (são "assadas" no bundle — diferença para env de servidor); estratégias mais avançadas citadas (manifest central de remotes, descoberta em runtime) e quando valem a pena.
- **Critérios de aceite:** `pnpm dev` usa localhost; build de produção aponta para Vercel (conferir no bundle/network).

#### T-8.3 — Deploy do shell + smoke test ⭐ (o momento da verdade)
- **Objetivo:** aplicação completa no ar, com remotes servidos de 4 origens diferentes.
- **Instruções para a IA:** criar o projeto Vercel do shell com SPA fallback (rewrites → `index.html` para deep-linking); publicar; smoke test guiado: navegar tudo, criar transação, ver toast, conferir Network (chunks vindo de 4 domínios!).
- **Conceitos a explicar:** revisão do fluxo completo em produção; o que monitoraríamos aqui num produto real (erro de carregamento de remote é o alerta nº 1 de MFE).
- **Critérios de aceite:** URL pública funcionando de ponta a ponta, inclusive URL direta em `/transactions`; screenshot da aba Network com as 4 origens salvo em `docs/learnings/`.

#### T-8.4 — Deploy contínuo independente
- **Objetivo:** merge na `main` tocando um app → só ele é publicado; e a prova final do desacoplamento.
- **Instruções para a IA:** workflows `deploy-<app>.yml` (trigger por path na main, build e `vercel deploy --prebuilt --prod` via CLI + secrets); **teste de fogo:** alterar um texto no `mfe-goals`, merge, e observar a mudança aparecer no shell publicado **sem nenhum deploy do shell**.
- **Conceitos a explicar:** por que isso é impossível num monolito SPA (o argumento de negócio de MFE materializado); riscos do release runtime (quebrou o remote → quebrou prod na hora) e mitigação (versionamento de manifest, canary, feature flags — citar).
- **Critérios de aceite:** o teste de fogo executado com sucesso e documentado com timestamps dos deploys.

---

### FASE 9 (BÔNUS) — Scaffolding: o comando `create-mfe`

#### T-9.1 — CLI generator com Plop
- **Objetivo:** `pnpm create-mfe relatorios` gera `apps/mfe-relatorios` completo e padronizado em segundos.
- **Instruções para a IA:** criar `tools/create-mfe` com Plop; templates Handlebars para: `package.json` (nome, porta = próxima livre — ler as existentes), `rsbuild.config.ts` (MF config com nome derivado), `tsconfig.json`, `src/main.tsx`, `src/bootstrap.tsx`, página inicial e `README`; prompt interativo (nome, expõe página? porta); pós-geração: instruções impressas de como registrar no shell (env + rota + wrapper) — registrar automaticamente fica como desafio extra.
- **Conceitos a explicar:** anatomia de um generator (prompts → actions → templates); Plop vs. Hygen vs. CLI custom com commander (quando cada um); como generators codificam decisões de arquitetura ("o jeito certo vira o jeito fácil") — conectar com os generators do Nx e com casos reais de plataforma interna em empresas.
- **Critérios de aceite:** rodar o comando, `pnpm install`, e o novo MFE sobe standalone sem editar nada; registrá-lo no shell manualmente leva < 5 min seguindo as instruções impressas.

#### T-9.2 — Documentar o generator + retrospectiva final
- **Objetivo:** fechamento do projeto.
- **Instruções para a IA:** README do `create-mfe`; atualizar o README raiz com GIF/screenshot do produto e mapa de aprendizados; retrospectiva guiada: a IA faz 10 perguntas de entrevista sobre MFE/MF/CI-CD cobrindo o projeto inteiro e avalia suas respostas.
- **Critérios de aceite:** você responde ≥ 8 das 10 com segurança. Se sim: pronto para o Projeto 2 (JWT + backend). 🎓

---

## 8. Critérios de conclusão do projeto (Definition of Done global)

- [ ] 5 apps rodando integrados em produção, servidos de origens distintas.
- [ ] Alterar 1 app → apenas 1 pipeline roda e 1 deploy acontece (provado na T-8.4).
- [ ] Design system consumido em runtime por 4 apps, com tipos federados funcionando.
- [ ] Criar transação em um MFE reflete em outro sem reload (singleton provado na T-5.1).
- [ ] Um remote fora do ar não derruba o shell (provado na T-4.1).
- [ ] `docs/decisions/` com ≥ 6 ADRs e `docs/learnings/` com anotações de todas as fases.
- [ ] CLI `create-mfe` gerando apps funcionais.
- [ ] Você explica de memória: shared/singleton, manifest, bootstrap assíncrono, estratégia de CSS, CI por paths e cache de artefatos federados.

## 9. Glossário rápido

| Termo | Definição curta |
|---|---|
| **Host** | App que consome módulos remotos em runtime (nosso shell). |
| **Remote** | App que expõe módulos para outros consumirem. |
| **`exposes`** | Mapa do que um remote torna público (`'./Button': './src/...'`). |
| **`shared`** | Dependências negociadas em runtime entre host e remotes para evitar duplicação. |
| **Singleton** | Garantia de instância única de uma dependência compartilhada (obrigatório p/ React, router, store). |
| **`mf-manifest.json`** | Manifesto do MF 2.0 com metadados do remote (o que expõe, versões, chunks). |
| **DTS federado** | Distribuição automática dos tipos TS de um remote para seus hosts. |
| **Share scope** | Registro em runtime onde host e remotes negociam versões das shared deps. |
| **Bootstrap assíncrono** | Padrão `main.tsx → import('./bootstrap')` que permite ao MF resolver shared antes do app executar. |
| **Shell** | O host "casca" que orquestra layout, rotas e composição dos MFEs. |

## 10. Referências para aprofundar

- Documentação oficial do Module Federation (module-federation.io) — conceitos, MF 2.0, DTS, manifest.
- Documentação do Rsbuild (rsbuild.rs) — guia de Module Federation e config.
- `@module-federation/rsbuild-plugin` (npm) — README com exemplos host/remote.
- Tailwind CSS v4 — guia da config CSS-first (`@theme`).
- micro-frontends.org — o texto seminal sobre a arquitetura (leitura da Fase 1).
- Zustand docs — guia de stores fora de componentes.
- React Router v7 (library mode) — data APIs e composição de rotas.

---

> **Próximo passo depois de concluir:** Projeto 2 — Plataforma de Cursos. Reaproveitaremos o design system e o CLI daqui, e adicionaremos: backend Node emitindo **JWT**, MFE de autenticação, rotas protegidas e claims/roles entre MFEs. Esta spec foi desenhada para que a transição seja natural (ver ADR-008).
