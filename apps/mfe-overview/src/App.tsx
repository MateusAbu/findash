import OverviewPage from './pages/OverviewPage';

// Casulo standalone: só existe para rodar o remote sozinho em :3002.
// O shell NUNCA importa este App — ele consumirá apenas a OverviewPage (T-1.3).
export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>
        mfe-overview rodando standalone em :3002
      </p>
      <OverviewPage />
    </div>
  );
}
