import { useLocation } from 'react-router-dom';
import { ROUTES } from '../routes';

// RF-S1: header com título dinâmico — derivado da URL via mapa de rotas.
export default function Header() {
  const { pathname } = useLocation();
  const title = ROUTES.find((r) => r.path === pathname)?.title ?? 'FinDash';

  return (
    <header className="border-b border-border bg-surface px-6 py-4">
      <h1 className="text-xl font-semibold text-text">{title}</h1>
    </header>
  );
}
