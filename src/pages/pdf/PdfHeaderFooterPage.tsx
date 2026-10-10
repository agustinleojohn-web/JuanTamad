import React, { useState } from 'react';
import {
  AlignLeft,
  Download,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { addHeaderFooterToPdf, HeaderFooterOptions } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfHeaderFooterPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [headerLeft, setHeaderLeft] = useState<string>('{title}');
  const [headerRight, setHeaderRight] = useState<string>('{date}');
  const [footerLeft, setFooterLeft] = useState<string>('Confidential');
  const [footerRight, setFooterRight] = useState<string>('Page {page} of {total}');
  const [fontSize, setFontSize] = useState<number>(9);
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setResultBlob(null);
  };

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const options: HeaderFooterOptions = {
        headerLeft,
        headerRight,
        footerLeft,
        footerRight,
        fontSize,
        skipFirstPage,
      };
      const blob = await addHeaderFooterToPdf(file, options);
      setResultBlob(blob);
    } catch (err: any) {
      alert(`Header/Footer error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(resultBlob, `${base}-header-footer.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <AlignLeft className="w-3.5 h-3.5" />
          <span>Macro Insertion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          PDF Header &amp; Footer Builder
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Insert dynamic headers and footers with title, date, and page numbering macro tags across your document.
        </p>
      </div>

      <PrivacyNotice toolName="Header & Footer" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to add headers & footers"
          description="Insert metadata, timestamps, and page tags"
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Size: {formatFileSize(file.size)}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResultBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          {/* Macros hint */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#27272A]/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-3">
            <span className="font-bold text-[var(--accent-text)]">Available Macro Tags:</span>
            <span><code>{'{page}'}</code> = Page number</span>
            <span><code>{'{total}'}</code> = Total pages</span>
            <span><code>{'{date}'}</code> = Current date</span>
            <span><code>{'{title}'}</code> = File title</span>
          </div>

          {/* Header row */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Header Fields
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Header Left</label>
                <input
                  type="text"
                  value={headerLeft}
                  onChange={(e) => setHeaderLeft(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Header Right</label>
                <input
                  type="text"
                  value={headerRight}
                  onChange={(e) => setHeaderRight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Footer row */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Footer Fields
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Footer Left</label>
                <input
                  type="text"
                  value={footerLeft}
                  onChange={(e) => setFooterLeft(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Footer Right</label>
                <input
                  type="text"
                  value={footerRight}
                  onChange={(e) => setFooterRight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="skipCover"
              checked={skipFirstPage}
              onChange={(e) => setSkipFirstPage(e.target.checked)}
              className="rounded accent-[var(--accent-text)]"
            />
            <label htmlFor="skipCover" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              Skip Cover Page (Page 1)
            </label>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Apply Headers &amp; Footers</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
