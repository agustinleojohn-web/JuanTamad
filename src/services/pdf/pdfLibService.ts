import { PDFDocument, rgb, degrees, PageSizes } from 'pdf-lib';

export interface ImageToPdfOptions {
  pageSize: 'a4' | 'letter' | 'fit';
  orientation: 'portrait' | 'landscape';
  margin: number; // in points (e.g. 20)
  imageLayout: 'fit' | 'fill';
}

export const PAGE_SIZE_POINTS = {
  a4: PageSizes.A4, // [595.28, 841.89]
  letter: PageSizes.Letter, // [612.0, 792.0]
};

export async function convertImagesToPdf(
  images: Array<{ file: File | Blob; name: string }>,
  options: ImageToPdfOptions
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const { file } of images) {
    const arrayBuffer = await file.arrayBuffer();
    const type = file.type.toLowerCase();
    
    let embeddedImage;
    if (type.includes('png')) {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else if (type.includes('jpeg') || type.includes('jpg')) {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    } else {
      // For WebP or other formats, convert to PNG on canvas first then embed
      const pngBuffer = await convertBlobToPngBuffer(file);
      embeddedImage = await pdfDoc.embedPng(pngBuffer);
    }

    const { width: imgWidth, height: imgHeight } = embeddedImage;

    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'fit') {
      pageWidth = imgWidth + options.margin * 2;
      pageHeight = imgHeight + options.margin * 2;
    } else {
      const baseDimensions = PAGE_SIZE_POINTS[options.pageSize];
      if (options.orientation === 'landscape') {
        pageWidth = Math.max(baseDimensions[0], baseDimensions[1]);
        pageHeight = Math.min(baseDimensions[0], baseDimensions[1]);
      } else {
        pageWidth = Math.min(baseDimensions[0], baseDimensions[1]);
        pageHeight = Math.max(baseDimensions[0], baseDimensions[1]);
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const availableWidth = pageWidth - options.margin * 2;
    const availableHeight = pageHeight - options.margin * 2;

    const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = options.margin + (availableWidth - drawWidth) / 2;
    const y = options.margin + (availableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}

async function convertBlobToPngBuffer(file: File | Blob): Promise<ArrayBuffer> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  URL.revokeObjectURL(url);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');
  ctx.drawImage(img, 0, 0);

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG conversion failed'))), 'image/png');
  });

  return await pngBlob.arrayBuffer();
}

/**
 * Merges multiple PDF files into one
 */
export async function mergePdfs(pdfFiles: File[]): Promise<Blob> {
  if (pdfFiles.length === 0) {
    throw new Error('At least one PDF file is required to merge');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const fileBytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  return new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Splits a PDF file into pages or page ranges
 */
export async function splitPdf(
  pdfFile: File,
  pageIndicesToExtract: number[][] // array of page number arrays (1-based)
): Promise<Array<{ name: string; blob: Blob }>> {
  const fileBytes = await pdfFile.arrayBuffer();
  const sourceDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  const totalPages = sourceDoc.getPageCount();

  const results: Array<{ name: string; blob: Blob }> = [];
  const baseName = pdfFile.name.replace(/\.pdf$/i, '');

  for (let i = 0; i < pageIndicesToExtract.length; i++) {
    const range = pageIndicesToExtract[i];
    // Filter valid 0-based indices
    const zeroBased = range
      .map((p) => p - 1)
      .filter((p) => p >= 0 && p < totalPages);

    if (zeroBased.length === 0) continue;

    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(sourceDoc, zeroBased);
    copied.forEach((p) => newDoc.addPage(p));

    const bytes = await newDoc.save();
    const rangeName =
      range.length === 1
        ? `page-${range[0]}`
        : `pages-${range[0]}-to-${range[range.length - 1]}`;

    results.push({
      name: `${baseName}-${rangeName}.pdf`,
      blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
    });
  }

  return results;
}

/**
 * Extracts specific pages from a PDF and returns a new PDF
 */
export async function extractPdfPages(
  pdfFile: File,
  pageNumbers: number[] // 1-based indices
): Promise<Blob> {
  const fileBytes = await pdfFile.arrayBuffer();
  const sourceDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  const totalPages = sourceDoc.getPageCount();

  const zeroBased = pageNumbers
    .map((p) => p - 1)
    .filter((p) => p >= 0 && p < totalPages);

  if (zeroBased.length === 0) {
    throw new Error('No valid pages selected for extraction');
  }

  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(sourceDoc, zeroBased);
  copied.forEach((p) => newDoc.addPage(p));

  const bytes = await newDoc.save();
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Rotates specific pages or all pages of a PDF by a given angle (90, 180, 270)
 */
export async function rotatePdfPages(
  pdfFile: File,
  pageRotations: Record<number, number> // 1-based page index -> angle delta (90, 180, 270)
): Promise<Blob> {
  const fileBytes = await pdfFile.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  const pages = doc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const pageNum = i + 1;
    const delta = pageRotations[pageNum];
    if (delta && delta !== 0) {
      const page = pages[i];
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + delta) % 360;
      page.setRotation(degrees(newRotation));
    }
  }

  const bytes = await doc.save();
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}

export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}
