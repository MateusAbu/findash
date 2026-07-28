import TransactionsPage from './pages/TransactionsPage';

// Casulo standalone (:3003). Atenção ao validar: localStorage é POR ORIGEM —
// os dados criados aqui não são os mesmos que o shell (:3000) enxerga.
export default function App() {
  return (
    <div className="min-h-screen bg-surface-muted p-6 font-sans">
      <p className="mb-4 text-sm text-text-muted">mfe-transactions rodando standalone em :3003</p>
      <TransactionsPage />
    </div>
  );
}
