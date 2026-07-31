import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastHost from './ToastHost';

// Rota de layout (sem path): a página ativa renderiza no <Outlet/>.
export default function Layout() {
  return (
    <div className="flex min-h-screen bg-surface-muted font-sans text-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <ToastHost />
    </div>
  );
}
