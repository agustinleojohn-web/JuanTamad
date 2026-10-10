import React, { useState } from 'react';
import {
  Layers,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { extractPdfPages, getPdfPageCount } from '../services/pdf/pdfLibService';
import { generatePdfThumbnails } from '../services/pdf/pdfRenderer';
import { downloadBlob } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

export const PdfExtractPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<Array<{ pageNumber: number; dataUrl: string }>>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setError(null);
    try {
      const count = await getPdfPageCount(f);
      setFile(f);
      setTotalPages(count);
      setSelectedPages([1]);
      setResultBlob(null);

      // Generate thumbnails asynchronously
      setIsLoadingThumbnails(true);
      generatePdfThumbnails(f, 30)
        .then((thumbs) => setThumbnails(thumbs))
        .catch(() => {})
        .finally(() => setIsLoadingThumbnails(false));
    } catch (err: any) {
      setError('Could not open PDF file.');
    }
  };

  const togglePage = (p: number) => {
    setSelectedPages((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].sort((a, b) => a - b)
    );
    setResultBlob(null);
  };

  const handleExtract = async () => {
    if (!file || selectedPages.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await extractPdfPages(file, selectedPages);
      setResultBlob(blob);
    } catch (err: any) {
      setError(err.message || 'Page extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(resultBlob, `${base}-extracted-pages.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setSelectedPages([]);
    setThumbnails([]);
    setResultBlob(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Interactive Page Extractor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Extract PDF Pages
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Pick and choose exact pages to export into a brand new PDF with visual page thumbnails.
        </p>
      </div>

      <PrivacyNotice toolName="Extract PDF Pages" />

      {!file ? (
        <div className="max-w-2xl mx-auto py-8">
          <Dropzone
            onFilesSelected={handleFiles}
            accept=".pdf,application/pdf"
            multiple={false}
            title="Drop PDF file here to extract pages"
            description="Select specific pages to extract into a new PDF document."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                {totalPages} Pages total • Selected: {selectedPages.length} pages
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          {/* Thumbnail Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Click pages to include in the exported PDF:
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1))}
                  className="text-[#730000] hover:underline font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedPages([])}
                  className="text-slate-400 hover:underline font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isSelected = selectedPages.includes(p);
                const thumb = thumbnails.find((t) => t.pageNumber === p);

                return (
                  <div
                    key={p}
                    onClick={() => togglePage(p)}
                    className={`cursor-pointer rounded-xl border-2 p-2 flex flex-col items-center justify-between transition-all select-none ${
                      isSelected
                        ? 'border-[#730000]/50 bg-[#730000]/10/50 dark:bg-[#580000]/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="h-32 w-full flex items-center justify-center overflow-hidden mb-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      {thumb ? (
                        <img
                          src={thumb.dataUrl}
                          alt={`Page ${p}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">Page {p}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs font-bold">
                      <span className={isSelected ? 'text-[#580000] dark:text-[#730000]/30' : 'text-slate-500'}>
                        Page {p}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#730000]/50 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Action */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExtract}
              disabled={isProcessing || selectedPages.length === 0}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Extract {selectedPages.length} Selected Pages</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Extracted PDF ({formatFileSize(resultBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
