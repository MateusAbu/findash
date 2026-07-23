// Boundary assíncrono: todo o código real (React, App) vive num chunk carregado
// depois deste módulo — a janela que o Module Federation usará (T-1.3) para
// negociar as dependências compartilhadas antes do React executar.
import('./bootstrap');

// isolatedModules exige que todo arquivo seja um módulo; import() dinâmico
// sozinho não conta como import estático.
export {};
