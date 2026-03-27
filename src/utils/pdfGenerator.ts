import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCode from 'qrcode';
import { numberToWords } from './numberToWords';
import { Invoice, Client, Technician } from '../types';
import { formatCurrency } from './calculations';

export const generateInvoicePDF = async (invoice: Invoice, client: Client, technician: Technician) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Colors
    const primaryColor = [16, 185, 129]; // Emerald 500
    const secondaryColor = [113, 113, 122]; // Zinc 500
    const darkColor = [24, 24, 27]; // Zinc 900

    // Header - Technician Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`${technician.firstName} ${technician.lastName}`, margin, 30);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(technician.fonction || 'Technicien', margin, 37);
    
    doc.setFontSize(9);
    if (technician.address) doc.text(technician.address, margin, 45);
    if (technician.phone) doc.text(`Tél: ${technician.phone}`, margin, 50);
    if (technician.email) doc.text(`Email: ${technician.email}`, margin, 55);
    let currentY = 60;
    if (technician.nif) {
      doc.text(`NIF: ${technician.nif}`, margin, currentY);
      currentY += 5;
    }
    if (technician.legalStatus === 'auto-entrepreneur') {
      if (technician.carteAutoentrepreneur) {
        doc.text(`Carte Auto-entrepreneur: ${technician.carteAutoentrepreneur}`, margin, currentY);
        currentY += 5;
      }
    } else {
      if (technician.registreCommerce) {
        doc.text(`RC: ${technician.registreCommerce}`, margin, currentY);
        currentY += 5;
      }
    }
    if (technician.additionalInfo) {
      doc.text(technician.additionalInfo, margin, currentY);
    }

    // Invoice Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const label = invoice.type === 'quote' ? 'DEVIS' : 'FACTURE';
    const labelWidth = doc.getTextWidth(label);
    doc.text(label, pageWidth - margin - labelWidth, 35);

    doc.setFontSize(12);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    const invoiceNum = invoice.invoiceNumber;
    const invoiceNumWidth = doc.getTextWidth(invoiceNum);
    doc.text(invoiceNum, pageWidth - margin - invoiceNumWidth, 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    
    let dateObj = new Date(invoice.date);
    if (!isValid(dateObj)) {
      dateObj = new Date();
    }
    const dateStr = `Date: ${format(dateObj, 'dd/MM/yyyy')}`;
    const dateWidth = doc.getTextWidth(dateStr);
    doc.text(dateStr, pageWidth - margin - dateWidth, 52);

    // Client Info
    const clientY = 85;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('FACTURER À', margin, clientY);

    doc.setFontSize(12);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(client.name, margin, clientY + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    let clientInfoY = clientY + 14;
    if (client.address) {
      doc.text(client.address, margin, clientInfoY);
      clientInfoY += 6;
    }
    if (client.phone) {
      doc.text(`Tél: ${client.phone}`, margin, clientInfoY);
      clientInfoY += 6;
    }
    if (client.email) {
      doc.text(`Email: ${client.email}`, margin, clientInfoY);
      clientInfoY += 6;
    }
    if (client.nif) {
      doc.text(`NIF: ${client.nif}`, margin, clientInfoY);
      clientInfoY += 6;
    }
    if (client.nis) {
      doc.text(`NIS: ${client.nis}`, margin, clientInfoY);
      clientInfoY += 6;
    }
    if (client.rc) {
      doc.text(`RC: ${client.rc}`, margin, clientInfoY);
      clientInfoY += 6;
    }
    if (client.ai) {
      doc.text(`AI: ${client.ai}`, margin, clientInfoY);
      clientInfoY += 6;
    }
    if (client.bankAccount) {
      doc.text(`RIB/CCP: ${client.bankAccount}`, margin, clientInfoY);
      clientInfoY += 6;
    }
    if (client.additionalInfo) {
      doc.text(client.additionalInfo, margin, clientInfoY);
    }

    // Project Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('PROJET', pageWidth / 2 + 10, clientY);
    
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(invoice.projectName, pageWidth / 2 + 10, clientY + 7);

    // Items Table
    const tableData = invoice.items.map(item => {
      const weeks = Math.floor(item.quantity);
      const days = Math.round((item.quantity - weeks) * 6);
      const quantityDisplay = item.unit === 'forfait' 
        ? ''
        : item.unit === 'week'
          ? `${weeks}s ${days}j`
          : item.quantity.toString();

      const unitLabel = {
        'day': 'Jour',
        'week': 'Semaine',
        'forfait': 'Forfait'
      }[item.unit];

      return [
        item.description,
        unitLabel,
        quantityDisplay,
        formatCurrency(item.pricePerUnit),
        item.unit === 'forfait' ? formatCurrency(item.pricePerUnit) : formatCurrency(item.quantity * item.pricePerUnit)
      ];
    });

    autoTable(doc, {
      startY: clientY + 45,
      head: [['Description', 'Unité', 'Qté', 'Prix Unitaire', 'Montant']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor as any,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', cellWidth: 35 }
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    let currentTotalsY = finalY;

    // Totals
    const totalsX = pageWidth - margin - 60;
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Sous-total:', totalsX, finalY);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(formatCurrency(invoice.subTotal), pageWidth - margin, finalY, { align: 'right' });

    if (invoice.taxRate > 0) {
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Impôt IFU (${invoice.taxRate * 100}%):`, totalsX, currentTotalsY);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(formatCurrency(invoice.taxAmount), pageWidth - margin, currentTotalsY, { align: 'right' });
      currentTotalsY += 7;
    }

    if (invoice.tvaRate > 0) {
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`TVA (${invoice.tvaRate * 100}%):`, totalsX, currentTotalsY);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(`+${formatCurrency(invoice.tvaAmount)}`, pageWidth - margin, currentTotalsY, { align: 'right' });
      currentTotalsY += 7;
    }

    if (invoice.taxRate === 0 && invoice.tvaRate === 0) {
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Taxes:', totalsX, currentTotalsY);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      const exemptionText = technician.legalStatus === 'auto-entrepreneur' ? 'Exonéré (Auto-entrepreneur)' : 'Non assujetti';
      doc.text(exemptionText, pageWidth - margin, currentTotalsY, { align: 'right' });
      currentTotalsY += 7;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TOTAL:', totalsX, currentTotalsY + 5);
    doc.text(formatCurrency(invoice.total), pageWidth - margin, currentTotalsY + 5, { align: 'right' });

    // Amount in words
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    const amountInWords = `Arrêté la présente ${invoice.type === 'quote' ? 'devis' : 'facture'} à la somme de : ${numberToWords(invoice.total)}`;
    const splitAmountInWords = doc.splitTextToSize(amountInWords, pageWidth - (margin * 2));
    doc.text(splitAmountInWords, margin, currentTotalsY + 15);

    if (invoice.paidAmount > 0) {
      const paidY = currentTotalsY + 30;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Acompte versé:', totalsX, paidY);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(formatCurrency(invoice.paidAmount), pageWidth - margin, paidY, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.text('RESTE À PAYER:', totalsX, paidY + 8);
      doc.text(formatCurrency(invoice.total - invoice.paidAmount), pageWidth - margin, paidY + 8, { align: 'right' });
    }

    // Notes
    if (invoice.notes || technician.legalStatus === 'auto-entrepreneur') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('NOTES', margin, finalY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      
      let noteText = invoice.notes || '';
      
      const splitNotes = doc.splitTextToSize(noteText, pageWidth / 2 - margin);
      doc.text(splitNotes, margin, finalY + 7);
    }

    // QR Code, Signature & Stamp
    const footerStartY = Math.max(finalY + 50, doc.internal.pageSize.getHeight() - 80);
    
    // QR Code on the left
    try {
      const qrData = `Facture: ${invoice.invoiceNumber}\nDate: ${format(dateObj, 'dd/MM/yyyy')}\nClient: ${client.name}\nTechnicien: ${technician.firstName} ${technician.lastName}\nTotal: ${formatCurrency(invoice.total)}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);
      doc.addImage(qrCodeDataUrl, 'PNG', margin, footerStartY, 35, 35);
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Scanner pour vérifier', margin, footerStartY + 40);
    } catch (e) {
      console.error('Error adding QR code to PDF', e);
    }

    // Signature & Stamp on the right
    const rightSideX = pageWidth - margin - 45;
    
    if (invoice.showSignature && technician.signatureUrl) {
      try {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('SIGNATURE', rightSideX, footerStartY - 5);
        doc.addImage(technician.signatureUrl, 'PNG', rightSideX, footerStartY, 40, 20);
      } catch (e) {
        console.error('Error adding signature to PDF', e);
      }
    }

    if (invoice.showStamp && technician.stampUrl) {
      const stampY = invoice.showSignature && technician.signatureUrl ? footerStartY + 25 : footerStartY;
      try {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('CACHET', rightSideX, stampY - 5);
        doc.addImage(technician.stampUrl, 'PNG', rightSideX, stampY, 40, 20);
      } catch (e) {
        console.error('Error adding stamp to PDF', e);
      }
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const footerText = `Généré par TechDZ Pro • ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, doc.internal.pageSize.getHeight() - 10);

    // Save PDF
    doc.save(`${invoice.type === 'quote' ? 'Devis' : 'Facture'}_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};
