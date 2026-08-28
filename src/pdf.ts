import type { Quote, Revision } from './types';

function money(value: number, currency: string) {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(value);
}

function total(revision: Revision) {
  return revision.snapshot.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
}

export async function exportRevisionPdf(quote: Quote, revision: Revision): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 48;
  let y = 56;

  pdf.setFillColor(12, 35, 40);
  pdf.rect(0, 0, pageWidth, 18, 'F');
  pdf.setTextColor(20, 45, 50);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(quote.business || 'Quote', margin, y);
  y += 30;
  pdf.setFontSize(24);
  pdf.text(revision.snapshot.title || 'Untitled quote', margin, y);
  y += 24;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(82, 98, 102);
  pdf.text(`Revision ${revision.number} · ${new Date(revision.createdAt).toLocaleString()}`, margin, y);
  y += 18;
  pdf.text(`Prepared for ${revision.snapshot.client || 'Client not named'} · Valid until ${revision.snapshot.validUntil || 'Not set'}`, margin, y);
  y += 30;

  pdf.setDrawColor(192, 138, 39);
  pdf.setLineWidth(1.5);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 22;
  pdf.setTextColor(20, 45, 50);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DESCRIPTION', margin, y);
  pdf.text('QTY', 360, y, { align: 'right' });
  pdf.text('RATE', 450, y, { align: 'right' });
  pdf.text('AMOUNT', pageWidth - margin, y, { align: 'right' });
  y += 15;

  for (const item of revision.snapshot.items) {
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(item.description || 'Untitled item', 250) as string[];
    pdf.text(lines, margin, y);
    pdf.text(String(item.quantity), 360, y, { align: 'right' });
    pdf.text(money(item.rate, revision.snapshot.currency), 450, y, { align: 'right' });
    pdf.text(money(item.quantity * item.rate, revision.snapshot.currency), pageWidth - margin, y, { align: 'right' });
    y += Math.max(22, lines.length * 12 + 8);
  }

  pdf.line(margin, y, pageWidth - margin, y);
  y += 24;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(`Total ${money(total(revision), revision.snapshot.currency)}`, pageWidth - margin, y, { align: 'right' });
  y += 30;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const noteLines = pdf.splitTextToSize(revision.snapshot.notes || 'No notes.', pageWidth - margin * 2) as string[];
  pdf.text(noteLines, margin, y);
  y = pdf.internal.pageSize.getHeight() - 42;
  pdf.setTextColor(82, 98, 102);
  pdf.text('Revision receipt from Quote Revision Vault. This is not a legal signature.', margin, y);
  pdf.save(`${(quote.title || 'quote').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-revision-${revision.number}.pdf`);
}
