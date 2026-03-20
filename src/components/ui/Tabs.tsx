import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex space-x-1 rounded-2xl bg-zinc-100 p-1.5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex flex-1 items-center justify-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
            activeTab === tab.id ? 'text-emerald-700' : 'text-zinc-500 hover:text-zinc-700'
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 rounded-xl bg-white shadow-sm"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center space-x-2">
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
};
