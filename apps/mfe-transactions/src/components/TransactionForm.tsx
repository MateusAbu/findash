import { useState, type FormEvent } from 'react';
import Button from 'ds/Button';
import Card from 'ds/Card';
import Input from 'ds/Input';
import Label from 'ds/Label';
import FieldError from 'ds/FieldError';
import Select from 'ds/Select';
import {
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TYPE_LABELS,
  parseBRLToCents,
  type Category,
  type Transaction,
  type TransactionType,
} from '@findash/domain';

export type TransactionFormValues = Omit<Transaction, 'id' | 'createdAt'>;

type Errors = Partial<Record<'description' | 'amount' | 'date', string>>;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  editing: Transaction | null;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  onCancelEdit: () => void;
};

// O pai passa key={editing?.id ?? 'new'}: mudar de alvo REMONTA o form e os
// useState abaixo inicializam com os valores certos — sem useEffect+setState
// (anti-padrão de renders em cascata que o react-hooks v7 acusa).
export default function TransactionForm({ editing, onSubmit, onCancelEdit }: Props) {
  const [type, setType] = useState<TransactionType>(editing?.type ?? 'expense');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [amount, setAmount] = useState(
    editing ? (editing.amountCents / 100).toFixed(2).replace('.', ',') : '',
  );
  const [category, setCategory] = useState<Category>(editing?.category ?? 'food');
  const [date, setDate] = useState(editing?.date ?? todayISO());
  const [errors, setErrors] = useState<Errors>({});

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function changeType(next: TransactionType) {
    setType(next);
    const list = next === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!(list as readonly Category[]).includes(category)) setCategory(list[0]);
  }

  function reset() {
    setType('expense');
    setDescription('');
    setAmount('');
    setCategory('food');
    setDate(todayISO());
    setErrors({});
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // Validação manual (RF-T2): todos os erros de uma vez, submit bloqueado.
    const cents = parseBRLToCents(amount);
    const next: Errors = {};
    if (!description.trim()) next.description = 'Descrição é obrigatória.';
    if (cents === null || cents <= 0) next.amount = 'Informe um valor maior que zero (ex.: 49,90).';
    if (!date || Number.isNaN(new Date(date).getTime())) next.date = 'Informe uma data válida.';
    setErrors(next);
    if (Object.keys(next).length > 0 || cents === null) return;

    await onSubmit({ type, description: description.trim(), amountCents: cents, category, date });
    reset();
  }

  return (
    <Card header={editing ? 'Editar transação' : 'Nova transação'}>
      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <div>
          <Label htmlFor="tx-type">Tipo</Label>
          <Select
            id="tx-type"
            value={type}
            onChange={(e) => changeType(e.target.value as TransactionType)}
          >
            {(['expense', 'income'] as const).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="tx-description">Descrição</Label>
          <Input
            id="tx-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: Mercado da semana"
            invalid={Boolean(errors.description)}
            aria-describedby="tx-description-error"
          />
          <FieldError id="tx-description-error">{errors.description}</FieldError>
        </div>

        <div>
          <Label htmlFor="tx-amount">Valor (R$)</Label>
          <Input
            id="tx-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            invalid={Boolean(errors.amount)}
            aria-describedby="tx-amount-error"
          />
          <FieldError id="tx-amount-error">{errors.amount}</FieldError>
        </div>

        <div>
          <Label htmlFor="tx-category">Categoria</Label>
          <Select
            id="tx-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="tx-date">Data</Label>
          <Input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            invalid={Boolean(errors.date)}
            aria-describedby="tx-date-error"
          />
          <FieldError id="tx-date-error">{errors.date}</FieldError>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            {editing ? 'Salvar alterações' : 'Adicionar'}
          </Button>
          {editing && (
            <Button type="button" variant="ghost" onClick={onCancelEdit}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
