import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker URL
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  } catch (err) {
    console.warn('PDF.js worker initialization notice:', err);
  }
}

export interface RenderedPageImage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Loads a PDF Document from a File or Blob with optional password
 */
export async function loadPdfDocument(
  file: File | Blob,
  password?: string
): Promise<pdfjsLib.PDFDocumentProxy> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    password: password || '',
  });
  return await loadingTask.promise;
}

/**
 * Renders a single PDF page to a Canvas element
 */
export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale = 1.5,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not create canvas context');

  // Fill white background for PDF rendering
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvas: canvas,
    canvasContext: ctx,
    viewport: viewport,
  }).promise;

  return canvas;
}

/**
 * Converts a PDF page into an image Blob (PNG or JPEG)
 */
export async function renderPdfPageToImage(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale = 2.0,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.92
): Promise<RenderedPageImage> {
  const canvas = await renderPdfPageToCanvas(pdfDoc, pageNumber, scale);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to render page to image'))),
      format,
      format === 'image/jpeg' ? quality : undefined
    );
  });

  const dataUrl = canvas.toDataURL(format, quality);

  return {
    pageNumber,
    blob,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Generates low-res thumbnail data URLs for all pages of a PDF
 */
export async function generatePdfThumbnails(
  file: File | Blob,
  maxPages = 50,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{ pageNumber: number; dataUrl: string }>> {
  const doc = await loadPdfDocument(file);
  const total = Math.min(doc.numPages, maxPages);
  const thumbnails: Array<{ pageNumber: number; dataUrl: string }> = [];

  for (let i = 1; i <= total; i++) {
    const canvas = await renderPdfPageToCanvas(doc, i, 0.4);
    thumbnails.push({
      pageNumber: i,
      dataUrl: canvas.toDataURL('image/jpeg', 0.8),
    });
    if (onProgress) onProgress(i, total);
  }

  return thumbnails;
}
