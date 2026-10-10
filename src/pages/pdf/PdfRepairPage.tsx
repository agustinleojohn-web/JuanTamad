import React, { useState } from 'react';
import {
  Wrench,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { repairPdf } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfRepairPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [repairedBlob, setRepairedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setRepairedBlob(null);
    setError(null);
  };

  const handleRepair = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await repairPdf(file);
      setRepairedBlob(blob);
    } catch (err: any) {
      setError(err.message || 'Could not salvage or repair this PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!repairedBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(repairedBlob, `${base}-repaired.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Wrench className="w-3.5 h-3.5" />
          <span>Stream Recovery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Repair Corrupted PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Reconstruct broken byte streams, fix damaged trailer dictionaries, and rebuild xref tables locally.
        </p>
      </div>

      <PrivacyNotice toolName="Repair PDF" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop corrupted or damaged PDF here to repair"
          description="Fixes xref tables and syntax errors"
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Size: {formatFileSize(file.size)}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setRepairedBlob(null);
              }}
              className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The recovery algorithm parses raw byte objects, identifies salvageable page tree dictionaries, re-links orphaned fonts and graphics, and writes a standard compliant PDF.
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRepair}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Repair &amp; Rebuild PDF</span>
            </button>

            {repairedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Repaired PDF</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
