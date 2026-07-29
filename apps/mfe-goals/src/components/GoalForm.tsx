import { useState, type FormEvent } from 'react';
import Button from 'ds/Button';
import Card from 'ds/Card';
import FieldError from 'ds/FieldError';
import Input from 'ds/Input';
import Label from 'ds/Label';
import Select from 'ds/Select';
import { parseBRLToCents, type Goal } from '@findash/domain';
import { GOAL_COLORS, GOAL_COLOR_LABELS } from '../lib/goalColors';

export type GoalFormValues = Omit<Goal, 'id' | 'createdAt' | 'savedCents'>;

type Errors = Partial<Record<'name' | 'target' | 'deadline', string>>;

type Props = {
  onSubmit: (values: GoalFormValues) => Promise<void>;
};

// RF-G2: nome, valor alvo, prazo opcional e cor — validação manual no submit.
export default function GoalForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('emerald');
  const [errors, setErrors] = useState<Errors>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const targetCents = parseBRLToCents(target);
    const next: Errors = {};
    if (!name.trim()) next.name = 'Nome é obrigatório.';
    if (targetCents === null || targetCents <= 0) {
      next.target = 'Informe um valor alvo maior que zero (ex.: 10.000,00).';
    }
    if (deadline && Number.isNaN(new Date(deadline).getTime())) {
      next.deadline = 'Informe uma data válida (ou deixe em branco).';
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || targetCents === null) return;

    await onSubmit({
      name: name.trim(),
      targetCents,
      color,
      ...(deadline ? { deadline } : {}),
    });
    setName('');
    setTarget('');
    setDeadline('');
    setColor('emerald');
    setErrors({});
  }

  return (
    <Card header="Nova meta">
      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <div>
          <Label htmlFor="goal-name">Nome</Label>
          <Input
            id="goal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Reserva de emergência"
            invalid={Boolean(errors.name)}
            aria-describedby="goal-name-error"
          />
          <FieldError id="goal-name-error">{errors.name}</FieldError>
        </div>

        <div>
          <Label htmlFor="goal-target">Valor alvo (R$)</Label>
          <Input
            id="goal-target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="10.000,00"
            inputMode="decimal"
            invalid={Boolean(errors.target)}
            aria-describedby="goal-target-error"
          />
          <FieldError id="goal-target-error">{errors.target}</FieldError>
        </div>

        <div>
          <Label htmlFor="goal-deadline">Prazo (opcional)</Label>
          <Input
            id="goal-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            invalid={Boolean(errors.deadline)}
            aria-describedby="goal-deadline-error"
          />
          <FieldError id="goal-deadline-error">{errors.deadline}</FieldError>
        </div>

        <div>
          <Label htmlFor="goal-color">Cor</Label>
          <div className="flex items-center gap-2">
            <Select id="goal-color" value={color} onChange={(e) => setColor(e.target.value)}>
              {Object.keys(GOAL_COLORS).map((key) => (
                <option key={key} value={key}>
                  {GOAL_COLOR_LABELS[key]}
                </option>
              ))}
            </Select>
            <span
              aria-hidden
              className="h-6 w-6 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: GOAL_COLORS[color] }}
            />
          </div>
        </div>

        <Button type="submit">Criar meta</Button>
      </form>
    </Card>
  );
}
