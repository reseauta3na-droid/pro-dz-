import React from 'react';
import { motion } from 'motion/react';
import { Calendar, AlertCircle, ChevronRight, Info } from 'lucide-react';
import { Card } from './ui/Card';
import { FISCAL_DEADLINES } from '../constants/deadlines';
import { format, isAfter, isBefore, addDays, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DeadlinesAlertProps {
  onPay?: (deadline: any) => void;
}

export const DeadlinesAlert: React.FC<DeadlinesAlertProps> = ({ onPay }) => {
  const today = new Date();
  const currentYear = today.getFullYear();

  const upcomingDeadlines = FISCAL_DEADLINES.map(deadline => {
    const [month, day] = deadline.date.split('-').map(Number);
    let deadlineDate = new Date(currentYear, month - 1, day);
    
    // If deadline has passed this year, look at next year
    if (isBefore(deadlineDate, today) && !isSameDay(deadlineDate, today)) {
      deadlineDate = new Date(currentYear + 1, month - 1, day);
    }

    const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      ...deadline,
      deadlineDate,
      daysUntil
    };
  }).sort((a, b) => a.daysUntil - b.daysUntil);

  const criticalDeadlines = upcomingDeadlines.filter(d => d.daysUntil <= 30);

  if (criticalDeadlines.length === 0) {
    // Show next deadline even if not critical
    const nextDeadline = upcomingDeadlines[0];
    return (
      <Card className="bg-zinc-50 border-zinc-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-400 shadow-sm">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Prochaine échéance</p>
              <h4 className="text-sm font-bold text-zinc-900">{nextDeadline.title}</h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-zinc-500">
              {format(nextDeadline.deadlineDate, 'dd MMMM', { locale: fr })}
            </p>
            <p className="text-[10px] text-zinc-400">Dans {nextDeadline.daysUntil} jours</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {criticalDeadlines.map((deadline, index) => (
        <motion.div
          key={deadline.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={cn(
            "border-l-4",
            deadline.daysUntil <= 7 ? "border-l-red-500 bg-red-50/30" : "border-l-amber-500 bg-amber-50/30"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm",
                  deadline.daysUntil <= 7 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                )}>
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      deadline.daysUntil <= 7 ? "text-red-500" : "text-amber-500"
                    )}>
                      {deadline.daysUntil <= 7 ? 'Urgent' : 'Échéance proche'}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">• {deadline.type}</span>
                  </div>
                  <h4 className="font-bold text-zinc-900">{deadline.title}</h4>
                  <p className="text-xs text-zinc-500">{deadline.description}</p>
                  {onPay && (
                    <button
                      onClick={() => onPay(deadline)}
                      className={cn(
                        "mt-2 flex items-center text-[10px] font-black uppercase tracking-widest transition-colors",
                        deadline.daysUntil <= 7 ? "text-red-600 hover:text-red-700" : "text-amber-600 hover:text-amber-700"
                      )}
                    >
                      Enregistrer le paiement
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-zinc-900">
                  {format(deadline.deadlineDate, 'dd MMM', { locale: fr })}
                </p>
                <p className={cn(
                  "text-[10px] font-bold",
                  deadline.daysUntil <= 7 ? "text-red-600" : "text-amber-600"
                )}>
                  J-{deadline.daysUntil}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
