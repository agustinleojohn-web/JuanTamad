import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { loadPdfDocument, renderPdfPageToImage } from '../../services/pdf/pdfRenderer';
import { formatFileSize } from '../../utils/fileSize';
import { downloadBlob } from '../../utils/download';

export const PdfOcrPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
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

      // Render page 1 preview
      const img = await renderPdfPageToImage(doc, 1, 1.5, 'image/png');
      setPagePreviewUrl(img.dataUrl);
    } catch (err: any) {
      setError('Could not load PDF document preview.');
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (!file) return;
    setCurrentPage(newPage);
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

    try {
      const response = await fetch('/api/ocr-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: pagePreviewUrl,
          mimeType: 'image/png',
          prompt: `Perform Optical Character Recognition (OCR) on page ${currentPage} of this document. Transcribe all text, numbers, headings, and data tables accurately. Format the output in clear structured Markdown.`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'OCR request failed');
      }

      setExtractedText(data.text || 'No text detected on this page.');
    } catch (err: any) {
      setError(
        err.message || 'OCR extraction failed. Verify that server has access to GEMINI_API_KEY.'
      );
    } finally {
      setIsProcessing(false);
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
    const blob = new Blob([extractedText], { type: 'text/markdown' });
    downloadBlob(blob, `${base}-ocr-page-${currentPage}.md`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini AI Multimodal Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI OCR PDF &amp; Document Reader
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Transcribe, structure, and extract text and tables from scanned documents and images using Gemini AI.
        </p>
      </div>

      <PrivacyNotice toolName="OCR PDF" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop scanned PDF here for AI OCR"
          description="Extract text, tables, and handwritten content with Gemini"
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
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
                className="px-2.5 py-1 rounded border text-xs font-semibold disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                p. {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages || isProcessing}
                className="px-2.5 py-1 rounded border text-xs font-semibold disabled:opacity-30"
              >
                Next
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setPagePreviewUrl('');
                  setExtractedText('');
                }}
                className="text-xs text-[#730000] hover:underline flex items-center space-x-1 pl-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Change file</span>
              </button>
            </div>
          </div>

          {/* Workspace side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Rendered Page Preview */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Page {currentPage} Image</span>
                <span className="text-[11px] text-[#730000]">High-Res Raster</span>
              </div>
              <div className="h-96 flex items-center justify-center overflow-auto rounded bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800">
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

            {/* Right: Extracted OCR Text */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between h-[430px]">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  <span>Structured Markdown Output</span>
                  {extractedText && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCopy}
                        className="text-[#730000] hover:underline flex items-center space-x-1"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={handleDownloadTxt}
                        className="text-slate-600 dark:text-slate-300 hover:underline flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export .MD</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-72 overflow-y-auto p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {extractedText ? (
                    extractedText
                  ) : (
                    <span className="text-slate-400 italic">
                      Click "Run Gemini AI OCR" below to transcribe and structure this page's content...
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 mt-2">
                  {error}
                </div>
              )}

              <button
                onClick={handleRunOcr}
                disabled={isProcessing || !pagePreviewUrl}
                className="w-full mt-3 py-3 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Run Gemini AI OCR on Page {currentPage}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
