import React, { useState } from 'react';
import {
  Moon,
  Printer,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { transformPdfColors } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfColorFiltersPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'grayscale' | 'dark-mode'>('grayscale');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setResultBlob(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const blob = await transformPdfColors(file, mode);
      setResultBlob(blob);
    } catch (err: any) {
      alert(`Transformation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(resultBlob, `${base}-${mode}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Moon className="w-3.5 h-3.5" />
          <span>Color &amp; Invert Filters</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Grayscale &amp; Dark Mode Invert PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Convert full-color documents into ink-saving monochrome or inverted high-contrast dark mode for night reading.
        </p>
      </div>

      <PrivacyNotice toolName="Color Filters" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to apply color filters"
          description="Convert to Grayscale (Ink Saver) or Dark Mode (Night Reader)"
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

          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Filter Mode
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => {
                  setMode('grayscale');
                  setResultBlob(null);
                }}
                className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-1 font-semibold ${
                  mode === 'grayscale'
                    ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Printer className="w-5 h-5 text-[var(--accent-text)]" />
                <span className="font-bold">Monochrome Grayscale</span>
                <span className="text-[10px] opacity-75">Saves color toner and print ink</span>
              </button>

              <button
                onClick={() => {
                  setMode('dark-mode');
                  setResultBlob(null);
                }}
                className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-1 font-semibold ${
                  mode === 'dark-mode'
                    ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-500" />
                <span className="font-bold">Dark Mode Invert</span>
                <span className="text-[10px] opacity-75">Night reader with black background</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Transform Document Colors</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Filtered PDF</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
