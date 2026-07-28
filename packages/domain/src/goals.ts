import type { Goal } from './types';
import { readCollection, writeCollection } from './storage';

const KEY = 'findash:goals';

export interface GoalRepository {
  list(): Promise<Goal[]>;
  add(input: Omit<Goal, 'id' | 'createdAt' | 'savedCents'>): Promise<Goal>;
  update(id: string, patch: Partial<Goal>): Promise<Goal>;
  remove(id: string): Promise<void>;
  /** Registra um aporte (centavos inteiros > 0) somando em savedCents. */
  addContribution(id: string, cents: number): Promise<Goal>;
}

function isGoal(item: unknown): item is Goal {
  if (typeof item !== 'object' || item === null) return false;
  const g = item as Record<string, unknown>;
  return (
    typeof g.id === 'string' &&
    typeof g.name === 'string' &&
    typeof g.targetCents === 'number' &&
    Number.isInteger(g.targetCents) &&
    g.targetCents > 0 &&
    typeof g.savedCents === 'number' &&
    Number.isInteger(g.savedCents) &&
    g.savedCents >= 0 &&
    typeof g.color === 'string'
  );
}

export const goalRepository: GoalRepository = {
  async list() {
    return readCollection(KEY, isGoal);
  },

  async add(input) {
    const goal: Goal = {
      ...input,
      savedCents: 0,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    writeCollection(KEY, [...readCollection(KEY, isGoal), goal]);
    return goal;
  },

  async update(id, patch) {
    const all = readCollection(KEY, isGoal);
    const current = all.find((g) => g.id === id);
    if (!current) throw new Error(`Meta não encontrada: ${id}`);
    const updated: Goal = { ...current, ...patch, id: current.id };
    writeCollection(
      KEY,
      all.map((g) => (g.id === id ? updated : g)),
    );
    return updated;
  },

  async remove(id) {
    writeCollection(
      KEY,
      readCollection(KEY, isGoal).filter((g) => g.id !== id),
    );
  },

  async addContribution(id, cents) {
    if (!Number.isInteger(cents) || cents <= 0) {
      throw new Error(`Aporte inválido: ${cents} (esperado inteiro de centavos > 0)`);
    }
    const current = readCollection(KEY, isGoal).find((g) => g.id === id);
    if (!current) throw new Error(`Meta não encontrada: ${id}`);
    return this.update(id, { savedCents: current.savedCents + cents });
  },
};
