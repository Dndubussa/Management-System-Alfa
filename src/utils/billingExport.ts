import { Bill, Patient } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a PDF receipt for a bill
 */
export function generateReceiptPDF(bill: Bill, patient: Patient | undefined) {
  const doc = new jsPDF();
  
  // Hospital Header with Logo
  try {
    // Add hospital logo
    // Note: The logo should be in the public directory
    const logo = new Image();
    logo.src = '/hospital-logo.png';
    doc.addImage(logo, 'PNG', 20, 10, 40, 20);
  } catch (error) {
    // If logo fails to load, continue without it
    console.warn('Failed to load hospital logo:', error);
  }
  
  doc.setFontSize(18);
  doc.setTextColor(0, 100, 0); // Green color
  doc.text('ALFA SP HOSPITALS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Mikocheni Tanesco, Mwai Kibaki Rd, Dar es Salaam', 105, 30, { align: 'center' });
  doc.text('Phone: +255674404013 | Email: info@alfasphospitals.com', 105, 37, { align: 'center' });
  
  // Horizontal line
  doc.setDrawColor(0, 100, 0);
  doc.line(20, 45, 190, 45);
  
  // Document title
  doc.setFontSize(16);
  doc.setTextColor(0, 100, 0);
  doc.text('PAYMENT RECEIPT', 105, 55, { align: 'center' });
  
  // Bill information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  const receiptDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Left column - Bill info
  doc.text(`Receipt ID: R-${bill.id}`, 20, 70);
  doc.text(`Bill ID: ${bill.id}`, 20, 77);
  doc.text(`Date: ${receiptDate}`, 20, 84);
  doc.text(`Payment Method: ${bill.paymentMethod || 'Cash'}`, 20, 91);
  
  // Right column - Patient info
  if (patient) {
    doc.text(`Patient: ${patient.firstName} ${patient.lastName}`, 120, 70);
    doc.text(`Phone: ${patient.phone}`, 120, 77);
    doc.text(`Insurance: ${patient.insuranceInfo.provider || 'N/A'}`, 120, 84);
  }
  
  // Services table
  const tableData = bill.items.map(item => [
    item.serviceName,
    item.category.replace('-', ' '),
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.totalPrice)
  ]);
  
  autoTable(doc, {
    startY: 100,
    head: [['Service', 'Category', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 100, 0] },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Summary section
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  doc.setFontSize(12);
  doc.text('Subtotal:', 150, finalY + 10);
  doc.text(formatCurrency(bill.subtotal), 180, finalY + 10, { align: 'right' });
  
  // Remove VAT line completely since it's always 0%
  
  if (bill.discount > 0) {
    doc.text('Discount:', 150, finalY + 17);
    doc.text(`-${formatCurrency(bill.discount)}`, 180, finalY + 17, { align: 'right' });
  }
  
  doc.setDrawColor(0, 0, 0);
  doc.line(140, finalY + 23, 190, finalY + 23);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', 150, finalY + 30);
  doc.text(formatCurrency(bill.total), 180, finalY + 30, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Amount in words: ' + numberToWords(bill.total) + ' Tanzanian Shillings', 20, finalY + 43);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing ALFA SP HOSPITALS', 105, finalY + 63, { align: 'center' });
  doc.text('This is a computer generated receipt', 105, finalY + 68, { align: 'center' });
  
  return doc;
}

/**
 * Generate a PDF invoice for a bill
 */
export function generateInvoicePDF(bill: Bill, patient: Patient | undefined) {
  const doc = new jsPDF();
  
  // Hospital Header with Logo
  try {
    // Add hospital logo
    // Note: The logo should be in the public directory
    const logo = new Image();
    logo.src = '/hospital-logo.png';
    doc.addImage(logo, 'PNG', 20, 10, 40, 20);
  } catch (error) {
    // If logo fails to load, continue without it
    console.warn('Failed to load hospital logo:', error);
  }
  
  doc.setFontSize(18);
  doc.setTextColor(0, 100, 0); // Green color
  doc.text('ALFA SP HOSPITALS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Mikocheni Tanesco, Mwai Kibaki Rd, Dar es Salaam', 105, 30, { align: 'center' });
  doc.text('Phone: +255674404013 | Email: info@alfasphospitals.com', 105, 37, { align: 'center' });
  
  // Horizontal line
  doc.setDrawColor(0, 100, 0);
  doc.line(20, 45, 190, 45);
  
  // Document title
  doc.setFontSize(16);
  doc.setTextColor(0, 100, 0);
  doc.text('INVOICE', 105, 55, { align: 'center' });
  
  // Bill information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  const billDate = new Date(bill.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Left column - Bill info
  doc.text(`Invoice ID: INV-${bill.id}`, 20, 70);
  doc.text(`Bill ID: ${bill.id}`, 20, 77);
  doc.text(`Date Created: ${billDate}`, 20, 84);
  doc.text(`Status: ${bill.status.toUpperCase()}`, 20, 91);
  if (bill.paidAt) {
    const paidDate = new Date(bill.paidAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Paid Date: ${paidDate}`, 20, 98);
  }
  
  // Right column - Patient info
  if (patient) {
    doc.text(`Patient: ${patient.firstName} ${patient.lastName}`, 120, 70);
    doc.text(`Phone: ${patient.phone}`, 120, 77);
    doc.text(`Address: ${patient.address}`, 120, 84);
    doc.text(`Insurance: ${patient.insuranceInfo.provider || 'N/A'}`, 120, 91);
    doc.text(`Membership: ${patient.insuranceInfo.membershipNumber || 'N/A'}`, 120, 98);
  }
  
  // Services table
  const tableData = bill.items.map(item => [
    item.serviceName,
    item.category.replace('-', ' '),
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.totalPrice)
  ]);
  
  autoTable(doc, {
    startY: 110,
    head: [['Service', 'Category', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 100, 0] },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Summary section
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  
  doc.setFontSize(12);
  doc.text('Subtotal:', 150, finalY + 10);
  doc.text(formatCurrency(bill.subtotal), 180, finalY + 10, { align: 'right' });
  
  // Remove VAT line completely since it's always 0%
  
  if (bill.discount > 0) {
    doc.text('Discount:', 150, finalY + 17);
    doc.text(`-${formatCurrency(bill.discount)}`, 180, finalY + 17, { align: 'right' });
  }
  
  doc.setDrawColor(0, 0, 0);
  doc.line(140, finalY + 23, 190, finalY + 23);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', 150, finalY + 30);
  doc.text(formatCurrency(bill.total), 180, finalY + 30, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Amount in words: ' + numberToWords(bill.total) + ' Tanzanian Shillings', 20, finalY + 43);
  
  // Payment terms
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', 20, finalY + 63);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Payment is due upon receipt. Thank you for your business.', 20, finalY + 70);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing ALFA SP HOSPITALS', 105, finalY + 90, { align: 'center' });
  doc.text('This is a computer generated invoice', 105, finalY + 95, { align: 'center' });
  
  return doc;
}

/**
 * Format currency in Tanzanian Shillings
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Convert number to words
 */
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  if (num < 20) return ones[num];
  
  if (num < 100) {
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  }
  
  if (num < 1000) {
    return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + numberToWords(num % 100) : '');
  }
  
  if (num < 1000000) {
    return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
  }
  
  if (num < 1000000000) {
    return numberToWords(Math.floor(num / 1000000)) + ' Million' + (num % 1000000 !== 0 ? ' ' + numberToWords(num % 1000000) : '');
  }
  
  return num.toString();
}