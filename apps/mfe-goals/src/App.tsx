import GoalsPage from './pages/GoalsPage';

// Casulo standalone (:3004). localStorage é por origem — dados daqui não são
// os do shell (:3000).
export default function App() {
  return (
    <div className="min-h-screen bg-surface-muted p-6 font-sans">
      <p className="mb-4 text-sm text-text-muted">mfe-goals rodando standalone em :3004</p>
      <GoalsPage />
    </div>
  );
}
