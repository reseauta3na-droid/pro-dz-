import React from 'react';
import { motion } from 'motion/react';
import { FileText, LogIn, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';

interface AuthProps {
  onLogin: () => void;
  isLoading?: boolean;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, isLoading }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-zinc-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-12 text-center"
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-emerald-200">
              <img src="/icon.svg" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 rounded-full bg-white p-1.5 shadow-lg">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-zinc-900">Tech DZ Pro</h1>
            <p className="text-lg font-bold text-zinc-500">L'outil pro pour les techniciens freelances.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/50">
            <h2 className="mb-6 text-xl font-black text-zinc-900">Bienvenue</h2>
            <p className="mb-8 text-sm text-zinc-500">
              Connectez-vous avec votre compte Google pour synchroniser vos factures et clients en toute sécurité.
            </p>
            <Button onClick={onLogin} isLoading={isLoading} className="w-full py-4 text-lg" size="lg">
              <LogIn className="mr-3 h-6 w-6" />
              Se connecter avec Google
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-widest text-zinc-400">
            <span>Fait pour l'Algérie</span>
            <div className="h-1 w-1 rounded-full bg-zinc-300" />
            <span>100% Sécurisé</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-xl font-black text-emerald-600">0%</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">TVA</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-black text-emerald-600">0.5%</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Impôt</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-black text-emerald-600">PDF</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Professionnel</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
