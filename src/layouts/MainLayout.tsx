import { NavLink, Outlet } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/cash-flow', label: 'Cash Flow' },
  { to: '/transactions', label: 'Transactions' }
];

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <nav className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl gap-6">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 p-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-400">
        Financial Dashboard — portfolio project
      </footer>
    </div>
  );
};