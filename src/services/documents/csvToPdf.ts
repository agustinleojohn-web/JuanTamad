import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

export interface CsvToPdfOptions {
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'letter';
  fontSize: number;
  includeHeaders: boolean;
  repeatHeaderOnNewPage: boolean;
  title?: string;
}

/**
 * Parses a CSV string respecting quoted fields with commas, newlines, and quotes
 */
export function parseCsv(csvText: string, customDelimiter?: string): string[][] {
  let delimiter = customDelimiter;
  if (!delimiter) {
    // Detect delimiter from first non-empty line
    const firstLine = csvText.split('\n').find((l) => l.trim().length > 0) || '';
    const commas = (firstLine.match(/,/g) || []).length;
    const semicolons = (firstLine.match(/;/g) || []).length;
    const tabs = (firstLine.match(/\t/g) || []).length;
    if (tabs > commas && tabs > semicolons) delimiter = '\t';
    else if (semicolons > commas) delimiter = ';';
    else delimiter = ',';
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // ignore carriage return
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export async function convertCsvToPdf(
  csvContent: string,
  options: CsvToPdfOptions
): Promise<Blob> {
  const rows = parseCsv(csvContent);
  if (rows.length === 0) {
    throw new Error('CSV file is empty or contains no readable data.');
  }

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const baseSize = options.pageSize === 'letter' ? PageSizes.Letter : PageSizes.A4;
  let pageWidth = baseSize[0];
  let pageHeight = baseSize[1];

  if (options.orientation === 'landscape') {
    pageWidth = Math.max(baseSize[0], baseSize[1]);
    pageHeight = Math.min(baseSize[0], baseSize[1]);
  } else {
    pageWidth = Math.min(baseSize[0], baseSize[1]);
    pageHeight = Math.max(baseSize[0], baseSize[1]);
  }

  const margin = 30;
  const tableWidth = pageWidth - margin * 2;
  const colCount = Math.max(...rows.map((r) => r.length));
  
  if (colCount === 0) {
    throw new Error('No valid columns found in CSV.');
  }

  const colWidth = tableWidth / colCount;
  const rowHeight = options.fontSize + 10;
  const headerRowHeight = rowHeight + 4;

  const titleSpace = options.title ? 40 : 15;
  const footerSpace = 25;
  const availableHeightFirstPage = pageHeight - margin * 2 - titleSpace - footerSpace;
  const availableHeightSubsequent = pageHeight - margin * 2 - footerSpace;

  const header = options.includeHeaders ? rows[0] : null;
  const dataRows = options.includeHeaders ? rows.slice(1) : rows;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Draw title if present
  if (options.title) {
    currentPage.drawText(options.title, {
      x: margin,
      y: currentY - 14,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    currentY -= titleSpace;
  } else {
    currentY -= 10;
  }

  // Draw table header helper
  const drawTableHeader = (page: typeof currentPage, y: number) => {
    // Background
    page.drawRectangle({
      x: margin,
      y: y - headerRowHeight + 4,
      width: tableWidth,
      height: headerRowHeight,
      color: rgb(0.93, 0.95, 0.97),
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 1,
    });

    if (header) {
      for (let c = 0; c < colCount; c++) {
        const text = (header[c] || `Col ${c + 1}`).substring(0, 30);
        page.drawText(text, {
          x: margin + c * colWidth + 5,
          y: y - options.fontSize - 2,
          size: options.fontSize,
          font: fontBold,
          color: rgb(0.1, 0.15, 0.2),
        });
      }
    }
    return y - headerRowHeight;
  };

  if (header) {
    currentY = drawTableHeader(currentPage, currentY);
  }

  let pageNum = 1;

  for (let r = 0; r < dataRows.length; r++) {
    // Check if new page needed
    if (currentY - rowHeight < margin + footerSpace) {
      // Add page number to current page
      currentPage.drawText(`Page ${pageNum}`, {
        x: pageWidth / 2 - 20,
        y: margin / 2,
        size: 9,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });

      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      pageNum++;
      currentY = pageHeight - margin - 10;

      if (header && options.repeatHeaderOnNewPage) {
        currentY = drawTableHeader(currentPage, currentY);
      }
    }

    const row = dataRows[r];
    const isEven = r % 2 === 0;

    // Optional subtle alternate row background
    if (isEven) {
      currentPage.drawRectangle({
        x: margin,
        y: currentY - rowHeight + 4,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.98, 0.99, 1.0),
      });
    }

    // Row bottom border
    currentPage.drawLine({
      start: { x: margin, y: currentY - rowHeight + 4 },
      end: { x: margin + tableWidth, y: currentY - rowHeight + 4 },
      thickness: 0.5,
      color: rgb(0.88, 0.9, 0.92),
    });

    for (let c = 0; c < colCount; c++) {
      const cellText = (row[c] || '').toString();
      // Truncate to fit column width approximately
      const maxChars = Math.max(5, Math.floor(colWidth / (options.fontSize * 0.55)));
      const displayText = cellText.length > maxChars ? cellText.substring(0, maxChars - 1) + '…' : cellText;

      currentPage.drawText(displayText, {
        x: margin + c * colWidth + 5,
        y: currentY - options.fontSize - 1,
        size: options.fontSize,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15),
      });
    }

    currentY -= rowHeight;
  }

  // Draw footer on last page
  currentPage.drawText(`Page ${pageNum}`, {
    x: pageWidth / 2 - 20,
    y: margin / 2,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}
