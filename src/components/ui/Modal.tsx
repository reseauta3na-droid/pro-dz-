import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-sm rounded-3xl',
    md: 'max-w-md rounded-3xl',
    lg: 'max-w-lg rounded-3xl',
    full: 'max-w-full h-full sm:h-[95vh] sm:max-w-[95vw] rounded-none sm:rounded-3xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              'relative w-full overflow-hidden bg-white shadow-2xl flex flex-col',
              sizes[size]
            )}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 flex-shrink-0">
              {title && <h3 className="text-lg font-bold text-zinc-900">{title}</h3>}
              <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className={cn(
              "flex-1 overflow-y-auto",
              size === 'full' ? 'p-0 sm:p-6' : 'p-6'
            )}>
              {children}
            </div>
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4 bg-zinc-50/50 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
