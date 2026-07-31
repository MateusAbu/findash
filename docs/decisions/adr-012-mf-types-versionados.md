# ADR-012 — Versionar @mf-types/ (tipos federados) no git

- **Status:** aceito
- **Data:** 2026-07-30
- **Task relacionada:** T-6.1

## Contexto

O MF 2.0 gera os tipos dos módulos remotos no build do remote
(`dist/@mf-types.zip`) e os hosts os baixam para `<host>/@mf-types/` quando
rodam dev/build com o remote no ar. A pasta é artefato gerado — e o
`pnpm typecheck` da raiz precisa passar em clone frio, sem dev servers
(requisito do CI por app da Fase 7).

## Opções consideradas

1. **Versionar `@mf-types/`** — (+) typecheck frio funciona; (+) mudança de
   API entre MFEs aparece no diff do PR (contrato revisável); (−) arquivos
   gerados no repo, diffs quando tipos mudam.
2. **Manter no .gitignore** — (+) repo sem artefatos; (−) o CI de cada host
   teria que buildar TODOS os remotes antes do typecheck, acoplando os
   pipelines que a Fase 7 quer independentes.
3. **`.d.ts` manuais de fallback** — descartado na T-2.4: tipagem paralela
   que mente quando o remote muda.

## Decisão

**Versionar.** O hot types reload de dev mantém os arquivos frescos sem passo
manual; o diff de PR ganha visibilidade de quebra de contrato entre times —
em MFE, isso vale mais que a estética de repo sem artefatos.

## Consequências

- (+) `tsc --noEmit` verde em qualquer clone, sem orquestração no CI.
- (+) Quebra de API federada é revisável no PR.
- (−) Diffs de tipos gerados acompanham mudanças no DS (aceitável; são a
  parte "pública" da mudança).
