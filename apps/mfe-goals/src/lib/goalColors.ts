/**
 * Cores disponíveis para metas (RF-G2). São DADOS escolhidos pelo usuário
 * (identidade de cada meta), não tema — por isso vivem aqui e não nos tokens.
 * Valores fixos: cor dinâmica via classe (`bg-${cor}`) é invisível ao scanner
 * do Tailwind; a ProgressBar recebe cor via prop `color` (CSS), por design.
 */
export const GOAL_COLORS: Record<string, string> = {
  emerald: '#059669',
  sky: '#0284c7',
  amber: '#d97706',
  rose: '#e11d48',
  violet: '#7c3aed',
};

export const GOAL_COLOR_LABELS: Record<keyof typeof GOAL_COLORS & string, string> = {
  emerald: 'Verde',
  sky: 'Azul',
  amber: 'Âmbar',
  rose: 'Rosa',
  violet: 'Violeta',
};
