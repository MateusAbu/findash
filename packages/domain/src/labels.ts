import type { Category, TransactionType } from './types';

// Rótulos de UI junto do tipo Category (coesão): os 3 MFEs exibem os mesmos
// nomes. Projeto é pt-BR único; i18n mudaria esta abordagem.
export const CATEGORY_LABELS: Record<Category, string> = {
  salary: 'Salário',
  freelance: 'Freelance',
  investments: 'Investimentos',
  housing: 'Moradia',
  food: 'Alimentação',
  transport: 'Transporte',
  health: 'Saúde',
  leisure: 'Lazer',
  education: 'Educação',
  other: 'Outros',
};

export const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
};
