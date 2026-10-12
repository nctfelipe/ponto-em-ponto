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
    <aside className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white px-3 py-2 md:static md:w-64 md:border-t-0 md:border-r md:px-6 md:py-4">
      <nav aria-label="Navegação principal">
        <ul className="flex gap-1 md:block md:space-y-1">
          {items.map((item) => (
            <li className="flex-1" key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-center text-sm font-semibold md:text-left ${
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
