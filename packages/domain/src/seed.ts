import { transactionRepository } from './transactions';
import { goalRepository } from './goals';

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Popula dados de exemplo para desenvolvimento. Por padrão só roda com o
 * storage vazio; force: true sobrescreve o critério (não apaga existentes).
 */
export async function seedDemoData({ force = false } = {}): Promise<void> {
  const existing = await transactionRepository.list();
  if (existing.length > 0 && !force) return;

  await transactionRepository.add({
    type: 'income',
    amountCents: 850000,
    category: 'salary',
    description: 'Salário',
    date: isoDaysAgo(5),
  });
  await transactionRepository.add({
    type: 'expense',
    amountCents: 220000,
    category: 'housing',
    description: 'Aluguel',
    date: isoDaysAgo(4),
  });
  await transactionRepository.add({
    type: 'expense',
    amountCents: 38950,
    category: 'food',
    description: 'Mercado da semana',
    date: isoDaysAgo(2),
  });
  await transactionRepository.add({
    type: 'expense',
    amountCents: 12000,
    category: 'transport',
    description: 'Combustível',
    date: isoDaysAgo(1),
  });

  const goals = await goalRepository.list();
  if (goals.length === 0 || force) {
    const emergencia = await goalRepository.add({
      name: 'Reserva de emergência',
      targetCents: 1000000,
      color: 'emerald',
    });
    await goalRepository.addContribution(emergencia.id, 350000);
    await goalRepository.add({
      name: 'Viagem de férias',
      targetCents: 500000,
      deadline: '2026-12-20',
      color: 'amber',
    });
  }
}
