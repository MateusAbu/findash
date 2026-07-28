import { useEffect, useMemo, useState } from 'react';
import Button from 'ds/Button';
import Card from 'ds/Card';
import EmptyState from 'ds/EmptyState';
import Label from 'ds/Label';
import Select from 'ds/Select';
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  TYPE_LABELS,
  emitFindashEvent,
  seedDemoData,
  transactionRepository,
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

// Módulo exposto ('./TransactionsPage'): burro quanto ao ambiente — não sabe
// se está no shell ou standalone. Estado 100% LOCAL por enquanto (Fase 5
// promove a lista para a store compartilhada, de propósito).
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  async function refresh() {
    setTransactions(await transactionRepository.list());
  }

  // Carga inicial: setState no callback da Promise (claramente assíncrono —
  // a regra set-state-in-effect do react-hooks v7 barra o formato síncrono).
  useEffect(() => {
    void transactionRepository.list().then(setTransactions);
  }, []);

  async function handleSubmit(values: TransactionFormValues) {
    if (editing) {
      await transactionRepository.update(editing.id, values);
      setEditing(null);
    } else {
      const transaction = await transactionRepository.add(values);
      // RF-T5: notificação efêmera, sem dependência de módulo (ver T-5.2).
      emitFindashEvent('findash:transaction-added', { transaction });
    }
    await refresh();
  }

  async function handleRemove(transaction: Transaction) {
    // RF-T3: exclusão com confirmação — o confirm nativo resolve o modal.
    if (!window.confirm(`Excluir "${transaction.description}"?`)) return;
    await transactionRepository.remove(transaction.id);
    if (editing?.id === transaction.id) setEditing(null);
    await refresh();
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
                  await refresh();
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
