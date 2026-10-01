import { NavLink } from 'react-router';

export interface NavigationItem {
  label: string;
  to: string;
}

interface NavigationSidebarProps {
  items: NavigationItem[];
}

export function NavigationSidebar({ items }: NavigationSidebarProps) {
  return (
    <aside className="border-b border-slate-200 bg-white px-6 py-4 md:w-64 md:border-r md:border-b-0">
      <nav aria-label="Navegação principal">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
                end={item.to === '/'}
                to={item.to}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
