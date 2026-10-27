import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router';

export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  to: string;
}

interface NavigationSidebarProps {
  items: NavigationItem[];
}

export function NavigationSidebar({ items }: NavigationSidebarProps) {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface md:static md:w-64 md:border-t-0 md:border-r md:pb-4">
      <nav aria-label="Navegação principal">
        <ul className="flex md:block">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <li className="flex-1" key={item.to}>
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center justify-center gap-3 px-3 py-3 text-sm font-semibold transition-colors md:justify-start md:border-l-4 md:px-6 md:py-3 md:pl-5 ${
                      isActive
                        ? 'bg-brand/25 text-content md:border-brand'
                        : 'text-content-secondary hover:bg-brand/10 hover:text-content md:border-transparent'
                    }`
                  }
                  end={item.to === '/'}
                  title={item.label}
                  to={item.to}
                >
                  <Icon aria-hidden="true" size={20} strokeWidth={2} />
                  <span className="sr-only md:not-sr-only">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
