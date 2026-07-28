import { lazy, Suspense } from 'react';
// Import ESTÁTICO de módulo federado: funciona porque o boundary assíncrono
// (main → bootstrap) garante que a federation inicializou antes deste módulo
// executar. O CSS do Button chega junto, injetado pelo runtime do MF.
import Button from 'ds/Button';

// Este import atravessa a rede: resolve via Module Federation para :3002.
// lazy + Suspense porque o módulo só existe depois do fetch do chunk remoto.
const OverviewPage = lazy(() => import('mfe_overview/OverviewPage'));

// Layout mínimo hardcoded (T-1.1). A sidebar real com o design system chega
// na T-4.2; as rotas na T-4.1. Estilos inline até o Tailwind entrar (Fase 2).
export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside style={{ width: 220, padding: 16, background: '#1e293b', color: '#e2e8f0' }}>
        <strong>FinDash</strong>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2 }}>
            <li>Dashboard</li>
            <li>Transações</li>
            <li>Metas</li>
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1>FinDash — shell</h1>
          <Button onClick={() => alert('Em breve: nova transação (T-3.2)')}>
            + Nova transação
          </Button>
        </div>
        <Suspense fallback={<p>Carregando overview de :3002…</p>}>
          <OverviewPage />
        </Suspense>
      </main>
    </div>
  );
}
