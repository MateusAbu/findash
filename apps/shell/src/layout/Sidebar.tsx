import { NavLink } from 'react-router-dom';
import Badge from 'ds/Badge';
import { ROUTES } from '../routes';

// RF-S1: sidebar fixa com navegação ativa. Composição pura — zero negócio.
export default function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-6 bg-surface-inverted p-4 text-text-inverted">
      <div className="flex items-center gap-2 px-2">
        <span className="text-lg font-bold">FinDash</span>
        <Badge variant="warning">beta</Badge>
      </div>

      <nav aria-label="Navegação principal">
        <ul className="grid gap-1">
          {ROUTES.map(({ path, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `block rounded-control px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? 'bg-primary font-medium text-white'
                      : 'text-text-inverted hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
