import OverviewPage from './pages/OverviewPage';

// Casulo standalone (:3002). Lembrete: localStorage é por origem — os dados
// daqui não são os do shell (:3000) nem os do transactions (:3003).
export default function App() {
  return (
    <div className="min-h-screen bg-surface-muted p-6 font-sans">
      <p className="mb-4 text-sm text-text-muted">mfe-overview rodando standalone em :3002</p>
      <OverviewPage />
    </div>
  );
}
