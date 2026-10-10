import mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

export interface DocxToPdfOptions {
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  margin: number;
}

interface ParsedBlock {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'li';
  text: string;
}

export async function convertDocxToPdf(
  file: File | Blob,
  options: DocxToPdfOptions = { pageSize: 'a4', orientation: 'portrait', margin: 40 }
): Promise<{ blob: Blob; messages: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Convert docx to HTML locally via mammoth
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;
  const messages = result.messages.map((m) => m.message);

  // Parse HTML string into structured content blocks
  const blocks = parseHtmlToBlocks(html);

  // Generate PDF from structured blocks
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
      // Draw footer on current page
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

  for (const block of blocks) {
    if (!block.text.trim()) continue;

    let fontSize = 11;
    let lineHeight = 16;
    let font = fontRegular;
    let color = rgb(0.15, 0.15, 0.15);
    let indent = 0;
    let spaceBefore = 8;
    let spaceAfter = 4;

    if (block.type === 'h1') {
      fontSize = 18;
      lineHeight = 22;
      font = fontBold;
      color = rgb(0.08, 0.1, 0.15);
      spaceBefore = 16;
      spaceAfter = 8;
    } else if (block.type === 'h2') {
      fontSize = 14;
      lineHeight = 18;
      font = fontBold;
      color = rgb(0.1, 0.15, 0.2);
      spaceBefore = 12;
      spaceAfter = 6;
    } else if (block.type === 'h3') {
      fontSize = 12;
      lineHeight = 16;
      font = fontBold;
      color = rgb(0.15, 0.2, 0.25);
      spaceBefore = 10;
      spaceAfter = 4;
    } else if (block.type === 'li') {
      indent = 16;
      spaceBefore = 2;
      spaceAfter = 2;
    }

    // Split text into wrapped lines
    const words = block.text.split(' ');
    const wrappedLines: string[] = [];
    let currentLine = '';
    const usableWidth = contentWidth - indent;

    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(test, fontSize);
      if (textWidth <= usableWidth) {
        currentLine = test;
      } else {
        if (currentLine) wrappedLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) wrappedLines.push(currentLine);

    // Check space before
    checkPageBreak(spaceBefore + lineHeight);
    currentY -= spaceBefore;

    // Draw bullet symbol if li
    if (block.type === 'li') {
      currentPage.drawText('•', {
        x: options.margin + 4,
        y: currentY - fontSize,
        size: fontSize,
        font: fontRegular,
        color,
      });
    }

    // Draw lines
    for (let l = 0; l < wrappedLines.length; l++) {
      checkPageBreak(lineHeight);
      currentPage.drawText(wrappedLines[l], {
        x: options.margin + indent,
        y: currentY - fontSize,
        size: fontSize,
        font,
        color,
      });
      currentY -= lineHeight;
    }

    currentY -= spaceAfter;
  }

  // Draw footer on last page
  currentPage.drawText(`Page ${pageNum}`, {
    x: pageWidth / 2 - 20,
    y: options.margin / 2,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return {
    blob: new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }),
    messages,
  };
}

function parseHtmlToBlocks(html: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const div = document.createElement('div');
  div.innerHTML = html;

  // Walk child nodes
  Array.from(div.children).forEach((node) => {
    const tagName = node.tagName.toLowerCase();
    const text = node.textContent?.trim() || '';
    if (!text) return;

    if (tagName === 'h1') {
      blocks.push({ type: 'h1', text });
    } else if (tagName === 'h2') {
      blocks.push({ type: 'h2', text });
    } else if (tagName === 'h3') {
      blocks.push({ type: 'h3', text });
    } else if (tagName === 'ul' || tagName === 'ol') {
      Array.from(node.children).forEach((li) => {
        const liText = li.textContent?.trim() || '';
        if (liText) blocks.push({ type: 'li', text: liText });
      });
    } else {
      blocks.push({ type: 'p', text });
    }
  });

  // Fallback if no children (e.g. raw text without tags)
  if (blocks.length === 0 && div.textContent?.trim()) {
    div.textContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed) blocks.push({ type: 'p', text: trimmed });
    });
  }

  return blocks;
}
