import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, FileText, CheckCircle, Clock, Plus, Calendar, User, Briefcase } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatCurrency } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Invoice, Client } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardProps {
  stats: {
    totalEarned: number;
    invoiceCount: number;
    paidCount: number;
    unpaidCount: number;
    annualTotal: number;
    annualIfu: number;
    monthlyData: { month: string; amount: number }[];
  };
  invoices: Invoice[];
  clients: Client[];
  onCreateInvoice: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, invoices, clients, onCreateInvoice }) => {
  const recentInvoices = [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

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

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col justify-between border-emerald-100 bg-emerald-50/50">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Total Gagné</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-emerald-900">{formatCurrency(stats.totalEarned)}</h2>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-600">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Factures</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-zinc-900">{stats.invoiceCount}</h2>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Payées</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-emerald-900">{stats.paidCount}</h2>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">En Attente</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-amber-900">{stats.unpaidCount}</h2>
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
              <h4 className="text-2xl font-black text-zinc-900">{formatCurrency(stats.annualTotal)}</h4>
              <p className="text-xs text-zinc-500 mt-2">Total des factures (payées ou non) pour l'année en cours.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">Impôt à payer (0.5%)</p>
              <h4 className="text-3xl font-black text-amber-600">{formatCurrency(stats.annualIfu)}</h4>
              <div className="mt-4 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <Clock className="h-3 w-3" />
                <span>À payer avant le 30 Juin {new Date().getFullYear() + 1}</span>
              </div>
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
        <h3 className="mb-6 text-lg font-bold text-zinc-900">Évolution des Revenus</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: 600, fill: '#71717a' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: 600, fill: '#71717a' }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: '#f4f4f5', radius: 8 }}
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Revenu']}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {stats.monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === stats.monthlyData.length - 1 ? '#059669' : '#10b981'} />
                ))}
              </Bar>
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
