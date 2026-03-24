import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Payment } from '../types';

export const generateInvoice = (payment: Payment) => {
  const doc = new jsPDF();

  // Add Gym Logo/Name
  doc.setFontSize(22);
  doc.setTextColor(249, 115, 22); // Orange 500
  doc.text('VIBRANT GYM', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('123 Fitness Street, Health City, IN 560001', 105, 28, { align: 'center' });
  doc.text('Contact: +91 98765 43210 | Email: support@vibrantgym.com', 105, 33, { align: 'center' });

  // Invoice Header
  doc.setDrawColor(200);
  doc.line(20, 40, 190, 40);
  
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('INVOICE', 20, 50);
  
  doc.setFontSize(10);
  doc.text(`Invoice No: ${payment.id}`, 140, 50);
  doc.text(`Date: ${payment.date}`, 140, 55);

  // Bill To
  doc.setFontSize(12);
  doc.text('BILL TO:', 20, 70);
  doc.setFontSize(10);
  doc.text(payment.memberName, 20, 77);
  doc.text('Gym Member', 20, 82);

  // Table
  (doc as any).autoTable({
    startY: 95,
    head: [['Description', 'Plan', 'Amount']],
    body: [
      ['Gym Membership Subscription', payment.planName, `INR ${payment.amount.toLocaleString('en-IN')}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] }, // Orange 500
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Summary
  doc.text('Subtotal:', 140, finalY + 10);
  doc.text(`INR ${payment.amount.toLocaleString('en-IN')}`, 170, finalY + 10, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, finalY + 20);
  doc.text(`INR ${payment.amount.toLocaleString('en-IN')}`, 170, finalY + 20, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Thank you for choosing Vibrant Gym!', 105, finalY + 40, { align: 'center' });
  doc.text('This is a computer-generated invoice.', 105, finalY + 45, { align: 'center' });

  // Save the PDF
  doc.save(`Invoice_${payment.id}.pdf`);
};
