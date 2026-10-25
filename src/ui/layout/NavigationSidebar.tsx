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
    <aside className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface px-3 py-2 md:static md:w-64 md:border-t-0 md:border-r md:px-6 md:py-4">
      <nav aria-label="Navegação principal">
        <ul className="flex gap-1 md:block md:space-y-1">
          {items.map((item) => (
            <li className="flex-1" key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-center text-sm font-semibold md:text-left ${
                    isActive
                      ? 'bg-primary-subtle text-primary'
                      : 'text-content-secondary hover:bg-background'
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
