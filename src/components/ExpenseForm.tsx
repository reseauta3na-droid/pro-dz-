import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Expense, Currency } from '../types';

interface ExpenseFormProps {
  expense?: Partial<Expense> | null;
  defaultCurrency?: Currency;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, defaultCurrency = 'DZD', onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    date: expense?.date || new Date().toISOString().split('T')[0],
    category: expense?.category || 'equipment',
    currency: expense?.currency || defaultCurrency,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Description</label>
          <input
            type="text"
            required
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold focus:border-emerald-500 focus:ring-0 text-zinc-900"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Achat disque dur"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Montant</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold focus:border-emerald-500 focus:ring-0 text-zinc-900"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Devise</label>
            <select
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold focus:border-emerald-500 focus:ring-0 text-zinc-900"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
            >
              <option value="DZD">DZD</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Date</label>
            <input
              type="date"
              required
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold focus:border-emerald-500 focus:ring-0 text-zinc-900"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Catégorie</label>
            <select
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold focus:border-emerald-500 focus:ring-0 text-zinc-900"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            >
              <option value="equipment">Équipement</option>
              <option value="transport">Transport</option>
              <option value="software">Logiciel</option>
              <option value="fiscal">Fiscal / Social</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Enregistrer
        </Button>
      </div>
    </form>
  );
};
