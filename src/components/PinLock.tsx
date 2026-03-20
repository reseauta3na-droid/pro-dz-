import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Delete, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface PinLockProps {
  correctPin: string;
  onSuccess: () => void;
}

export const PinLock: React.FC<PinLockProps> = ({ correctPin, onSuccess }) => {
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState(false);

  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center space-y-12"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-2xl shadow-emerald-900/50">
            <Lock className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Tech DZ Pro</h1>
          <p className="text-zinc-500">Entrez votre code PIN pour déverrouiller.</p>
        </div>

        <div className="flex space-x-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              className={cn(
                'h-4 w-4 rounded-full border-2 transition-all duration-200',
                pin.length > i ? 'bg-emerald-500 border-emerald-500 scale-125' : 'border-zinc-700'
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold transition-all duration-200 hover:bg-zinc-700 active:scale-90 active:bg-emerald-600"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleNumberClick(0)}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold transition-all duration-200 hover:bg-zinc-700 active:scale-90 active:bg-emerald-600"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="flex h-20 w-20 items-center justify-center rounded-full text-zinc-500 transition-all duration-200 hover:text-white active:scale-90"
          >
            <Delete className="h-8 w-8" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
