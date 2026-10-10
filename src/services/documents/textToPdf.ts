import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

export interface TextToPdfOptions {
  fontSize: number; // e.g. 11
  lineHeight: number; // e.g. 14
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  margin: number; // e.g. 40
  includePageNumbers: boolean;
}

export async function convertTextToPdf(
  textContent: string,
  options: TextToPdfOptions
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

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

  const contentWidth = pageWidth - options.margin * 2;
  const contentHeight = pageHeight - options.margin * 2;

  // Split text into lines, handling paragraph breaks and wrapping
  const rawLines = textContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const wrappedLines: string[] = [];

  for (const rawLine of rawLines) {
    if (rawLine.trim() === '') {
      wrappedLines.push('');
      continue;
    }

    const words = rawLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, options.fontSize);

      if (textWidth <= contentWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          // Word itself is longer than contentWidth, break word
          wrappedLines.push(word);
          currentLine = '';
        }
      }
    }

    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  // Calculate lines per page
  const footerSpace = options.includePageNumbers ? 25 : 0;
  const usableHeight = contentHeight - footerSpace;
  const linesPerPage = Math.max(1, Math.floor(usableHeight / options.lineHeight));

  const totalPages = Math.ceil(wrappedLines.length / linesPerPage) || 1;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const startLine = pageIdx * linesPerPage;
    const endLine = Math.min(startLine + linesPerPage, wrappedLines.length);

    let y = pageHeight - options.margin - options.fontSize;

    for (let l = startLine; l < endLine; l++) {
      const lineText = wrappedLines[l];
      if (lineText) {
        page.drawText(lineText, {
          x: options.margin,
          y,
          size: options.fontSize,
          font,
          color: rgb(0.12, 0.14, 0.17),
        });
      }
      y -= options.lineHeight;
    }

    if (options.includePageNumbers) {
      const pageNumberStr = `Page ${pageIdx + 1} of ${totalPages}`;
      const numWidth = font.widthOfTextAtSize(pageNumberStr, 9);
      page.drawText(pageNumberStr, {
        x: (pageWidth - numWidth) / 2,
        y: options.margin / 2,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}
