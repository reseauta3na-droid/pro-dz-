import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, FileText, CheckCircle, Clock, Plus, Calendar, User, Briefcase, Filter } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatCurrency } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Invoice, Client, Technician } from '../types';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, eachDayOfInterval, eachMonthOfInterval, eachYearOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../utils/cn';
import { DeadlinesAlert } from './DeadlinesAlert';

interface DashboardProps {
  stats: {
    totalEarned: number;
    totalExpenses: number;
    profit: number;
    invoiceCount: number;
    paidCount: number;
    unpaidCount: number;
    annualTotal: number;
    annualIfu: number;
    annualTva: number;
  };
  invoices: Invoice[];
  clients: Client[];
  technician: Technician;
  onCreateInvoice: () => void;
  onPayDeadline: (deadline: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, invoices, clients, technician, onCreateInvoice, onPayDeadline }) => {
  const [viewType, setViewType] = useState<'day' | 'month' | 'year'>('month');
  const recentInvoices = [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const chartData = useMemo(() => {
    const now = new Date();
    let periods: Date[] = [];
    let dateFormat = '';

    if (viewType === 'day') {
      periods = eachDayOfInterval({
        start: subDays(now, 6),
        end: now,
      });
      dateFormat = 'dd MMM';
    } else if (viewType === 'month') {
      periods = eachMonthOfInterval({
        start: subMonths(now, 5),
        end: now,
      });
      dateFormat = 'MMM';
    } else {
      periods = eachYearOfInterval({
        start: subYears(now, 2),
        end: now,
      });
      dateFormat = 'yyyy';
    }

    return periods.map(date => {
      let start: Date, end: Date;
      if (viewType === 'day') {
        start = startOfDay(date);
        end = endOfDay(date);
      } else if (viewType === 'month') {
        start = startOfMonth(date);
        end = endOfMonth(date);
      } else {
        start = startOfYear(date);
        end = endOfYear(date);
      }

      const periodInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return isWithinInterval(invDate, { start, end });
      });

      const paid = periodInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((acc, inv) => acc + inv.total, 0);
      
      const unpaid = periodInvoices
        .filter(inv => inv.status === 'unpaid' || inv.status === 'partial')
        .reduce((acc, inv) => acc + (inv.total - inv.paidAmount), 0);

      const paidCount = periodInvoices.filter(inv => inv.status === 'paid').length;
      const unpaidCount = periodInvoices.filter(inv => inv.status === 'unpaid' || inv.status === 'partial').length;

      return {
        label: format(date, dateFormat, { locale: fr }),
        paid,
        unpaid,
        paidCount,
        unpaidCount,
        total: paid + unpaid
      };
    });
  }, [invoices, viewType]);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Tableau de Bord</h1>
          <p className="text-zinc-500">Suivez vos revenus et factures en un coup d'œil.</p>
        </div>
        <Button onClick={onCreateInvoice} className="hidden sm:flex">
          <Plus className="mr-2 h-5 w-5" />
          Nouvelle Facture
        </Button>
      </header>

      <DeadlinesAlert onPay={onPayDeadline} />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col justify-between border-emerald-100 bg-emerald-50/50">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Revenu (Payé)</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-emerald-900">{formatCurrency(stats.totalEarned, technician.defaultCurrency)}</h2>
          </div>
        </Card>

        <Card className="flex flex-col justify-between border-red-100 bg-red-50/50">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-red-100 p-2 text-red-600">
              <TrendingUp className="h-5 w-5 rotate-180" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Dépenses</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-red-900">{formatCurrency(stats.totalExpenses, technician.defaultCurrency)}</h2>
          </div>
        </Card>

        <Card className="flex flex-col justify-between border-blue-100 bg-blue-50/50">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Bénéfice Net</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-blue-900">{formatCurrency(stats.profit, technician.defaultCurrency)}</h2>
          </div>
        </Card>

        <Card className="flex flex-col justify-between border-amber-100 bg-amber-50/50">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">En Attente</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-amber-900">
              {formatCurrency(
                invoices.filter(i => i.status !== 'paid').reduce((acc, i) => acc + (i.total - i.paidAmount), 0),
                technician.defaultCurrency
              )}
            </h2>
          </div>
        </Card>
      </div>

      {/* Tax Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 border-amber-100 bg-amber-50/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Fiscalité (IFU 0.5%)</h3>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Année {new Date().getFullYear()}</span>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Chiffre d'Affaires Annuel (Global)</p>
              <h4 className="text-2xl font-black text-zinc-900">{formatCurrency(stats.annualTotal, technician.defaultCurrency)}</h4>
              <p className="text-xs text-zinc-500 mt-2">Total des factures (payées ou non) pour l'année en cours.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">Impôt IFU (0.5%)</p>
              <h4 className="text-2xl font-black text-amber-600">{formatCurrency(stats.annualIfu, technician.defaultCurrency)}</h4>
              <div className="mt-2 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <Clock className="h-3 w-3" />
                <span>À payer avant le 30 Juin {new Date().getFullYear() + 1}</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                {stats.annualTva < 0 ? 'TVA Déductible / Crédit' : 'TVA à reverser'}
              </p>
              <h4 className={`text-2xl font-black ${stats.annualTva < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {stats.annualTva < 0 ? '-' : ''}{formatCurrency(Math.abs(stats.annualTva), technician.defaultCurrency)}
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">
                {stats.annualTva < 0 ? 'Crédit de TVA cumulé' : 'Total TVA collectée sur vos factures'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-center items-center text-center border-emerald-100 bg-emerald-50/30">
          <div className="mb-4 rounded-full bg-emerald-100 p-4 text-emerald-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-bold text-zinc-900">Santé Financière</h4>
          <p className="text-sm text-zinc-500 mt-2">
            Votre taux de recouvrement est de <span className="font-bold text-emerald-600">
              {stats.invoiceCount > 0 ? Math.round((stats.paidCount / stats.invoiceCount) * 100) : 0}%
            </span>.
          </p>
          <div className="mt-6 w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000" 
              style={{ width: `${stats.invoiceCount > 0 ? (stats.paidCount / stats.invoiceCount) * 100 : 0}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Summary Table Section */}
      <Card className="p-6 overflow-hidden">
        <h3 className="mb-6 text-lg font-bold text-zinc-900">Tableau Récapitulatif</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <th className="pb-4 pr-4">Facture</th>
                <th className="pb-4 pr-4">Client</th>
                <th className="pb-4 pr-4">Projet</th>
                <th className="pb-4 pr-4">Date</th>
                <th className="pb-4 text-right">Taux de Paiement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {recentInvoices.map((invoice) => {
                const client = clients.find(c => c.id === invoice.clientId);
                const paymentRate = Math.round((invoice.paidAmount / invoice.total) * 100);
                
                return (
                  <tr key={invoice.id} className="group hover:bg-zinc-50/50">
                    <td className="py-4 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-zinc-900">{invoice.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-zinc-400" />
                        <span className="text-sm text-zinc-600">{client?.name || 'Client Inconnu'}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-3 w-3 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-900">{invoice.projectName}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-zinc-400" />
                        <span className="text-xs text-zinc-500">
                          {format(new Date(invoice.date), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`text-xs font-bold ${paymentRate === 100 ? 'text-emerald-600' : paymentRate > 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {paymentRate}%
                        </span>
                        <div className="h-1 w-24 overflow-hidden rounded-full bg-zinc-100">
                          <div 
                            className={`h-full ${paymentRate === 100 ? 'bg-emerald-500' : paymentRate > 0 ? 'bg-blue-500' : 'bg-amber-500'}`}
                            style={{ width: `${paymentRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Chart Section */}
      <Card className="p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-8">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Évolution des Revenus</h3>
            <p className="text-xs text-zinc-500">Suivi des montants encaissés et en attente.</p>
          </div>
          
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl">
            {(['day', 'month', 'year'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-lg",
                  viewType === type 
                    ? "bg-white text-emerald-600 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {type === 'day' ? 'Jour' : type === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#71717a' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#71717a' }}
                tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip
                cursor={{ fill: '#f4f4f5', radius: 8 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 min-w-[200px]">
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">{label}</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                              <span className="text-xs font-bold text-zinc-600">Payé ({data.paidCount})</span>
                            </div>
                            <span className="text-xs font-black text-emerald-600">{formatCurrency(data.paid, technician.defaultCurrency)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-amber-500" />
                              <span className="text-xs font-bold text-zinc-600">En attente ({data.unpaidCount})</span>
                            </div>
                            <span className="text-xs font-black text-amber-600">{formatCurrency(data.unpaid, technician.defaultCurrency)}</span>
                          </div>
                          <div className="pt-2 border-t border-zinc-50 flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-zinc-900">Total</span>
                            <span className="text-sm font-black text-zinc-900">{formatCurrency(data.total, technician.defaultCurrency)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Bar name="Payé" dataKey="paid" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={32} />
              <Bar name="En attente" dataKey="unpaid" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Mobile Add Button */}
      <Button
        onClick={onCreateInvoice}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-2xl sm:hidden"
      >
        <Plus className="h-8 w-8" />
      </Button>
    </div>
  );
};
