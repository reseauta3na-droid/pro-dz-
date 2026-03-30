import React from 'react';
import { motion } from 'motion/react';
import { FileText, Wallet, Calculator, Calendar, Bell, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface OnboardingProps {
  onNext: () => void;
  onLogin: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onNext, onLogin }) => {
  const features = [
    {
      icon: <FileText className="h-6 w-6 text-emerald-600" />,
      title: "Facturation Professionnelle",
      description: "Générez des factures et devis conformes aux normes algériennes en quelques secondes."
    },
    {
      icon: <Calculator className="h-6 w-6 text-blue-600" />,
      title: "Calcul de l'IFU (0.5%)",
      description: "Suivi automatique de votre impôt forfaitaire unique basé sur votre chiffre d'affaires."
    },
    {
      icon: <Calendar className="h-6 w-6 text-amber-600" />,
      title: "Rappels Fiscaux",
      description: "Ne ratez plus jamais une échéance (IFU, CASNOS) grâce aux alertes intégrées."
    },
    {
      icon: <Wallet className="h-6 w-6 text-purple-600" />,
      title: "Gestion de Portefeuille",
      description: "Suivez vos revenus encaissés, vos dépenses et votre bénéfice net en temps réel."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
      title: "Sauvegarde Cloud",
      description: "Vos données sont synchronisées et sécurisées sur votre compte Google."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-zinc-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl space-y-12"
      >
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-emerald-200"
          >
            <img src="/icon.svg" alt="Logo" className="h-full w-full object-cover" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Bienvenue sur Tech DZ Pro</h1>
          <p className="mx-auto max-w-lg text-lg text-zinc-500">
            L'outil tout-en-un conçu spécifiquement pour les techniciens et freelances en Algérie.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:border-emerald-200 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="rounded-2xl bg-zinc-100 p-3">
                    {feature.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-900">{feature.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center space-y-4 pt-8"
        >
          <Button onClick={onNext} size="lg" className="w-full sm:w-auto px-12 py-6 text-lg rounded-full">
            Commencer la configuration
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
          <button 
            onClick={onLogin}
            className="text-sm font-bold text-zinc-400 hover:text-emerald-600 transition-colors uppercase tracking-widest"
          >
            Déjà un compte ? Se connecter
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
