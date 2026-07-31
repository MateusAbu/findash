import { useEffect } from 'react';
import EmptyState from 'ds/EmptyState';
import { useFindashStore } from '@findash/store';
import { emitFindashEvent } from '@findash/domain';
import GoalCard from '../components/GoalCard';
import GoalForm, { type GoalFormValues } from '../components/GoalForm';
// O chunk federado desta página carrega o próprio CSS (ADR-005).
import '../styles.css';

// Módulo exposto ('./GoalsPage'). T-5.1: metas na store compartilhada.
export default function GoalsPage() {
  const goals = useFindashStore((s) => s.goals);
  const loadGoals = useFindashStore((s) => s.loadGoals);
  const addGoal = useFindashStore((s) => s.addGoal);
  const contributeToGoal = useFindashStore((s) => s.contributeToGoal);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  async function handleCreate(values: GoalFormValues) {
    await addGoal(values);
  }

  async function handleContribute(goalId: string, amountCents: number) {
    await contributeToGoal(goalId, amountCents);
    // RF-G4: notificação efêmera — o shell mostrará toast na T-5.2.
    emitFindashEvent('findash:goal-contribution', { goalId, amountCents });
  }

  return (
    <div className="grid items-start gap-6 font-sans text-text lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      {goals.length === 0 ? (
        <EmptyState
          title="Nenhuma meta ainda"
          description="Crie sua primeira meta de economia no formulário ao lado."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onContribute={handleContribute} />
          ))}
        </div>
      )}

      <GoalForm onSubmit={handleCreate} />
    </div>
  );
}
