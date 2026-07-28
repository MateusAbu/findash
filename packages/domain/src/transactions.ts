import { ALL_CATEGORIES, type Transaction } from './types';
import { readCollection, writeCollection } from './storage';

const KEY = 'findash:transactions';

export interface TransactionRepository {
  list(): Promise<Transaction[]>;
  add(input: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  update(id: string, patch: Partial<Transaction>): Promise<Transaction>;
  remove(id: string): Promise<void>;
}

// Validação leve na leitura: campos essenciais com o tipo certo.
function isTransaction(item: unknown): item is Transaction {
  if (typeof item !== 'object' || item === null) return false;
  const t = item as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    (t.type === 'income' || t.type === 'expense') &&
    typeof t.amountCents === 'number' &&
    Number.isInteger(t.amountCents) &&
    t.amountCents > 0 &&
    ALL_CATEGORIES.includes(t.category as (typeof ALL_CATEGORIES)[number]) &&
    typeof t.description === 'string' &&
    typeof t.date === 'string'
  );
}

// Interface assíncrona de propósito: já tem a forma de uma API HTTP.
// No Projeto 2, esta implementação vira fetch + JWT sem tocar nos MFEs.
export const transactionRepository: TransactionRepository = {
  async list() {
    return readCollection(KEY, isTransaction);
  },

  async add(input) {
    const transaction: Transaction = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    writeCollection(KEY, [...readCollection(KEY, isTransaction), transaction]);
    return transaction;
  },

  async update(id, patch) {
    const all = readCollection(KEY, isTransaction);
    const current = all.find((t) => t.id === id);
    if (!current) throw new Error(`Transação não encontrada: ${id}`);
    const updated: Transaction = { ...current, ...patch, id: current.id };
    writeCollection(
      KEY,
      all.map((t) => (t.id === id ? updated : t)),
    );
    return updated;
  },

  async remove(id) {
    writeCollection(
      KEY,
      readCollection(KEY, isTransaction).filter((t) => t.id !== id),
    );
  },
};
