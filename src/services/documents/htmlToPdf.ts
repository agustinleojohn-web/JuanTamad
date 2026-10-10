import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

export interface HtmlToPdfOptions {
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  margin: number;
}

export function sanitizeHtml(rawHtml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // Remove dangerous tags
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'meta'];
  dangerousTags.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  });

  // Remove inline event handlers
  const allElements = doc.querySelectorAll('*');
  allElements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('on') || attr.value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}

export async function convertHtmlToPdf(
  rawHtml: string,
  options: HtmlToPdfOptions = { pageSize: 'a4', orientation: 'portrait', margin: 40 }
): Promise<Blob> {
  const cleanHtml = sanitizeHtml(rawHtml);
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, 'text/html');

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

  const contentWidth = pageWidth - options.margin * 2;
  const footerSpace = 30;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - options.margin;
  let pageNum = 1;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY - neededHeight < options.margin + footerSpace) {
      currentPage.drawText(`Page ${pageNum}`, {
        x: pageWidth / 2 - 20,
        y: options.margin / 2,
        size: 9,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });

      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      pageNum++;
      currentY = pageHeight - options.margin;
    }
  };

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (!text) return;
      drawParagraph(text, 10, 14, fontRegular, rgb(0.15, 0.15, 0.15));
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim() || '';

      if (!text) return;

      if (tag === 'h1') {
        checkPageBreak(30);
        currentY -= 14;
        drawParagraph(text, 18, 22, fontBold, rgb(0.08, 0.1, 0.15));
        currentY -= 8;
      } else if (tag === 'h2') {
        checkPageBreak(24);
        currentY -= 10;
        drawParagraph(text, 14, 18, fontBold, rgb(0.12, 0.15, 0.2));
        currentY -= 6;
      } else if (tag === 'h3') {
        checkPageBreak(20);
        currentY -= 8;
        drawParagraph(text, 12, 16, fontBold, rgb(0.15, 0.2, 0.25));
        currentY -= 4;
      } else if (tag === 'li') {
        checkPageBreak(16);
        currentPage.drawText('•', {
          x: options.margin + 4,
          y: currentY - 10,
          size: 10,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.2),
        });
        drawParagraph(text, 10, 14, fontRegular, rgb(0.2, 0.2, 0.2), 16);
      } else if (['p', 'div', 'section', 'article'].includes(tag)) {
        checkPageBreak(16);
        drawParagraph(text, 10, 14, fontRegular, rgb(0.2, 0.2, 0.2));
        currentY -= 6;
      } else if (tag === 'ul' || tag === 'ol') {
        Array.from(el.children).forEach(processNode);
      } else {
        drawParagraph(text, 10, 14, fontRegular, rgb(0.2, 0.2, 0.2));
      }
    }
  };

  const drawParagraph = (
    text: string,
    fontSize: number,
    lineHeight: number,
    font: typeof fontRegular,
    color: ReturnType<typeof rgb>,
    indent = 0
  ) => {
    const words = text.split(' ');
    const wrapped: string[] = [];
    let currentLine = '';
    const usableWidth = contentWidth - indent;

    for (const w of words) {
      const test = currentLine ? `${currentLine} ${w}` : w;
      if (font.widthOfTextAtSize(test, fontSize) <= usableWidth) {
        currentLine = test;
      } else {
        if (currentLine) wrapped.push(currentLine);
        currentLine = w;
      }
    }
    if (currentLine) wrapped.push(currentLine);

    for (const line of wrapped) {
      checkPageBreak(lineHeight);
      currentPage.drawText(line, {
        x: options.margin + indent,
        y: currentY - fontSize,
        size: fontSize,
        font,
        color,
      });
      currentY -= lineHeight;
    }
  };

  Array.from(doc.body.childNodes).forEach(processNode);

  // Draw footer on last page
  currentPage.drawText(`Page ${pageNum}`, {
    x: pageWidth / 2 - 20,
    y: options.margin / 2,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}
