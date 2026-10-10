import { PDFDocument, rgb, degrees, StandardFonts, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { loadPdfDocument, renderPdfPageToCanvas } from './pdfRenderer';

export interface PageNumberOptions {
  format: 'Page {n} of {total}' | '{n} / {total}' | '{n}' | 'Page {n}';
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center';
  fontSize: number;
  startOffset: number; // e.g. start counting from page 1
  skipFirstPage: boolean;
  colorHex: string;
}

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number; // 0.1 to 1.0
  angleDegrees: number; // -45, 0, 45, etc.
  colorHex: string;
}

export interface HeaderFooterOptions {
  headerLeft?: string;
  headerCenter?: string;
  headerRight?: string;
  footerLeft?: string;
  footerCenter?: string;
  footerRight?: string;
  fontSize: number;
  skipFirstPage: boolean;
}

export interface CropOptions {
  topMargin: number;
  bottomMargin: number;
  leftMargin: number;
  rightMargin: number;
}

export interface MetadataOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
}

export interface RedactionBox {
  pageNumber: number; // 1-based
  x: number; // percentage 0-100 of page width
  y: number; // percentage 0-100 of page height
  width: number;
  height: number;
}

export interface SignaturePlacement {
  pageNumber: number;
  imageDataUrl: string;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  widthPercent: number; // e.g. 20%
}

/**
 * Adds page numbers to all or selected pages of a PDF
 */
export async function addPageNumbersToPdf(
  file: File,
  options: PageNumberOptions
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const total = doc.getPageCount();

  const color = hexToRgb(options.colorHex || '#666666');

  for (let i = 0; i < total; i++) {
    if (i === 0 && options.skipFirstPage) continue;

    const pageNum = i + 1 + (options.startOffset - 1);
    const page = doc.getPage(i);
    const { width, height } = page.getSize();

    let text = options.format
      .replace('{n}', pageNum.toString())
      .replace('{total}', total.toString());

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    let x = (width - textWidth) / 2;
    let y = 25;

    if (options.position === 'bottom-right') {
      x = width - textWidth - 35;
      y = 25;
    } else if (options.position === 'bottom-left') {
      x = 35;
      y = 25;
    } else if (options.position === 'top-center') {
      x = (width - textWidth) / 2;
      y = height - 25;
    } else if (options.position === 'top-right') {
      x = width - textWidth - 35;
      y = height - 25;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color,
    });
  }

  const saved = await doc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Stamps text watermark diagonally across pages
 */
export async function watermarkPdf(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const color = hexToRgb(options.colorHex || '#ff0000');
  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = options.fontSize;

    // Centered coordinates
    const x = (width - textWidth) / 2;
    const y = (height - textHeight) / 2;

    page.drawText(options.text, {
      x,
      y,
      size: options.fontSize,
      font,
      color,
      opacity: options.opacity,
      rotate: degrees(options.angleDegrees),
    });
  }

  const saved = await doc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Adds headers and footers with macro replacements
 */
export async function addHeaderFooterToPdf(
  file: File,
  options: HeaderFooterOptions
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const total = doc.getPageCount();
  const todayStr = new Date().toLocaleDateString();

  const replaceMacros = (str: string | undefined, pageNum: number) => {
    if (!str) return '';
    return str
      .replace('{page}', pageNum.toString())
      .replace('{total}', total.toString())
      .replace('{date}', todayStr)
      .replace('{title}', file.name.replace(/\.pdf$/i, ''));
  };

  for (let i = 0; i < total; i++) {
    if (i === 0 && options.skipFirstPage) continue;
    const pageNum = i + 1;
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const margin = 35;

    // Header Left
    if (options.headerLeft) {
      page.drawText(replaceMacros(options.headerLeft, pageNum), {
        x: margin,
        y: height - 25,
        size: options.fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Header Center
    if (options.headerCenter) {
      const text = replaceMacros(options.headerCenter, pageNum);
      const textWidth = font.widthOfTextAtSize(text, options.fontSize);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: height - 25,
        size: options.fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Header Right
    if (options.headerRight) {
      const text = replaceMacros(options.headerRight, pageNum);
      const textWidth = font.widthOfTextAtSize(text, options.fontSize);
      page.drawText(text, {
        x: width - textWidth - margin,
        y: height - 25,
        size: options.fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Footer Left
    if (options.footerLeft) {
      page.drawText(replaceMacros(options.footerLeft, pageNum), {
        x: margin,
        y: 25,
        size: options.fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Footer Center
    if (options.footerCenter) {
      const text = replaceMacros(options.footerCenter, pageNum);
      const textWidth = font.widthOfTextAtSize(text, options.fontSize);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: 25,
        size: options.fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Footer Right
    if (options.footerRight) {
      const text = replaceMacros(options.footerRight, pageNum);
      const textWidth = font.widthOfTextAtSize(text, options.fontSize);
      page.drawText(text, {
        x: width - textWidth - margin,
        y: 25,
        size: options.fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
  }

  const saved = await doc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Trims margins of pages (Crop PDF)
 */
export async function cropPdf(file: File, options: CropOptions): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const newX = Math.max(0, options.leftMargin);
    const newY = Math.max(0, options.bottomMargin);
    const newWidth = Math.max(50, width - options.leftMargin - options.rightMargin);
    const newHeight = Math.max(50, height - options.topMargin - options.bottomMargin);

    page.setCropBox(newX, newY, newWidth, newHeight);
  }

  const saved = await doc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Rearranges, rotates, duplicates, or deletes pages (Organize Studio)
 */
export interface OrganizePageItem {
  originalPageNumber: number; // 1-based
  rotation: number; // degrees
}

export async function organizePdfPages(
  file: File,
  items: OrganizePageItem[]
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  for (const item of items) {
    const [copied] = await newDoc.copyPages(sourceDoc, [item.originalPageNumber - 1]);
    const currentRot = copied.getRotation().angle;
    copied.setRotation(degrees((currentRot + item.rotation) % 360));
    newDoc.addPage(copied);
  }

  const saved = await newDoc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * N-Up Handouts: Combines 2, 4, or 6 pages per physical sheet
 */
export async function createNUpHandouts(
  file: File,
  layout: 2 | 4 | 6,
  sheetSize: 'a4' | 'letter' = 'a4',
  sheetOrientation: 'landscape' | 'portrait' = 'landscape'
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const baseDimensions = sheetSize === 'letter' ? PageSizes.Letter : PageSizes.A4;
  let targetWidth = sheetOrientation === 'landscape' ? Math.max(baseDimensions[0], baseDimensions[1]) : Math.min(baseDimensions[0], baseDimensions[1]);
  let targetHeight = sheetOrientation === 'landscape' ? Math.min(baseDimensions[0], baseDimensions[1]) : Math.max(baseDimensions[0], baseDimensions[1]);

  const totalSourcePages = sourceDoc.getPageCount();
  const cols = layout === 2 ? 2 : layout === 4 ? 2 : 3;
  const rows = layout === 2 ? 1 : 2;
  const pagesPerSheet = cols * rows;

  const margin = 20;
  const cellWidth = (targetWidth - margin * (cols + 1)) / cols;
  const cellHeight = (targetHeight - margin * (rows + 1)) / rows;

  for (let sheetIdx = 0; sheetIdx < Math.ceil(totalSourcePages / pagesPerSheet); sheetIdx++) {
    const sheet = newDoc.addPage([targetWidth, targetHeight]);

    for (let slot = 0; slot < pagesPerSheet; slot++) {
      const pageIndex = sheetIdx * pagesPerSheet + slot;
      if (pageIndex >= totalSourcePages) break;

      const [embedded] = await newDoc.embedPages([sourceDoc.getPage(pageIndex)]);
      const { width: origW, height: origH } = embedded;

      // Fit into cell
      const scale = Math.min(cellWidth / origW, cellHeight / origH);
      const drawW = origW * scale;
      const drawH = origH * scale;

      const colIdx = slot % cols;
      const rowIdx = Math.floor(slot / cols);

      const cellX = margin + colIdx * (cellWidth + margin);
      // PDF Y starts from bottom
      const cellY = targetHeight - margin - (rowIdx + 1) * cellHeight - rowIdx * margin;

      const posX = cellX + (cellWidth - drawW) / 2;
      const posY = cellY + (cellHeight - drawH) / 2;

      // Draw subtle page box border
      sheet.drawRectangle({
        x: cellX,
        y: cellY,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 0.5,
        color: rgb(0.99, 0.99, 0.99),
      });

      sheet.drawPage(embedded, {
        x: posX,
        y: posY,
        width: drawW,
        height: drawH,
      });
    }
  }

  const saved = await newDoc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Burns blackout redaction boxes permanently onto PDF
 */
export async function redactPdf(
  file: File,
  redactions: RedactionBox[]
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  for (const red of redactions) {
    if (red.pageNumber > doc.getPageCount()) continue;
    const page = doc.getPage(red.pageNumber - 1);
    const { width, height } = page.getSize();

    const x = (red.x / 100) * width;
    const y = height - (red.y / 100) * height - (red.height / 100) * height;
    const w = (red.width / 100) * width;
    const h = (red.height / 100) * height;

    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      color: rgb(0, 0, 0),
    });
  }

  const saved = await doc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Stamps handwritten or typed signature onto a PDF page
 */
export async function stampSignatureOnPdf(
  file: File,
  placement: SignaturePlacement
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  const page = doc.getPage(placement.pageNumber - 1);
  const { width, height } = page.getSize();

  // Convert dataUrl to PNG buffer
  const res = await fetch(placement.imageDataUrl);
  const pngArray = await res.arrayBuffer();
  const pngImage = await doc.embedPng(pngArray);

  const drawWidth = (placement.widthPercent / 100) * width;
  const drawHeight = (pngImage.height / pngImage.width) * drawWidth;

  const posX = (placement.xPercent / 100) * width;
  const posY = height - (placement.yPercent / 100) * height - drawHeight;

  page.drawImage(pngImage, {
    x: posX,
    y: posY,
    width: drawWidth,
    height: drawHeight,
  });

  const saved = await doc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Flattens AcroForm fields and annotations into static un-editable pages
 */
export async function flattenPdf(file: File): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  try {
    const form = doc.getForm();
    form.flatten();
  } catch {
    // No AcroForm present, proceed to serialize
  }

  const saved = await doc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Inspects and populates AcroForm interactive fields
 */
export async function inspectAndFillPdfForm(
  file: File,
  fieldValues?: Record<string, string | boolean>
): Promise<{ fields: Array<{ name: string; type: string; value: string }>; blob?: Blob }> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = doc.getForm();
  const formFields = form.getFields();

  const fieldList: Array<{ name: string; type: string; value: string }> = [];

  for (const f of formFields) {
    const name = f.getName();
    const type = f.constructor.name;
    let val = '';
    try {
      if ('getText' in f && typeof (f as any).getText === 'function') {
        val = (f as any).getText() || '';
      }
    } catch {}
    fieldList.push({ name, type, value: val });

    // If filling values
    if (fieldValues && fieldValues[name] !== undefined) {
      try {
        if ('setText' in f && typeof (f as any).setText === 'function') {
          (f as any).setText(fieldValues[name].toString());
        } else if ('check' in f && typeof (f as any).check === 'function') {
          if (fieldValues[name]) (f as any).check();
          else (f as any).uncheck();
        }
      } catch (err) {
        console.warn(`Could not set value on field ${name}:`, err);
      }
    }
  }

  let resultBlob: Blob | undefined;
  if (fieldValues) {
    const saved = await doc.save();
    resultBlob = new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
  }

  return { fields: fieldList, blob: resultBlob };
}

/**
 * Reads and updates PDF metadata properties
 */
export async function updatePdfProperties(
  file: File,
  metadata: MetadataOptions
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  if (metadata.title !== undefined) doc.setTitle(metadata.title);
  if (metadata.author !== undefined) doc.setAuthor(metadata.author);
  if (metadata.subject !== undefined) doc.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) doc.setKeywords(metadata.keywords);
  if (metadata.creator !== undefined) doc.setCreator(metadata.creator);
  if (metadata.producer !== undefined) doc.setProducer(metadata.producer);

  const saved = await doc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

export async function readPdfProperties(file: File): Promise<MetadataOptions> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return {
    title: doc.getTitle() || '',
    author: doc.getAuthor() || '',
    subject: doc.getSubject() || '',
    keywords: doc.getKeywords() ? doc.getKeywords()?.split(' ') : [],
    creator: doc.getCreator() || '',
    producer: doc.getProducer() || '',
  };
}

/**
 * Extracts raw textual content from all pages of a PDF
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const doc = await loadPdfDocument(file);
  let fullText = '';

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageStrings = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter((s: string) => s.length > 0);

    fullText += `=== Page ${i} ===\n\n${pageStrings.join(' ')}\n\n`;
  }

  return fullText.trim();
}

/**
 * Reconstructs broken byte streams and rebuilds xref tables (Repair PDF)
 */
export async function repairPdf(file: File): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  // Permissive load bypassing encryption and repairing dictionary references
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    throwOnInvalidObject: false,
  });

  const saved = await doc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Detects if a PDF is encrypted or password-protected
 */
export async function checkIfPdfIsEncrypted(
  file: File
): Promise<{ isEncrypted: boolean; needsPassword: boolean; isOwnerProtectedOnly: boolean }> {
  const arrayBuffer = await file.arrayBuffer();

  // Test 1: Check with PDF-Lib if document has encryption dictionary
  let pdfLibEncrypted = false;
  try {
    await PDFDocument.load(arrayBuffer.slice(0));
  } catch (err: any) {
    const msg = (err.message || '').toLowerCase();
    if (err.name === 'EncryptedPDFError' || msg.includes('encrypt') || msg.includes('password')) {
      pdfLibEncrypted = true;
    }
  }

  // Test 2: Check with PDF.js whether it can be opened with blank password
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer.slice(0)),
      password: '',
    });
    await loadingTask.promise;
    // PDF.js opened with blank password
    if (pdfLibEncrypted) {
      // It has OWNER encryption / permissions restrictions, but open password is blank
      return { isEncrypted: true, needsPassword: false, isOwnerProtectedOnly: true };
    }
    return { isEncrypted: false, needsPassword: false, isOwnerProtectedOnly: false };
  } catch (err: any) {
    if (err.name === 'PasswordException' || (err.message || '').toLowerCase().includes('password')) {
      return { isEncrypted: true, needsPassword: true, isOwnerProtectedOnly: false };
    }
    return { isEncrypted: pdfLibEncrypted, needsPassword: false, isOwnerProtectedOnly: false };
  }
}

/**
 * Removes password restriction and fully decrypts PDF using PDF.js + PDF-Lib
 */
export async function unlockPdf(
  file: File,
  password?: string,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(0, 100, 'Initializing decryption engine...');

  // 1. Try opening with PDF.js passing the user-supplied password or empty string
  let pdfDoc: pdfjsLib.PDFDocumentProxy;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer.slice(0)),
      password: password || '',
    });
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    if (err.name === 'PasswordException' || (err.message || '').toLowerCase().includes('password')) {
      throw new Error(
        password
          ? 'Incorrect password. Please verify the passphrase and try again.'
          : 'This PDF is protected with an open password. Please enter the password to decrypt.'
      );
    }
    throw new Error(`Failed to decrypt PDF: ${err.message}`);
  }

  const totalPages = pdfDoc.numPages;
  onProgress?.(1, totalPages, `Decrypted document metadata. Processing ${totalPages} pages...`);

  // Create clean, unencrypted PDF using PDF-Lib
  const newDoc = await PDFDocument.create();

  // Render each decrypted page and embed cleanly
  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(i, totalPages, `Rebuilding unlocked page ${i} of ${totalPages}...`);
    // Yield to browser event loop
    await new Promise((r) => setTimeout(r, 10));

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) continue;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvas: canvas,
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    // Use JPEG 0.94 for rapid encoding and minimal memory consumption
    const imgBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.94)
    );
    const imgBytes = await imgBlob.arrayBuffer();
    const embeddedImg = await newDoc.embedJpg(imgBytes);

    const origViewport = page.getViewport({ scale: 1.0 });
    const newPage = newDoc.addPage([origViewport.width, origViewport.height]);
    newPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });

    // Clean canvas references
    canvas.width = 1;
    canvas.height = 1;
  }

  onProgress?.(totalPages, totalPages, 'Finalizing unencrypted PDF document...');
  const saved = await newDoc.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Converts PDF into a formatted Word (.doc) document that opens in Word / Docs
 */
export async function convertPdfToWordDoc(file: File): Promise<Blob> {
  const doc = await loadPdfDocument(file);
  let htmlBody = '';

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter(Boolean);

    htmlBody += `<div class="page" style="page-break-after: always; padding: 20px;">`;
    htmlBody += `<h3 style="color: #666; font-size: 11pt; border-bottom: 1px solid #ddd; padding-bottom: 4px;">Page ${i}</h3>`;
    htmlBody += `<p style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #222;">`;
    htmlBody += strings.join(' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    htmlBody += `</p></div>`;
  }

  const wordDocumentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${file.name.replace(/\.pdf$/i, '')}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; }
      </style>
    </head>
    <body>
      ${htmlBody}
    </body>
    </html>
  `;

  return new Blob([wordDocumentHtml], {
    type: 'application/msword',
  });
}

/**
 * Converts PDF to Monochrome Grayscale or Inverted Dark Mode
 */
export async function transformPdfColors(
  file: File,
  mode: 'grayscale' | 'dark-mode'
): Promise<Blob> {
  const doc = await loadPdfDocument(file);
  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= doc.numPages; i++) {
    const canvas = await renderPdfPageToCanvas(doc, i, 1.5);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let p = 0; p < data.length; p += 4) {
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];

      if (mode === 'grayscale') {
        const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
        data[p] = gray;
        data[p + 1] = gray;
        data[p + 2] = gray;
      } else if (mode === 'dark-mode') {
        data[p] = 255 - r;
        data[p + 1] = 255 - g;
        data[p + 2] = 255 - b;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const pngBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/png')
    );
    const pngBytes = await pngBlob.arrayBuffer();
    const embeddedImg = await newPdf.embedPng(pngBytes);

    const page = newPdf.addPage([canvas.width / 1.5, canvas.height / 1.5]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: canvas.width / 1.5,
      height: canvas.height / 1.5,
    });
  }

  const saved = await newPdf.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Compresses PDF by re-rasterizing and optimizing embedded images
 */
export async function compressPdf(
  file: File,
  qualityPercent: number = 70,
  scale: number = 1.2
): Promise<Blob> {
  const doc = await loadPdfDocument(file);
  const newPdf = await PDFDocument.create();
  const q = Math.max(0.1, Math.min(1.0, qualityPercent / 100));

  for (let i = 1; i <= doc.numPages; i++) {
    const canvas = await renderPdfPageToCanvas(doc, i, scale);
    const jpegBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', q)
    );
    const jpegBytes = await jpegBlob.arrayBuffer();
    const embeddedJpeg = await newPdf.embedJpg(jpegBytes);

    const page = newPdf.addPage([canvas.width / scale, canvas.height / scale]);
    page.drawImage(embeddedJpeg, {
      x: 0,
      y: 0,
      width: canvas.width / scale,
      height: canvas.height / scale,
    });
  }

  const saved = await newPdf.save();
  return new Blob([saved as unknown as BlobPart], { type: 'application/pdf' });
}

function hexToRgb(hex: string) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}
