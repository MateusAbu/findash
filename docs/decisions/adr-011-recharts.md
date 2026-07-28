# ADR-011 — Recharts fora de `shared` na federation

- **Status:** aceito
- **Data:** 2026-07-28
- **Task relacionada:** T-3.3

## Contexto

O `mfe-overview` precisa de gráfico de barras (RF-O2) e adota Recharts (~103 kB
gzip). Surge a decisão: declarar `recharts` em `shared` na federation ou deixar
no bundle do app? Critérios avaliados (na ordem): exigência de singleton,
tamanho, número de consumidores hoje, estabilidade de versão.

## Opções consideradas

1. **Fora de `shared`** — (+) zero negociação extra no boot; apps 100%
   independentes para atualizar a lib; a lib cai no chunk async do expose
   (lazy de graça: só baixa ao renderizar o overview). (−) se um segundo MFE
   adotar gráficos, haverá duplicação (~103 kB gzip por consumidor extra).
2. **Em `shared` (sem singleton)** — (+) uma cópia negociada se houver N
   consumidores. (−) acoplamento de versão entre MFEs (upgrade coordenado);
   negociação extra em runtime; benefício zero com um consumidor.

## Medição (rsbuild build, valores reais)

| Cenário | Total do app | Chunk do Recharts | Observação |
|---|---|---|---|
| A — fora de shared | 830 kB (246 kB gzip) | async `846`: 362 kB (103,6 kB gzip) | baixa junto do expose (lazy) |
| B — em shared | 1.032 kB (291 kB gzip) | shared `787`: 561 kB (148 kB gzip) | manifest passa a negociar `recharts@3.10.1` |

**Surpresa da medição:** com um único consumidor, `shared` deixou o artefato
**~45 kB gzip maior** — o mecanismo de shared embarca a cópia de fallback mais
a estrutura de negociação. Ou seja: hoje, compartilhar custa bytes em vez de
economizar.

## Decisão

**Recharts fora de `shared`.** Recharts é stateless — duas instâncias não
quebram nada (diferente de React/router/store, onde singleton é correção, não
otimização). Com um único consumidor, shared é custo puro (medido acima).

**Gatilho de revisão registrado:** se o `mfe-goals` (ou outro MFE) adotar
biblioteca de gráficos, refazer esta medição com dois consumidores e reavaliar
— a duplicação de ~103 kB gzip por app passa a ser o outro lado da balança.

## Consequências

- (+) Boot sem negociação extra; upgrade de Recharts é decisão local do overview.
- (+) Lib carrega lazy, junto do chunk federado da página.
- (−) Duplicação futura se outro MFE usar gráficos (gatilho de revisão acima).
