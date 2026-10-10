import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { loadPdfDocument, renderPdfPageToImage } from '../../services/pdf/pdfRenderer';
import { runOcrOnImage, type OcrLanguage } from '../../services/pdf/pdfOcrService';
import { formatFileSize } from '../../utils/fileSize';
import { downloadBlob } from '../../utils/download';

const LANGUAGES: { id: OcrLanguage; label: string }[] = [
  { id: 'eng', label: 'English' },
  { id: 'fil', label: 'Filipino' },
  { id: 'eng+fil', label: 'English + Filipino' },
];

export const PdfOcrPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [lang, setLang] = useState<OcrLanguage>('eng');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setError(null);
    setExtractedText('');

    try {
      const doc = await loadPdfDocument(f);
      setTotalPages(doc.numPages);
      setCurrentPage(1);

      const img = await renderPdfPageToImage(doc, 1, 1.5, 'image/png');
      setPagePreviewUrl(img.dataUrl);
    } catch (err: any) {
      setError('Could not load PDF document preview.');
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (!file) return;
    setCurrentPage(newPage);
    setExtractedText('');
    try {
      const doc = await loadPdfDocument(file);
      const img = await renderPdfPageToImage(doc, newPage, 1.5, 'image/png');
      setPagePreviewUrl(img.dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunOcr = async () => {
    if (!file || !pagePreviewUrl) return;
    setIsProcessing(true);
    setError(null);
    setOcrProgress(0);

    try {
      const text = await runOcrOnImage(pagePreviewUrl, lang, (p) => {
        if (p.status === 'recognizing text') setOcrProgress(p.progress);
      });
      setExtractedText(text || 'No text detected on this page.');
    } catch (err: any) {
      setError(err.message || 'OCR extraction failed. The on-device engine may still be downloading its language model — please try again in a moment.');
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    const blob = new Blob([extractedText], { type: 'text/plain' });
    downloadBlob(blob, `${base}-ocr-page-${currentPage}.txt`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>On-Device OCR Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          OCR PDF &amp; Document Reader
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Transcribe text from scanned documents and images using Tesseract OCR, running entirely in your browser via WebAssembly — nothing is ever uploaded.
        </p>
      </motion.div>

      <PrivacyNotice toolName="OCR PDF" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop scanned PDF here for OCR"
          description="Extract text from scanned pages directly on your device"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Page {currentPage} of {totalPages} • {formatFileSize(file.size)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1 || isProcessing}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                p. {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages || isProcessing}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-30"
              >
                Next
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setPagePreviewUrl('');
                  setExtractedText('');
                }}
                className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1 pl-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Change file</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Language:</span>
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  lang === l.id
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[var(--accent-text)]/50'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="border border-slate-200 dark:border-[#27272A] rounded-xl p-3 bg-slate-50 dark:bg-[#000000] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Page {currentPage} Image</span>
                <span className="text-[11px] text-[var(--accent-text)]">High-Res Raster</span>
              </div>
              <div className="h-96 flex items-center justify-center overflow-auto rounded bg-white dark:bg-[#09090B] p-2 border border-slate-100 dark:border-[#27272A]">
                {pagePreviewUrl ? (
                  <img
                    src={pagePreviewUrl}
                    alt={`Page ${currentPage}`}
                    className="max-w-full max-h-full object-contain shadow-sm"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Loading page...</span>
                )}
              </div>
            </div>

            <div className="border border-slate-200 dark:border-[#27272A] rounded-xl p-3 bg-slate-50 dark:bg-[#000000] flex flex-col justify-between h-[430px]">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  <span>Extracted Text</span>
                  {extractedText && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCopy}
                        className="text-[var(--accent-text)] hover:underline flex items-center space-x-1"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={handleDownloadTxt}
                        className="text-slate-600 dark:text-slate-300 hover:underline flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export .TXT</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-72 overflow-y-auto p-3 rounded-lg bg-white dark:bg-[#09090B] border border-slate-100 dark:border-[#27272A] text-xs font-mono text-[#27272A] dark:text-slate-200 whitespace-pre-wrap">
                  {extractedText ? (
                    extractedText
                  ) : (
                    <span className="text-slate-400 italic">
                      Click "Run OCR" below to transcribe this page's content on your device...
                    </span>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-start space-x-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleRunOcr}
                disabled={isProcessing || !pagePreviewUrl}
                className="w-full mt-3 py-3 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
              >
                <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>
                  {isProcessing
                    ? `Reading page... ${Math.round(ocrProgress * 100)}%`
                    : `Run OCR on Page ${currentPage}`}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
