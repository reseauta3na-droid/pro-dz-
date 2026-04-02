import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, FileText, Users, User, Settings, LogOut, Cloud, CloudOff, RefreshCw, Receipt } from 'lucide-react';
import { cn } from '../utils/cn';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  appIconUrl?: string;
  isOnline?: boolean;
  isSyncing?: boolean;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  appIconUrl, 
  isOnline = true,
  isSyncing = false,
  onTabChange, 
  onLogout 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Factures', icon: FileText },
    { id: 'expenses', label: 'Dépenses', icon: Receipt },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 sm:flex-row">
      <Toaster position="top-center" richColors />
      {/* Sidebar for desktop */}
      <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white p-6 sm:flex">
        <div className="mb-10 flex items-center space-x-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white text-emerald-600 shadow-lg shadow-emerald-200">
            <img 
              src={appIconUrl || "/icon.svg"} 
              alt="Logo" 
              className="h-full w-full object-cover" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <span className="text-xl font-black tracking-tight text-zinc-900">DZ Tech</span>
        </div>

        <div className="mb-6 px-4">
          <div className={cn(
            "flex items-center space-x-2 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest",
            isOnline ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          )}>
            {isOnline ? (
              <>
                {isSyncing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Cloud className="h-3 w-3" />
                )}
                <span>{isSyncing ? 'Synchronisation...' : 'En ligne'}</span>
              </>
            ) : (
              <>
                <CloudOff className="h-3 w-3" />
                <span>Mode Hors-ligne</span>
              </>
            )}
          </div>
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
      <main className="relative flex-1 overflow-y-auto pb-32 sm:pb-0">
        <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-white text-emerald-600">
                <img 
                  src={appIconUrl || "/icon.svg"} 
                  alt="Logo" 
                  className="h-full w-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight">DZ Tech</span>
                <div className="flex items-center space-x-1">
                  {isOnline ? (
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
                  <span className="text-[8px] font-bold uppercase text-zinc-400">
                    {isOnline ? (isSyncing ? 'Sync...' : 'En ligne') : 'Hors-ligne'}
                  </span>
                </div>
              </div>
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

        <footer className="mt-auto border-t border-zinc-100 py-8 text-center px-6">
          <p className="text-[10px] font-medium leading-relaxed text-zinc-400 sm:text-xs">
            Cette application a été créée et développée par <span className="font-bold text-zinc-600">Hocine Mellal</span>, ingénieur du son, pour ses confrères techniciens algériens.
          </p>
        </footer>
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
