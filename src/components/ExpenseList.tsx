import React from 'react';
import { Plus, Receipt, Calendar, Tag, Trash2, Edit2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Expense } from '../types';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExpenseListProps {
  expenses: Expense[];
  onAdd: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onAdd, onEdit, onDelete }) => {
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const categories = {
    equipment: 'Équipement',
    transport: 'Transport',
    software: 'Logiciel',
    fiscal: 'Fiscal / Social',
    other: 'Autre'
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Dépenses</h1>
          <p className="text-zinc-500">Gérez vos coûts pour calculer votre bénéfice net.</p>
        </div>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-5 w-5" />
          Nouvelle Dépense
        </Button>
      </header>

      <div className="grid gap-6">
        {sortedExpenses.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
            <div className="mb-4 rounded-full bg-zinc-100 p-4 text-zinc-400">
              <Receipt className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Aucune dépense</h3>
            <p className="text-sm text-zinc-500">Ajoutez votre première dépense pour suivre vos coûts.</p>
            <Button variant="outline" onClick={onAdd} className="mt-6">
              Ajouter une dépense
            </Button>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <th className="pb-4 pr-4">Description</th>
                  <th className="pb-4 pr-4">Catégorie</th>
                  <th className="pb-4 pr-4">Date</th>
                  <th className="pb-4 pr-4 text-right">Montant</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {sortedExpenses.map((expense) => (
                  <tr key={expense.id} className="group hover:bg-zinc-50/50">
                    <td className="py-4 pr-4">
                      <span className="text-sm font-bold text-zinc-900">{expense.description}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-3 w-3 text-zinc-400" />
                        <span className="text-xs font-medium text-zinc-600">{categories[expense.category]}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-zinc-400" />
                        <span className="text-xs text-zinc-500">
                          {format(new Date(expense.date), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className="text-sm font-black text-red-600">-{formatCurrency(expense.amount, expense.currency)}</span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
                          <Edit2 className="h-4 w-4 text-zinc-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
