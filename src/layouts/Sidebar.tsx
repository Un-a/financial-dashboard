import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Receipt } from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';
import { Logo } from '../components/common/Logo';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/cash-flow', label: 'Cash Flow', icon: ArrowLeftRight, end: false },
  { to: '/transactions', label: 'Transactions', icon: Receipt, end: false },
];

export const Sidebar = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <aside className="fixed inset-y-0 left-0 flex w-[220px] flex-col border-r border-border bg-surface">
        <div className="flex items-center gap-2.5 px-5 py-6">
            <Logo />
        <span className="font-display text-lg text-ink">Finboard</span>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-ledger text-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-border px-5 py-4">
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={theme === 'light' ? 'text-ink underline underline-offset-4' : 'text-ink-faint'}
          >
            Light
          </button>
          <span className="text-ink-faint">/</span>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={theme === 'dark' ? 'text-ink underline underline-offset-4' : 'text-ink-faint'}
          >
            Dark
          </button>
        </div>
      </div>
    </aside>
  );
};