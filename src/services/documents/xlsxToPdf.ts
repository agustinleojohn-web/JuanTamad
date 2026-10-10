import * as XLSX from 'xlsx';
import { convertCsvToPdf, CsvToPdfOptions } from './csvToPdf';

export interface WorkbookInfo {
  sheetNames: string[];
  activeSheet: string;
}

export function readSpreadsheetSheets(arrayBuffer: ArrayBuffer): WorkbookInfo {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  return {
    sheetNames: workbook.SheetNames,
    activeSheet: workbook.SheetNames[0] || 'Sheet1',
  };
}

export function getSheetPreview(
  arrayBuffer: ArrayBuffer,
  sheetName: string,
  maxRows = 10
): string[][] {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
  return rows.slice(0, maxRows) as string[][];
}

export async function convertXlsxToPdf(
  arrayBuffer: ArrayBuffer,
  sheetName: string,
  options: Omit<CsvToPdfOptions, 'title'> & { title?: string }
): Promise<Blob> {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in spreadsheet`);
  }

  // Convert worksheet to CSV string
  const csvString = XLSX.utils.sheet_to_csv(sheet);
  if (!csvString || csvString.trim().length === 0) {
    throw new Error(`Sheet "${sheetName}" has no data rows.`);
  }

  return convertCsvToPdf(csvString, {
    ...options,
    title: options.title || sheetName,
  });
}
