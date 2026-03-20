import React from 'react';
import { motion } from 'motion/react';
import { Lock, Key, ShieldCheck } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface PinSetupProps {
  onSave: (pin: string) => void;
}

export const PinSetup: React.FC<PinSetupProps> = ({ onSave }) => {
  const [pin, setPin] = React.useState('');
  const [confirmPin, setConfirmPin] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Le code PIN doit contenir 4 chiffres.');
      return;
    }
    if (pin !== confirmPin) {
      setError('Les codes PIN ne correspondent pas.');
      return;
    }
    onSave(pin);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-zinc-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-2xl shadow-emerald-200">
            <Lock className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Sécurisez votre compte</h1>
          <p className="text-zinc-500">Choisissez un code PIN à 4 chiffres pour protéger vos données.</p>
        </div>

        <Card className="p-8 shadow-xl shadow-zinc-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nouveau Code PIN"
              type="password"
              maxLength={4}
              placeholder="ex: 1234"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              icon={<Key className="h-4 w-4" />}
              className="text-center text-2xl tracking-[1em]"
              required
            />
            <Input
              label="Confirmer le Code PIN"
              type="password"
              maxLength={4}
              placeholder="ex: 1234"
              value={confirmPin}
              onChange={(e) => {
                setConfirmPin(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              icon={<ShieldCheck className="h-4 w-4" />}
              className="text-center text-2xl tracking-[1em]"
              required
            />

            {error && <p className="text-center text-sm font-bold text-red-500">{error}</p>}

            <Button type="submit" className="w-full py-4 text-lg" size="lg">
              <ShieldCheck className="mr-2 h-6 w-6" />
              Activer la protection
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
