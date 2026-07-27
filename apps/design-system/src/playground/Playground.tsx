import { Button } from '../components/Button/Button';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

// Showcase local ("mini storybook"): toda variação visível numa página.
// Cresce a cada componente novo (T-2.4).
export default function Playground() {
  return (
    <main className="min-h-screen bg-surface-muted p-8 font-sans text-text">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">FinDash Design System</h1>
        <p className="text-text-muted">Playground local — porta 3001</p>
      </header>

      <section className="rounded-card border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Button</h2>

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

        <div className="mt-6 border-t border-border pt-4">
          <code className="mb-2 block text-sm text-text-muted">
            className merge: {'<Button className="w-full" />'}
          </code>
          <Button className="w-full">Largura total via className do consumidor</Button>
        </div>
      </section>
    </main>
  );
}
