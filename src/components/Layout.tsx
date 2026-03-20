import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, FileText, Users, User, Settings, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  appIconUrl?: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, appIconUrl, onTabChange, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Factures', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 sm:flex-row">
      {/* Sidebar for desktop */}
      <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white p-6 sm:flex">
        <div className="mb-10 flex items-center space-x-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            {appIconUrl ? (
              <img src={appIconUrl} alt="Logo" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <FileText className="h-6 w-6" />
            )}
          </div>
          <span className="text-xl font-black tracking-tight text-zinc-900">Tech DZ Pro</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'group flex w-full items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200',
                activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors duration-200',
                  activeTab === item.id ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'
                )}
              />
              <span>{item.label}</span>
              {activeTab === item.id && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-600"
                />
              )}
            </button>
          ))}
        </nav>

        {onLogout && (
          <button
            onClick={onLogout}
            className="mt-auto flex w-full items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-500 transition-all duration-200 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        )}
      </aside>

      {/* Main content */}
      <main className="relative flex-1 overflow-y-auto pb-24 sm:pb-0">
        <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-emerald-600 text-white">
                {appIconUrl ? (
                  <img src={appIconUrl} alt="Logo" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
              <span className="text-lg font-black tracking-tight">Tech DZ Pro</span>
            </div>
            {onLogout && (
              <button onClick={onLogout} className="text-red-500">
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-5xl p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom navigation for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-zinc-200 bg-white px-2 py-3 backdrop-blur-md sm:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex flex-col items-center space-y-1 px-3 py-1 transition-all duration-200',
              activeTab === item.id ? 'text-emerald-600' : 'text-zinc-400'
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
