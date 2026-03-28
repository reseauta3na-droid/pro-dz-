import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calculator, Calendar, User, Briefcase, FileText, CreditCard, Sparkles, Loader2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Client, InvoiceItem, Invoice, Currency, Technician } from '../types';
import { calculateInvoiceTotals, formatCurrency } from '../utils/calculations';
import { generateInvoiceDescription } from '../services/aiService';

interface InvoiceFormProps {
  clients: Client[];
  technician: Technician;
  initialData?: Partial<Invoice>;
  onSave: (invoice: Partial<Invoice>) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ clients, technician, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState({
    invoiceNumber: initialData?.invoiceNumber || `${initialData?.type === 'quote' ? 'DEV' : 'FAC'}/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    type: initialData?.type || 'invoice',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    projectName: initialData?.projectName || '',
    clientId: initialData?.clientId || '',
    isNewClient: false,
    newClient: { name: '', address: '', email: '', phone: '', nif: '', nis: '', bankAccount: '', additionalInfo: '' },
      items: initialData?.items || [{ description: '', unit: 'day', quantity: 1, pricePerUnit: 0 }] as InvoiceItem[],
    currency: initialData?.currency || 'DZD' as Currency,
    status: initialData?.status || 'unpaid',
    paidAmount: initialData?.paidAmount || 0,
    showSignature: initialData?.showSignature ?? true,
    showStamp: initialData?.showStamp ?? true,
    taxRate: initialData?.taxRate ?? 0.005,
    tvaRate: initialData?.tvaRate ?? 0,
    notes: initialData?.notes || '',
  });

  // Auto-set TVA to 0 if auto-entrepreneur
  React.useEffect(() => {
    if (technician.legalStatus === 'auto-entrepreneur') {
      setFormData(prev => ({ ...prev, tvaRate: 0 }));
    }
  }, [technician.legalStatus]);

  // Update invoice number prefix when type changes if it's still a default number
  React.useEffect(() => {
    if (!initialData?.invoiceNumber) {
      const prefix = formData.type === 'quote' ? 'DEV' : 'FAC';
      const currentPrefix = formData.invoiceNumber.split('/')[0];
      if (currentPrefix !== prefix) {
        setFormData(prev => ({
          ...prev,
          invoiceNumber: prev.invoiceNumber.replace(currentPrefix, prefix)
        }));
      }
    }
  }, [formData.type, initialData?.invoiceNumber]);

  const [isGenerating, setIsGenerating] = React.useState<number | null>(null);

  const handleAiGenerate = async (index: number) => {
    const item = formData.items[index];
    if (!item.description && !formData.projectName) {
      alert("Veuillez saisir une description de base ou un nom de projet pour aider l'IA.");
      return;
    }

    setIsGenerating(index);
    try {
      const suggestion = await generateInvoiceDescription(item.description, formData.projectName);
      if (suggestion) {
        updateItem(index, 'description', suggestion);
      }
    } finally {
      setIsGenerating(null);
    }
  };

  const totals = calculateInvoiceTotals(formData.items, formData.taxRate, formData.tvaRate);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', unit: 'day', quantity: 1, pricePerUnit: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    let updatedItem = { ...newItems[index], [field]: value };
    
    // If unit is changed to forfait, set quantity to 1
    if (field === 'unit' && value === 'forfait') {
      updatedItem.quantity = 1;
    }
    
    newItems[index] = updatedItem;
    setFormData({ ...formData, items: newItems });
  };

  const updateDuration = (index: number, weeks: number, days: number) => {
    const quantity = weeks + (days / 6);
    updateItem(index, 'quantity', quantity);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const invoiceData: any = {
      ...formData,
      ...totals,
    };

    if (formData.isNewClient) {
      invoiceData.newClientData = {
        ...formData.newClient,
        id: Math.random().toString(36).substr(2, 9),
      };
      invoiceData.clientId = invoiceData.newClientData.id;
    }

    onSave(invoiceData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-32">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: General Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Informations Générales</h3>
              <div className="flex rounded-xl bg-zinc-100 p-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'invoice' })}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${formData.type === 'invoice' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  Facture
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'quote' })}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${formData.type === 'quote' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  Devis
                </button>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label={formData.type === 'invoice' ? "Numéro de Facture" : "Numéro de Devis"}
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                icon={<FileText className="h-4 w-4" />}
                required
              />
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                icon={<Calendar className="h-4 w-4" />}
                required
              />
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Input
                label="Nom du Projet"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                icon={<Briefcase className="h-4 w-4" />}
                placeholder="ex: Tournage Publicité Ooredoo"
                required
              />
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Devise</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <select
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-3 pl-12 pr-4 text-sm font-bold transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                  >
                    <option value="DZD">DZD (Dinar Algérien)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar US)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Client</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isNewClient: !formData.isNewClient, clientId: '' })}
                    className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                  >
                    {formData.isNewClient ? "Sélectionner existant" : "+ Nouveau Client"}
                  </button>
                </div>
                <div className="relative">
                  {!formData.isNewClient ? (
                    <>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <User className="h-4 w-4" />
                      </div>
                      <select
                        value={formData.clientId}
                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        required={!formData.isNewClient}
                      >
                        <option value="">Sélectionner un client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
                      <Input
                        label="Nom du Client / Entreprise"
                        value={formData.newClient.name}
                        onChange={(e) => setFormData({ ...formData, newClient: { ...formData.newClient, name: e.target.value } })}
                        placeholder="ex: Agence de Communication"
                        required={formData.isNewClient}
                        className="bg-white"
                      />
                      <Input
                        label="Adresse du Client"
                        value={formData.newClient.address}
                        onChange={(e) => setFormData({ ...formData, newClient: { ...formData.newClient, address: e.target.value } })}
                        placeholder="ex: 123 Rue d'Alger, Alger"
                        required={formData.isNewClient}
                        className="bg-white"
                      />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                          label="Email"
                          type="email"
                          value={formData.newClient.email}
                          onChange={(e) => setFormData({ ...formData, newClient: { ...formData.newClient, email: e.target.value } })}
                          placeholder="client@email.com"
                          className="bg-white"
                        />
                        <Input
                          label="Téléphone"
                          value={formData.newClient.phone}
                          onChange={(e) => setFormData({ ...formData, newClient: { ...formData.newClient, phone: e.target.value } })}
                          placeholder="0555 00 00 00"
                          className="bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                          label="NIF (Optionnel)"
                          value={formData.newClient.nif}
                          onChange={(e) => setFormData({ ...formData, newClient: { ...formData.newClient, nif: e.target.value } })}
                          placeholder="Numéro d'Identification Fiscale"
                          className="bg-white"
                        />
                        <Input
                          label="NIS (Optionnel)"
                          value={formData.newClient.nis}
                          onChange={(e) => setFormData({ ...formData, newClient: { ...formData.newClient, nis: e.target.value } })}
                          placeholder="Numéro d'Identification Statistique"
                          className="bg-white"
                        />
                      </div>
                      <Input
                        label="RIB / CCP (Optionnel)"
                        icon={<CreditCard className="h-4 w-4" />}
                        value={formData.newClient.bankAccount}
                        onChange={(e) => setFormData({ ...formData, newClient: { ...formData.newClient, bankAccount: e.target.value } })}
                        placeholder="Numéro de compte bancaire ou CCP"
                        className="bg-white"
                      />
                      <Input
                        label="Infos Supplémentaires (Optionnel)"
                        value={formData.newClient.additionalInfo}
                        onChange={(e) => setFormData({ ...formData, newClient: { ...formData.newClient, additionalInfo: e.target.value } })}
                        placeholder="Autres informations..."
                        className="bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Input
                  label="Notes / Conditions de paiement"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  icon={<FileText className="h-4 w-4" />}
                  placeholder="ex: Paiement à la réception, validité du devis 15 jours..."
                />
              </div>
            </Card>

          {/* Items Section */}
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Détails de la Prestation</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {formData.items.map((item, index) => {
                  const weeks = Math.floor(item.quantity);
                  const days = Math.round((item.quantity - weeks) * 6);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 sm:flex-row sm:items-end"
                    >
                      <div className="flex-1">
                        <div className="relative">
                          <Input
                            label="Description"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="ex: Chef Opérateur Son"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => handleAiGenerate(index)}
                            disabled={isGenerating !== null}
                            className="absolute right-3 top-[34px] text-purple-500 hover:text-purple-600 disabled:opacity-50"
                            title="Améliorer avec l'IA"
                          >
                            {isGenerating === index ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Unité</label>
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="day">Jour</option>
                            <option value="week">Semaine (6j)</option>
                            <option value="forfait">Forfait</option>
                          </select>
                      </div>
                      
                      {item.unit === 'week' ? (
                        <div className="flex gap-2 w-full sm:w-40">
                          <div className="flex-1">
                            <Input
                              label="Sem."
                              type="number"
                              min="0"
                              value={isNaN(weeks) ? '' : String(weeks)}
                              onChange={(e) => updateDuration(index, parseInt(e.target.value) || 0, days)}
                              required
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              label="Jours"
                              type="number"
                              min="0"
                              max="5"
                              value={isNaN(days) ? '' : String(days)}
                              onChange={(e) => updateDuration(index, weeks, parseInt(e.target.value) || 0)}
                              required
                            />
                          </div>
                        </div>
                      ) : item.unit === 'day' ? (
                        <div className="w-full sm:w-24">
                          <Input
                            label="Qté"
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={isNaN(item.quantity) ? '' : String(item.quantity)}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                      ) : (
                        <div className="w-full sm:w-24 flex items-end justify-center pb-2.5">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Forfait</span>
                        </div>
                      )}

                      <div className="w-full sm:w-32">
                        <Input
                          label="Prix Unit."
                          type="number"
                          value={isNaN(item.pricePerUnit) ? '' : String(item.pricePerUnit)}
                          onChange={(e) => updateItem(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-red-500 sm:mb-1"
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-6">
          <Card className="sticky top-24 p-6">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-zinc-500">Récapitulatif</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Total Jours</span>
                <span className="font-bold text-zinc-900">{totals.totalDays} jours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Sous-total</span>
                <span className="font-bold text-zinc-900">{formatCurrency(totals.subTotal, formData.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-500">Impôt IFU (0.5%)</span>
                  <input
                    type="checkbox"
                    checked={formData.taxRate > 0}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.checked ? 0.005 : 0 })}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <span className="font-bold text-emerald-600">+{formatCurrency(totals.taxAmount, formData.currency)}</span>
              </div>
              {technician.legalStatus === 'registre-commerce' && (
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-zinc-500">TVA (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.tvaRate * 100}
                        onChange={(e) => setFormData({ ...formData, tvaRate: (parseFloat(e.target.value) || 0) / 100 })}
                        className="w-16 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-bold outline-none focus:border-emerald-500"
                      />
                    </div>
                    <span className="font-bold text-emerald-600">
                      +{formatCurrency(totals.tvaAmount, formData.currency)}
                    </span>
                  </div>
                </div>
              )}
              <div className="border-t border-zinc-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-zinc-900">Total Net</span>
                  <span className="text-2xl font-black text-emerald-600">{formatCurrency(totals.total, formData.currency)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Input
                      label={`Acompte (${formData.currency})`}
                      type="number"
                      icon={<CreditCard className="h-4 w-4" />}
                      value={isNaN(formData.paidAmount) ? '' : String(formData.paidAmount)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        let newStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
                        if (val >= totals.total) newStatus = 'paid';
                        else if (val > 0) newStatus = 'partial';
                        
                        setFormData({ 
                          ...formData, 
                          paidAmount: val,
                          status: newStatus
                        });
                      }}
                      placeholder={`0.00 ${formData.currency}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Input
                      label="Taux (%)"
                      type="number"
                      min="0"
                      max="100"
                      value={totals.total > 0 ? Math.round((formData.paidAmount / totals.total) * 100) : 0}
                      onChange={(e) => {
                        const percentage = parseFloat(e.target.value) || 0;
                        const val = (percentage / 100) * totals.total;
                        let newStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
                        if (val >= totals.total) newStatus = 'paid';
                        else if (val > 0) newStatus = 'partial';
                        
                        setFormData({ 
                          ...formData, 
                          paidAmount: val,
                          status: newStatus
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-1">
                  <span className="text-zinc-400">Reste à payer</span>
                  <span className={totals.total - formData.paidAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                    {formatCurrency(Math.max(0, totals.total - formData.paidAmount), formData.currency)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-paid"
                    checked={formData.status === 'paid'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      status: e.target.checked ? 'paid' : 'unpaid',
                      paidAmount: e.target.checked ? totals.total : formData.paidAmount
                    })}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="is-paid" className="text-sm font-medium text-zinc-700 cursor-pointer">
                    Marquer comme entièrement payée
                  </label>
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Options du Document</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="show-signature"
                        checked={formData.showSignature}
                        onChange={(e) => setFormData({ ...formData, showSignature: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="show-signature" className="text-sm text-zinc-700 cursor-pointer">Afficher la Signature</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="show-stamp"
                        checked={formData.showStamp}
                        onChange={(e) => setFormData({ ...formData, showStamp: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="show-stamp" className="text-sm text-zinc-700 cursor-pointer">Afficher le Cachet</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Button type="submit" className="w-full" size="lg">
                  <Calculator className="mr-2 h-5 w-5" />
                  Générer {formData.type === 'invoice' ? 'la Facture' : 'le Devis'}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                  Annuler
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
  );
};
