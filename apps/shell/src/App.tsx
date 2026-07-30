import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import RemotePage from './remotes/RemotePage';

// O shell inteiro em uma tela: rotas + layout + resiliência. Nenhuma regra
// de negócio — as páginas vêm dos remotes (ADR-006: shell burro).
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <RemotePage label="a visão geral" loader={() => import('mfe_overview/OverviewPage')} />
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
            element={<RemotePage label="as metas" loader={() => import('mfe_goals/GoalsPage')} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
