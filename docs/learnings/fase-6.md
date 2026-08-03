# Fase 6 — Aprendizados

## T-6.3 — Medição de bundles (builds de produção, 30/07/2026)

### Tabela geral (raw / gzip)

| App | Total | Entry (`index.js`) | remoteEntry | Chunk(s) do expose | CSS total (gzip) |
| --- | --- | --- | --- | --- | --- |
| shell | 532,8 / **164,5 kB** | 121,9 / 34,0 kB | — (host puro) | — | 2,5 kB |
| design-system | 740,9 / **282,1 kB** | 121* / ~34 kB | 121* / ~34 kB | 11 exposes de 0,3–0,9 kB gzip cada | 40,8 kB |
| mfe-overview | 840,9 / **249,5 kB** | 120,2 / 33,8 kB | 120,6 / 33,8 kB | 7,6 kB JS + 7,0 kB CSS (+ recharts async 362,4 / 103,6 kB) | 4,6 kB |
| mfe-transactions | 478,6 / **146,1 kB** | 119,7 / 33,7 kB | 120,1 / 33,8 kB | 2,9 kB JS + 6,5 kB CSS | 4,4 kB |
| mfe-goals | 481,0 / **147,3 kB** | 119,8 / 33,7 kB | 120,1 / 33,8 kB | 8,1 kB JS + 6,4 kB CSS | 4,4 kB |

\* aproximado (mesma ordem dos demais).

**Lembrete de leitura:** "total do dist" ≠ "o que o usuário baixa". No shell em
produção, cada remote contribui só com remoteEntry + chunks dos exposes usados
+ CSS federado — os fallbacks de shared (React etc.) ficam no disco do remote
e NÃO trafegam quando a negociação reutiliza a cópia do host.

### O custo real da duplicação de CSS (ADR-005)

- CSS de página dos MFEs: ~2,2 kB gzip cada — utilities de layout, sobreposição
  entre apps na casa de poucos kB. **Irrelevante, como o ADR apostou.**
- A surpresa: o CSS do design system é 40,8 kB gzip porque **cada um dos 11
  exposes carrega o stylesheet completo do app DS** (~3,4 kB gzip × 12 chunks
  quase idênticos). Em runtime o browser baixa 1 por componente usado.
  Otimização possível (não urgente): CSS único compartilhado entre exposes.

### O contrafactual do `shared` (React)

- Cópia do React (com react-dom): ~178 kB raw / **56,4 kB gzip**.
- Sem `shared`, no shell composto: 5 apps × 56,4 kB = **~282 kB gzip de React
  trafegado**. Com `shared` singleton: **56,4 kB** (1 cópia negociada).
- Economia: ~225 kB gzip — e o singleton nem é sobre bytes: é sobre hooks e
  context funcionarem (T-1.3).
- Recharts (ADR-011): 103,6 kB gzip, lazy, só quem visita o overview paga.

### Minhas 3 conclusões (critério de aceite — escreva com suas palavras)

1.
2.
3.
