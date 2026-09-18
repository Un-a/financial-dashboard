import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />

      <div className="flex flex-1 flex-col pl-[220px]">
        <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 p-8">
          <Outlet />
        </main>

        <footer className="border-t border-border px-6 py-4 text-center text-xs text-ink-faint">
          Financial Dashboard — portfolio project
        </footer>
      </div>
    </div>
  );
};