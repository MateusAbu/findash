/**
 * Cores disponíveis para metas (RF-G2). São DADOS escolhidos pelo usuário
 * (identidade de cada meta), não tema — por isso vivem aqui e não nos tokens.
 * Valores fixos: cor dinâmica via classe (`bg-${cor}`) é invisível ao scanner
 * do Tailwind; a ProgressBar recebe cor via prop `color` (CSS), por design.
 */
export declare const GOAL_COLORS: Record<string, string>;
export declare const GOAL_COLOR_LABELS: Record<keyof typeof GOAL_COLORS & string, string>;
