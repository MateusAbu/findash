# ADR-001 — Bundler: Rsbuild (motor Rspack), não Webpack puro nem Vite

- **Status:** aceito
- **Data:** 2026-07-22
- **Task relacionada:** T-0.3 (decisão originada na spec v1.0, seção 3)

## Contexto

Module Federation nasceu no Webpack 5 (2020). Em 2026 há três caminhos viáveis: Webpack 5, Rspack/Rsbuild e Vite (via plugin). Critérios de escolha: (a) relevância no mercado de trabalho, (b) qualidade do suporte a Module Federation — a feature central do estudo, (c) experiência de desenvolvimento.

## Opções consideradas

1. **Webpack 5** — (+) berço do MF, domina codebases enterprise e legadas; (−) builds lentos, DX datada.
2. **Rspack / Rsbuild** — (+) suporte first-class ao MF 2.0 (o time do Rspack trabalha junto com os mantenedores do MF); ~98% compatível com a API do Webpack, então o conhecimento transfere para os dois lados; builds 5–10× mais rápidos; (−) comunidade menor que a do Vite para dúvidas genéricas.
3. **Vite** — (+) domina projetos novos, dev server muito rápido; (−) MF via `@module-federation/vite` menos maduro (historicamente com limitações em dev mode), e o modelo mental (plugins Rollup) não transfere para Webpack.

## Decisão

**Rsbuild** com o plugin oficial `@module-federation/rsbuild-plugin`. Rsbuild está para o Rspack como o Vite está para o Rollup: convenções prontas (TS, React, CSS, HTML) sobre o motor, com _escape hatch_ (`tools.rspack`) para abrir o capô quando o estudo pedir.

O raciocínio de mercado: microfrontends vivem no mundo corporativo, que é majoritariamente Webpack — aprender Rspack ≈ aprender Webpack (mesmo modelo mental de config, loaders, plugins e chunks), e é o caminho recomendado pelos próprios mantenedores do Module Federation.

## Consequências

- (+) Conhecimento transferível para Webpack (mercado) e para o estado da arte (Rspack).
- (+) Melhor suporte a MF 2.0 disponível hoje (tipos federados, DevTools, manifest).
- (−) Comunidade menor que a do Vite para dúvidas genéricas de build.
- (−) Se um dia migrarmos para Vite, a config não é reaproveitável.
