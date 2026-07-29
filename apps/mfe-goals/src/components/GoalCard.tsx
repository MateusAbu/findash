import { useState, type FormEvent } from 'react';
import Badge from 'ds/Badge';
import Button from 'ds/Button';
import Card from 'ds/Card';
import FieldError from 'ds/FieldError';
import Input from 'ds/Input';
import ProgressBar from 'ds/ProgressBar';
import { formatCents, parseBRLToCents, type Goal } from '@findash/domain';
import { GOAL_COLORS } from '../lib/goalColors';

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

type Props = {
  goal: Goal;
  onContribute: (goalId: string, amountCents: number) => Promise<void>;
};

// RF-G1 + RF-G3: card com progresso, badge de concluída e aporte inline.
export default function GoalCard({ goal, onContribute }: Props) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const percent = goal.targetCents > 0 ? (goal.savedCents / goal.targetCents) * 100 : 0;
  const isDone = percent >= 100;
  const color = GOAL_COLORS[goal.color] ?? 'var(--color-primary)';

  async function handleContribute(event: FormEvent) {
    event.preventDefault();
    const cents = parseBRLToCents(amount);
    if (cents === null || cents <= 0) {
      setError('Valor inválido (ex.: 250,00).');
      return;
    }
    setError('');
    setAmount('');
    await onContribute(goal.id, cents);
  }

  return (
    <Card
      header={
        <span className="flex items-center justify-between gap-2">
          <span className="truncate">{goal.name}</span>
          {isDone && <Badge variant="success">Concluída 🎉</Badge>}
        </span>
      }
    >
      <div className="grid gap-3">
        <ProgressBar value={percent} color={color} aria-label={`Progresso de ${goal.name}`} />

        <p className="text-sm text-text-muted">
          <span className="font-medium text-text">{formatCents(goal.savedCents)}</span> de{' '}
          {formatCents(goal.targetCents)} · {Math.round(percent)}%
          {goal.deadline && <> · até {formatDate(goal.deadline)}</>}
        </p>

        {!isDone && (
          <form onSubmit={handleContribute} noValidate className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                aria-label={`Valor do aporte em ${goal.name}`}
                placeholder="0,00"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                invalid={Boolean(error)}
              />
              <FieldError>{error}</FieldError>
            </div>
            <Button type="submit" variant="secondary">
              Aportar
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}
