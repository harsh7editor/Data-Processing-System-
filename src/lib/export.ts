import type { DataRow, DataColumn } from '@/types/data';

export function exportToCSV(rows: DataRow[], columns: DataColumn[], filename: string) {
  if (rows.length === 0) return;
  
  const headers = columns.map(col => col.name).join(',');
  const csvRows = rows.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  const csvContent = [headers, ...csvRows].join('\n');
  downloadFile(csvContent, `${filename.replace(/\.[^/.]+$/, '')}_processed.csv`, 'text/csv');
}

export function exportToJSON(rows: DataRow[], filename: string) {
  const jsonContent = JSON.stringify(rows, null, 2);
  downloadFile(jsonContent, `${filename.replace(/\.[^/.]+$/, '')}_processed.json`, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
