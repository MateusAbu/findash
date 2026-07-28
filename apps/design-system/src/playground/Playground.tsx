import { useState } from 'react';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';
import { Input } from '../components/Input/Input';
import { Label } from '../components/Input/Label';
import { FieldError } from '../components/Input/FieldError';
import { Select } from '../components/Select/Select';
import { Badge } from '../components/Badge/Badge';
import { ProgressBar } from '../components/ProgressBar/ProgressBar';
import { Skeleton } from '../components/Skeleton/Skeleton';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Toast } from '../components/Toast/Toast';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card header={title} className="mb-6">
      {children}
    </Card>
  );
}

// Showcase local ("mini storybook"): toda variação visível numa página.
export default function Playground() {
  const [toastVisible, setToastVisible] = useState(true);

  return (
    <main className="min-h-screen bg-surface-muted p-8 font-sans text-text">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">FinDash Design System</h1>
        <p className="text-text-muted">Playground local — porta 3001</p>
      </header>

      <Section title="Button">
        {VARIANTS.map((variant) => (
          <div key={variant} className="mb-4 flex items-center gap-3">
            <code className="w-24 text-sm text-text-muted">{variant}</code>
            {SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {size === 'md' ? 'Salvar' : `Salvar (${size})`}
              </Button>
            ))}
            <Button variant={variant} disabled>
              disabled
            </Button>
          </div>
        ))}
      </Section>

      <Section title="Card">
        <div className="grid grid-cols-2 gap-4">
          <Card header="Com header e footer" footer="footer opcional">
            Conteúdo do card.
          </Card>
          <Card>Só conteúdo — header e footer omitidos.</Card>
        </div>
      </Section>

      <Section title="Formulário: Label + Input + FieldError + Select">
        <div className="grid max-w-md gap-4">
          <div>
            <Label htmlFor="pg-desc">Descrição</Label>
            <Input id="pg-desc" placeholder="Ex.: Mercado da semana" />
          </div>
          <div>
            <Label htmlFor="pg-valor">Valor (com erro)</Label>
            <Input
              id="pg-valor"
              placeholder="0,00"
              invalid
              aria-describedby="pg-valor-erro"
              defaultValue="-10"
            />
            <FieldError id="pg-valor-erro">O valor deve ser maior que zero.</FieldError>
          </div>
          <div>
            <Label htmlFor="pg-cat">Categoria</Label>
            <Select id="pg-cat" defaultValue="">
              <option value="" disabled>
                Selecione…
              </option>
              <option value="food">Alimentação</option>
              <option value="transport">Transporte</option>
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex gap-3">
          <Badge>neutral</Badge>
          <Badge variant="success">Concluída 🎉</Badge>
          <Badge variant="warning">Perto do prazo</Badge>
          <Badge variant="error">Atrasada</Badge>
        </div>
      </Section>

      <Section title="ProgressBar">
        <div className="grid max-w-md gap-4">
          <ProgressBar value={25} />
          <ProgressBar value={70} color="var(--color-warning)" />
          <ProgressBar value={100} color="var(--color-success)" />
        </div>
      </Section>

      <Section title="Skeleton">
        <div className="grid max-w-md gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Section>

      <Section title="EmptyState">
        <EmptyState
          title="Nenhuma transação ainda"
          description="Registre sua primeira receita ou despesa para ver o resumo do mês."
          action={<Button size="sm">+ Nova transação</Button>}
        />
      </Section>

      <Section title="Toast">
        <div className="grid gap-3">
          <Toast variant="info">Sincronizando dados…</Toast>
          <Toast variant="success">Transação criada com sucesso!</Toast>
          {toastVisible ? (
            <Toast variant="error" onClose={() => setToastVisible(false)}>
              Não foi possível salvar. Tente de novo. (feche-me!)
            </Toast>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setToastVisible(true)}>
              Reexibir toast fechável
            </Button>
          )}
        </div>
      </Section>
    </main>
  );
}
