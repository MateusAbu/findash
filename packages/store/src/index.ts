import { create } from 'zustand';
import {
  goalRepository,
  transactionRepository,
  type Goal,
  type Transaction,
} from '@findash/domain';

/**
 * Estado vivo de SESSÃO (cache em memória). A persistência continua nos
 * repositórios (ADR-008) — cada action escreve lá e espelha aqui.
 *
 * ATENÇÃO (T-5.1): este módulo só funciona como fonte única de verdade se
 * for entregue como UMA instância a todos os MFEs — '@findash/store' e
 * 'zustand' precisam estar em shared: { singleton: true } em todos os MF
 * configs. Sem isso, cada MFE embarca a própria cópia (N stores!).
 */

type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;
type GoalInput = Omit<Goal, 'id' | 'createdAt' | 'savedCents'>;

interface FindashStore {
  // ---- slice: transactions -------------------------------------------
  transactions: Transaction[];
  transactionsLoaded: boolean;
  /** Carrega uma vez por sessão; force=true recarrega do repositório. */
  loadTransactions: (force?: boolean) => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, patch: Partial<Transaction>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;

  // ---- slice: goals ---------------------------------------------------
  goals: Goal[];
  goalsLoaded: boolean;
  loadGoals: () => Promise<void>;
  addGoal: (input: GoalInput) => Promise<void>;
  contributeToGoal: (id: string, amountCents: number) => Promise<void>;
}

export const useFindashStore = create<FindashStore>((set, get) => ({
  // ---- transactions ----------------------------------------------------
  transactions: [],
  transactionsLoaded: false,

  async loadTransactions(force = false) {
    if (!force && get().transactionsLoaded) return; // idempotente por sessão
    const transactions = await transactionRepository.list();
    set({ transactions, transactionsLoaded: true });
  },

  async addTransaction(input) {
    const transaction = await transactionRepository.add(input);
    set((s) => ({ transactions: [...s.transactions, transaction] }));
    return transaction;
  },

  async updateTransaction(id, patch) {
    const updated = await transactionRepository.update(id, patch);
    set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? updated : t)) }));
  },

  async removeTransaction(id) {
    await transactionRepository.remove(id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },

  // ---- goals ------------------------------------------------------------
  goals: [],
  goalsLoaded: false,

  async loadGoals() {
    if (get().goalsLoaded) return;
    const goals = await goalRepository.list();
    set({ goals, goalsLoaded: true });
  },

  async addGoal(input) {
    const goal = await goalRepository.add(input);
    set((s) => ({ goals: [...s.goals, goal] }));
  },

  async contributeToGoal(id, amountCents) {
    const updated = await goalRepository.addContribution(id, amountCents);
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? updated : g)) }));
  },
}));
