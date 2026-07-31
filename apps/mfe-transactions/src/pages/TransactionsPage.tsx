import { useEffect, useMemo, useState } from 'react';
import Button from 'ds/Button';
import Card from 'ds/Card';
import EmptyState from 'ds/EmptyState';
import Label from 'ds/Label';
import Select from 'ds/Select';
import { useFindashStore } from '@findash/store';
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  TYPE_LABELS,
  emitFindashEvent,
  seedDemoData,
  type Category,
  type Transaction,
  type TransactionType,
} from '@findash/domain';
import TransactionForm, { type TransactionFormValues } from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
// O chunk federado desta página carrega o próprio CSS (ADR-005).
import '../styles.css';

type TypeFilter = TransactionType | 'all';
type CategoryFilter = Category | 'all';

// Módulo exposto ('./TransactionsPage'): burro quanto ao ambiente. T-5.1: a
// LISTA vive na store compartilhada; filtros e edição seguem locais (regra:
// compartilhe o mínimo viável).
export default function TransactionsPage() {
  const transactions = useFindashStore((s) => s.transactions);
  const loadTransactions = useFindashStore((s) => s.loadTransactions);
  const addTransaction = useFindashStore((s) => s.addTransaction);
  const updateTransaction = useFindashStore((s) => s.updateTransaction);
  const removeTransaction = useFindashStore((s) => s.removeTransaction);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  async function handleSubmit(values: TransactionFormValues) {
    if (editing) {
      await updateTransaction(editing.id, values);
      setEditing(null);
    } else {
      const transaction = await addTransaction(values);
      // RF-T5: notificação efêmera, sem dependência de módulo (ver T-5.2).
      emitFindashEvent('findash:transaction-added', { transaction });
    }
  }

  async function handleRemove(transaction: Transaction) {
    // RF-T3: exclusão com confirmação — o confirm nativo resolve o modal.
    if (!window.confirm(`Excluir "${transaction.description}"?`)) return;
    await removeTransaction(transaction.id);
    if (editing?.id === transaction.id) setEditing(null);
  }

  // RF-T4: filtros client-side + ordenação por data (mais recente primeiro).
  const filtered = useMemo(
    () =>
      [...transactions]
        .filter(
          (t) =>
            (typeFilter === 'all' || t.type === typeFilter) &&
            (categoryFilter === 'all' || t.category === categoryFilter),
        )
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [transactions, typeFilter, categoryFilter],
  );

  return (
    <div className="grid items-start gap-6 font-sans text-text lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card header="Transações">
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <Label htmlFor="filter-type">Tipo</Label>
            <Select
              id="filter-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            >
              <option value="all">Todos</option>
              <option value="income">{TYPE_LABELS.income}</option>
              <option value="expense">{TYPE_LABELS.expense}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-category">Categoria</Label>
            <Select
              id="filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            >
              <option value="all">Todas</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            title="Nenhuma transação ainda"
            description="Registre sua primeira receita ou despesa no formulário ao lado."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await seedDemoData();
                  await loadTransactions(true);
                }}
              >
                Usar dados de exemplo
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nada encontrado com esses filtros"
            description="Ajuste o tipo ou a categoria acima."
          />
        ) : (
          <TransactionTable transactions={filtered} onEdit={setEditing} onRemove={handleRemove} />
        )}
      </Card>

      <TransactionForm
        key={editing?.id ?? 'new'}
        editing={editing}
        onSubmit={handleSubmit}
        onCancelEdit={() => setEditing(null)}
      />
    </div>
  );
}
