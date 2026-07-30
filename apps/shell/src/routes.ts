// Fonte única do mapa de navegação (ADR-006: o shell é o dono das rotas).
// Sidebar usa `label`; Header usa `title`; App usa `path` + o loader.
export const ROUTES = [
  { path: '/', label: 'Dashboard', title: 'Visão geral' },
  { path: '/transactions', label: 'Transações', title: 'Transações' },
  { path: '/goals', label: 'Metas', title: 'Metas de economia' },
] as const;

export type AppRoute = (typeof ROUTES)[number];
