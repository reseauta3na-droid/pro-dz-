import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Printer, Share2, CheckCircle, Clock, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Invoice, Client, Technician } from '../types';
import { formatCurrency } from '../utils/calculations';
import { numberToWords } from '../utils/numberToWords';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { generateInvoicePDF } from '../utils/pdfGenerator';

interface InvoicePreviewProps {
  invoice: Invoice;
  client: Client;
  technician: Technician;
  onClose: () => void;
  onStatusChange: (status: 'paid' | 'unpaid' | 'partial') => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  client,
  technician,
  onClose,
  onStatusChange,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    try {
      await generateInvoicePDF(invoice, client, technician);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF.');
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour, voici votre ${docLabel} ${invoice.invoiceNumber} pour le projet ${invoice.projectName}.\n` +
      `Montant Total: ${formatCurrency(invoice.total, invoice.currency)}\n` +
      `Lien: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`${docLabel} ${invoice.invoiceNumber} - ${invoice.projectName}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-joint les détails de votre ${docLabel.toLowerCase()}.\n\n` +
      `Numéro: ${invoice.invoiceNumber}\n` +
      `Projet: ${invoice.projectName}\n` +
      `Montant Total: ${formatCurrency(invoice.total, invoice.currency)}\n\n` +
      `Cordialement,\n${technician.firstName} ${technician.lastName}`
    );
    window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
  };

  const docLabel = invoice.type === 'quote' ? 'Devis' : 'Facture';
  const qrValue = `${docLabel}: ${invoice.invoiceNumber}\nDate: ${invoice.date}\nClient: ${client.name}\nProjet: ${invoice.projectName}\nTotal: ${formatCurrency(invoice.total, invoice.currency)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {invoice.type === 'invoice' && (
            <div className="flex items-center space-x-2">
              <Button
                variant={invoice.status === 'paid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onStatusChange(invoice.status === 'paid' ? 'unpaid' : 'paid')}
              >
                {invoice.status === 'paid' ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Payée
                  </>
                ) : invoice.status === 'partial' ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Partielle ({Math.round((invoice.paidAmount / invoice.total) * 100)}%)
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Marquer comme payée
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-zinc-100/50 p-0 sm:p-8">
        <div
          ref={invoiceRef}
          className="mx-auto w-full max-w-[210mm] min-h-[297mm] bg-white p-[10mm] sm:p-[20mm] shadow-lg text-zinc-900 font-sans"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Header */}
            <div className="flex justify-between border-b-2 border-emerald-600 pb-8 relative">
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-emerald-600 uppercase">{docLabel}</h1>
                <p className="mt-2 text-lg font-bold text-zinc-500">{invoice.invoiceNumber}</p>
                <p className="text-sm text-zinc-400">Date: {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: fr })}</p>
              </div>
              
              {/* Status Badge in PDF */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2">
                {invoice.status === 'paid' ? (
                  <div className="border-4 border-emerald-500/20 rounded-full px-6 py-2 rotate-[-12deg] opacity-60">
                    <span className="text-2xl font-black text-emerald-500 uppercase tracking-widest">PAYÉE</span>
                  </div>
                ) : invoice.status === 'partial' ? (
                  <div className="border-4 border-amber-500/20 rounded-full px-6 py-2 rotate-[-12deg] opacity-60">
                    <span className="text-2xl font-black text-amber-500 uppercase tracking-widest">PARTIELLE</span>
                  </div>
                ) : null}
              </div>

              <div className="text-right">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {technician.firstName} {technician.lastName}
                </h2>
                {technician.fonction && (
                  <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide">{technician.fonction}</p>
                )}
                {technician.address && <p className="text-sm text-zinc-500">{technician.address}</p>}
                {technician.phone && <p className="text-sm text-zinc-500">{technician.phone}</p>}
                {technician.email && <p className="text-sm text-zinc-500">{technician.email}</p>}
                <div className="mt-1 flex flex-col items-end space-y-0.5 text-[10px] font-bold text-zinc-400 uppercase">
                  {technician.nif && <span>NIF: {technician.nif}</span>}
                  {technician.legalStatus === 'auto-entrepreneur' ? (
                    technician.carteAutoentrepreneur && <span>Carte Auto-entrepreneur: {technician.carteAutoentrepreneur}</span>
                  ) : (
                    technician.registreCommerce && <span>RC: {technician.registreCommerce}</span>
                  )}
                  {technician.additionalInfo && <span>{technician.additionalInfo}</span>}
                </div>
              </div>
          </div>

          {/* Client Info */}
          <div className="mt-12 grid grid-cols-2 gap-12">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4">
                {invoice.type === 'quote' ? 'Destinataire:' : 'Facturer à:'}
              </h3>
              <p className="text-lg font-bold">{client.name}</p>
              {client.address && <p className="text-sm text-zinc-500">{client.address}</p>}
              {client.phone && <p className="text-sm text-zinc-500">{client.phone}</p>}
              {client.email && <p className="text-sm text-zinc-500">{client.email}</p>}
              <div className="mt-2 flex flex-col space-y-1 text-xs font-bold text-zinc-400 uppercase">
                <div className="flex space-x-4">
                  {client.nif && <span>NIF: {client.nif}</span>}
                  {client.nis && <span>NIS: {client.nis}</span>}
                </div>
                <div className="flex space-x-4">
                  {client.rc && <span>RC: {client.rc}</span>}
                  {client.ai && <span>AI: {client.ai}</span>}
                </div>
                {client.bankAccount && <span>RIB/CCP: {client.bankAccount}</span>}
                {client.additionalInfo && <span>{client.additionalInfo}</span>}
              </div>
            </div>
            <div className="bg-zinc-50 p-6 rounded-2xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-2">Projet:</h3>
              <p className="text-xl font-black text-zinc-900">{invoice.projectName}</p>
            </div>
          </div>

          {/* Table */}
          <table className="mt-12 w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-100 text-left text-xs font-black uppercase tracking-widest text-zinc-400">
                <th className="py-4">Description</th>
                <th className="py-4 text-center">Unité</th>
                <th className="py-4 text-center">Qté</th>
                <th className="py-4 text-right">Prix Unit.</th>
                <th className="py-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {invoice.items.map((item, index) => {
                const weeks = Math.floor(item.quantity);
                const days = Math.round((item.quantity - weeks) * 6);
                const quantityDisplay = item.unit === 'week' 
                  ? `${weeks}s ${days}j`
                  : item.unit === 'forfait'
                    ? ''
                    : item.quantity;

                const unitLabel = {
                  'day': 'Jour',
                  'week': 'Semaine',
                  'forfait': 'Forfait'
                }[item.unit];
                return (
                  <tr key={index} className="text-sm">
                    <td className="py-6 font-bold text-zinc-900">{item.description}</td>
                    <td className="py-6 text-center text-zinc-500">{unitLabel}</td>
                    <td className="py-6 text-center font-bold">{quantityDisplay}</td>
                    <td className="py-6 text-right text-zinc-500">{formatCurrency(item.pricePerUnit, invoice.currency)}</td>
                    <td className="py-6 text-right font-black text-zinc-900">
                      {item.unit === 'forfait' ? formatCurrency(item.pricePerUnit, invoice.currency) : formatCurrency(item.quantity * item.pricePerUnit, invoice.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-12 flex flex-col items-end">
            <div className="w-full mb-4 text-right space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Sous-total en lettres:</p>
                <p className="text-sm font-bold text-zinc-900 italic">
                  {numberToWords(invoice.subTotal, invoice.currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Arrêté à la somme de:</p>
                <p className="text-sm font-bold text-zinc-900 italic">
                  {numberToWords(invoice.total, invoice.currency)}
                </p>
              </div>
            </div>
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Sous-total</span>
                  <span className="font-bold">{formatCurrency(invoice.subTotal, invoice.currency)}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Impôt IFU ({invoice.taxRate * 100}%)</span>
                    <span className="font-bold text-emerald-600">+{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                  </div>
                )}
                {invoice.tvaRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">TVA ({invoice.tvaRate * 100}%)</span>
                    <span className="font-bold text-emerald-600">+{formatCurrency(invoice.tvaAmount, invoice.currency)}</span>
                  </div>
                )}
                {invoice.taxRate === 0 && invoice.tvaRate === 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Taxes</span>
                    <span className="font-bold text-zinc-400 italic">
                      {technician.legalStatus === 'auto-entrepreneur' ? 'Exonéré (Auto-entrepreneur)' : 'Non assujetti'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-emerald-600 pt-4">
                <span className="text-lg font-black uppercase tracking-tighter text-emerald-600">Total Net</span>
                <span className="text-2xl font-black text-emerald-600">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm pt-4 border-t border-zinc-100">
                    <span className="text-zinc-500">Montant Payé</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(invoice.paidAmount, invoice.currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Taux de paiement</span>
                    <span>{Math.round((invoice.paidAmount / invoice.total) * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Reste à payer</span>
                    <span className="font-bold text-amber-600">{formatCurrency(Math.max(0, invoice.total - invoice.paidAmount), invoice.currency)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-24 grid grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="text-xs text-zinc-400 italic">
                {invoice.notes && <p className="mt-2">Notes: {invoice.notes}</p>}
                {technician.bankAccount && (
                  <div className="mt-4 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 not-italic">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Informations de Paiement (RIB/CCP):</p>
                    <p className="text-sm font-bold text-zinc-900 font-mono">{technician.bankAccount}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <QRCodeSVG value={qrValue} size={80} level="L" />
                <div className="text-[10px] text-zinc-400 font-mono leading-tight">
                  <p>VÉRIFICATION NUMÉRIQUE</p>
                  <p>DZ TECH v1.0</p>
                  <p>ID: {invoice.id.substring(0, 8)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-end space-y-4">
              <div className="flex items-center space-x-4">
                {technician.stampUrl && invoice.showStamp && (
                  <div className="h-24 w-24 relative">
                    <img src={technician.stampUrl} alt="Cachet" className="h-full w-full object-contain opacity-80" />
                  </div>
                )}
                <div className="h-24 w-48 border-b border-zinc-200 flex items-center justify-center relative">
                  {technician.signatureUrl && invoice.showSignature && (
                    <img src={technician.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                  )}
                  <span className="absolute -bottom-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Signature & Cachet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
