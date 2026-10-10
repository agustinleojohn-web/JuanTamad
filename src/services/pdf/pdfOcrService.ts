import { createWorker, type Worker, PSM } from 'tesseract.js';
import { renderPdfPageToImage } from './pdfRenderer';
import type * as pdfjsLib from 'pdfjs-dist';

export type OcrLanguage = 'eng' | 'fil' | 'eng+fil';

export interface OcrProgress {
  status: string;
  progress: number; // 0..1
}

let sharedWorker: Worker | null = null;
let sharedWorkerLang: OcrLanguage | null = null;

/**
 * Lazily creates (or reuses) a Tesseract.js worker. Model data is fetched
 * once from the CDN on first use and cached by the browser afterwards; all
 * recognition work runs locally in a Web Worker via WebAssembly — nothing is
 * ever uploaded to a server.
 */
async function getWorker(lang: OcrLanguage, onProgress?: (p: OcrProgress) => void): Promise<Worker> {
  if (sharedWorker && sharedWorkerLang === lang) return sharedWorker;
  if (sharedWorker) {
    await sharedWorker.terminate();
    sharedWorker = null;
  }

  const worker = await createWorker(lang, 1, {
    logger: (m) => {
      if (onProgress && typeof m.progress === 'number') {
        onProgress({ status: m.status, progress: m.progress });
      }
    },
  });

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
  });

  sharedWorker = worker;
  sharedWorkerLang = lang;
  return worker;
}

/**
 * Runs OCR on a single already-rendered page image (data URL / blob URL).
 */
export async function runOcrOnImage(
  imageSource: string | Blob,
  lang: OcrLanguage = 'eng',
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  const worker = await getWorker(lang, onProgress);
  const { data } = await worker.recognize(imageSource);
  return (data.text || '').trim();
}

/**
 * Runs OCR on one page of a loaded PDF.js document, rendering it to a
 * high-resolution raster first for better accuracy.
 */
export async function runOcrOnPdfPage(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  lang: OcrLanguage = 'eng',
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  const { dataUrl } = await renderPdfPageToImage(pdfDoc, pageNumber, 2.5, 'image/png');
  return runOcrOnImage(dataUrl, lang, onProgress);
}

/**
 * Runs OCR across every page of a PDF document, reporting page-level
 * progress via onPageProgress.
 */
export async function runOcrOnPdf(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  lang: OcrLanguage = 'eng',
  onPageProgress?: (current: number, total: number, pageText: string) => void
): Promise<string> {
  const total = pdfDoc.numPages;
  const pages: string[] = [];

  for (let i = 1; i <= total; i++) {
    const text = await runOcrOnPdfPage(pdfDoc, i, lang);
    pages.push(`=== Page ${i} ===\n\n${text}`);
    onPageProgress?.(i, total, text);
  }

  return pages.join('\n\n');
}

/** Frees the shared Tesseract worker and its WASM memory. */
export async function terminateOcrWorker(): Promise<void> {
  if (sharedWorker) {
    await sharedWorker.terminate();
    sharedWorker = null;
    sharedWorkerLang = null;
  }
}
