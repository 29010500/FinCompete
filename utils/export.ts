import { FinancialMetrics } from "../types";

// Declare jsPDF types as they are loaded from CDN
declare const jspdf: any;

const HEADERS = [
  { header: 'Company', key: 'name' },
  { header: 'Ticker', key: 'ticker' },
  { header: 'Price', key: 'price' },
  { header: 'Market Cap', key: 'marketCap' },
  { header: 'ROE', key: 'roe' },
  { header: 'ROIC', key: 'roic' },
  { header: 'EV/EBIT', key: 'evEbit' },
  { header: 'P/E', key: 'per' },
  { header: 'FCF/Share', key: 'fcfPerShare' },
  { header: 'Beta', key: 'beta' },
  { header: 'Ke', key: 'ke' },
  { header: 'Kd', key: 'kd' },
  { header: 'WACC', key: 'wacc' },
];

export const downloadCSV = (data: FinancialMetrics[], filename = 'financial_analysis.csv') => {
  const csvRows = [];
  
  // Header row
  csvRows.push(HEADERS.map(h => h.header).join(','));

  // Data rows
  data.forEach(row => {
    const values = HEADERS.map(header => {
      const val = row[header.key as keyof FinancialMetrics] || '-';
      // Escape quotes and wrap in quotes to handle commas in values
      const escaped = ('' + val).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const downloadPDF = (data: FinancialMetrics[], title = 'Financial Competitor Analysis') => {
  if (typeof jspdf === 'undefined') {
    alert("PDF generation library is loading. Please try again in a moment.");
    return;
  }

  const { jsPDF } = jspdf;
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape, millimeters, A4

  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

  // Table
  const tableColumn = HEADERS.map(h => h.header);
  const tableRows = data.map(row => 
    HEADERS.map(header => row[header.key as keyof FinancialMetrics] || '-')
  );

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
  });

  doc.save('financial_analysis.pdf');
};
