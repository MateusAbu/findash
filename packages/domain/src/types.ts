export type TransactionType = 'income' | 'expense';

// Arrays const são a fonte; o tipo Category deriva deles. Servem também de
// opções para <select> e de validação em runtime (ver storage.ts).
export const INCOME_CATEGORIES = ['salary', 'freelance', 'investments'] as const;
export const EXPENSE_CATEGORIES = [
  'housing',
  'food',
  'transport',
  'health',
  'leisure',
  'education',
  'other',
] as const;
export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as const;

export type Category = (typeof ALL_CATEGORIES)[number];

export interface Transaction {
  id: string; // crypto.randomUUID()
  type: TransactionType;
  amountCents: number; // sempre positivo; o type dá o sinal (ver T-3.1)
  category: Category;
  description: string;
  date: string; // ISO 8601 (yyyy-mm-dd)
  createdAt: string; // ISO datetime
}

export interface Goal {
  id: string;
  name: string; // "Reserva de emergência"
  targetCents: number;
  savedCents: number;
  deadline?: string; // ISO date, opcional
  color: string; // token de cor do DS (ex.: 'emerald')
  createdAt: string;
}
