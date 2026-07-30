import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Badge from 'ds/Badge';
import RemotePage from './remotes/RemotePage';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transações' },
  { to: '/goals', label: 'Metas' },
] as const;

// Sidebar provisória com NavLink (o layout final com o DS é a T-4.2).
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <aside style={{ width: 220, padding: 16, background: '#1e293b', color: '#e2e8f0' }}>
          <strong>
            FinDash <Badge variant="warning">beta</Badge>
          </strong>
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2.2 }}>
              {NAV.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    style={({ isActive }) => ({
                      color: isActive ? '#34d399' : '#e2e8f0',
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: 'none',
                    })}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main style={{ flex: 1, padding: 24, background: '#f8fafc' }}>
          {/* RF-S2: o shell é o dono do mapa de rotas (ADR-006). As páginas
              vêm dos remotes, burras em relação à URL. */}
          <Routes>
            <Route
              path="/"
              element={
                <RemotePage
                  label="a visão geral"
                  loader={() => import('mfe_overview/OverviewPage')}
                />
              }
            />
            <Route
              path="/transactions"
              element={
                <RemotePage
                  label="as transações"
                  loader={() => import('mfe_transactions/TransactionsPage')}
                />
              }
            />
            <Route
              path="/goals"
              element={
                <RemotePage label="as metas" loader={() => import('mfe_goals/GoalsPage')} />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
