import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter, MoreVertical, Download, Eye, Trash2, CheckCircle, Clock, FileText, Plus, Pencil } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Invoice, Client } from '../types';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InvoiceListProps {
  invoices: Invoice[];
  clients: Client[];
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onStatusChange: (invoice: Invoice, status: 'paid' | 'unpaid' | 'partial') => void;
  onCreate: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  clients,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onStatusChange,
  onCreate,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredInvoices = invoices.filter((invoice) => {
    const client = clients.find((c) => c.id === invoice.clientId);
    const searchStr = `${invoice.invoiceNumber} ${invoice.projectName} ${client?.name}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Factures</h1>
          <p className="text-zinc-500">Gérez vos prestations et suivez vos paiements.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Rechercher une facture..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={onCreate} className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>
      </header>

      <div className="grid gap-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => {
            const client = clients.find((c) => c.id === invoice.clientId);
            return (
              <Card key={invoice.id} className="group hover:border-emerald-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-200',
                        invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 
                        invoice.status === 'partial' ? 'bg-blue-100 text-blue-600' : 
                        'bg-amber-100 text-amber-600'
                      )}
                    >
                      {invoice.status === 'paid' ? <CheckCircle className="h-6 w-6" /> : 
                       invoice.status === 'partial' ? <Clock className="h-6 w-6" /> : 
                       <Clock className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {invoice.invoiceNumber}
                        </span>
                        <Badge variant="neutral">
                          {invoice.type === 'quote' ? 'Devis' : 'Facture'}
                        </Badge>
                        <Badge variant={
                          invoice.status === 'paid' ? 'success' : 
                          invoice.status === 'partial' ? 'info' : 
                          'warning'
                        }>
                          {invoice.status === 'paid' ? 'Payée' : 
                           invoice.status === 'partial' ? 'Partielle' : 
                           'En attente'}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-zinc-900">{invoice.projectName}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-zinc-500">
                          {client?.name} • {format(new Date(invoice.date), 'dd MMM yyyy', { locale: fr })}
                        </p>
                        {invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                          <div className="flex items-center space-x-1.5">
                            <span className="text-zinc-300">•</span>
                            <div className="flex items-center space-x-1">
                              <div className="h-1.5 w-12 overflow-hidden rounded-full bg-zinc-100">
                                <div 
                                  className="h-full bg-emerald-500" 
                                  style={{ width: `${Math.min(100, (invoice.paidAmount / invoice.total) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-emerald-600">
                                {Math.round((invoice.paidAmount / invoice.total) * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-black text-zinc-900">{formatCurrency(invoice.total)}</p>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        {invoice.totalDays} jours
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <Button variant="ghost" size="icon" onClick={() => onView(invoice)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(invoice)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDownload(invoice)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(invoice)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-zinc-100 p-4 text-zinc-400">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Aucune facture trouvée</h3>
            <p className="text-zinc-500">Commencez par créer votre première facture.</p>
            <Button onClick={onCreate} className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Créer une facture
            </Button>
          </Card>
        )}
      </div>
      
      {/* Mobile FAB */}
      <Button
        onClick={onCreate}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-2xl sm:hidden"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
