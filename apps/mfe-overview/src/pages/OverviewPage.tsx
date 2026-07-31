import { useEffect, useMemo } from 'react';
import Badge from 'ds/Badge';
import Button from 'ds/Button';
import Card from 'ds/Card';
import EmptyState from 'ds/EmptyState';
import { useFindashStore } from '@findash/store';
import { CATEGORY_LABELS, formatCents, seedDemoData, type Category } from '@findash/domain';
import ExpensesByCategoryChart, { type CategoryTotal } from '../components/ExpensesByCategoryChart';
// O chunk federado desta página carrega o próprio CSS (ADR-005).
import '../styles.css';

function monthLabel(): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

// T-5.1: a lista agora vem da store compartilhada — RF-O4 depende de ela ser
// UMA instância entre os MFEs (singleton no share scope).
export default function OverviewPage() {
  const transactions = useFindashStore((s) => s.transactions);
  const loadTransactions = useFindashStore((s) => s.loadTransactions);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const monthKey = new Date().toISOString().slice(0, 7);
  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(monthKey)),
    [transactions, monthKey],
  );

  // RF-O1: totais do mês corrente, em centavos até a borda.
  const incomeCents = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amountCents, 0);
  const expenseCents = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountCents, 0);
  const balanceCents = incomeCents - expenseCents;

  // RF-O2: despesas do mês agregadas por categoria, maiores primeiro.
  const byCategory: CategoryTotal[] = useMemo(() => {
    const totals = new Map<Category, number>();
    for (const t of monthTransactions) {
      if (t.type === 'expense') totals.set(t.category, (totals.get(t.category) ?? 0) + t.amountCents);
    }
    return [...totals.entries()]
      .map(([category, totalCents]) => ({ label: CATEGORY_LABELS[category], totalCents }))
      .sort((a, b) => b.totalCents - a.totalCents);
  }, [monthTransactions]);

  // RF-O3: as 5 mais recentes (qualquer mês).
  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [transactions],
  );

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Nenhum dado ainda"
        description="Crie transações na página de Transações — ou use dados de exemplo."
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
    );
  }

  return (
    <div className="grid gap-6 font-sans text-text">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-text-muted">Saldo do mês</p>
          <p
            className={`mt-1 text-2xl font-bold ${balanceCents >= 0 ? 'text-success' : 'text-error'}`}
          >
            {formatCents(balanceCents)}
          </p>
          <Badge className="mt-2">{monthLabel()}</Badge>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Receitas do mês</p>
          <p className="mt-1 text-2xl font-bold text-success">{formatCents(incomeCents)}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Despesas do mês</p>
          <p className="mt-1 text-2xl font-bold text-error">{formatCents(expenseCents)}</p>
        </Card>
      </div>

      <Card header={`Despesas por categoria — ${monthLabel()}`}>
        {byCategory.length === 0 ? (
          <EmptyState title="Sem despesas neste mês" description="Bom sinal? 🎉" />
        ) : (
          <ExpensesByCategoryChart data={byCategory} />
        )}
      </Card>

      <Card header="Últimas transações">
        <ul className="divide-y divide-border">
          {recent.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{t.description}</p>
                <p className="text-text-muted">
                  {formatDate(t.date)} · {CATEGORY_LABELS[t.category]}
                </p>
              </div>
              <span
                className={`whitespace-nowrap font-medium ${
                  t.type === 'income' ? 'text-success' : 'text-error'
                }`}
              >
                {t.type === 'income' ? '+' : '−'}&nbsp;{formatCents(t.amountCents)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
