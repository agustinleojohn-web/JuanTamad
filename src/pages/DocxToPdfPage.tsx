import React, { useState } from 'react';
import {
  FileText,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { convertDocxToPdf, DocxToPdfOptions } from '../services/documents/docxToPdf';
import { downloadBlob } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

export const DocxToPdfPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(40);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    if (!selected.name.toLowerCase().endsWith('.docx')) {
      setError('Please provide a valid .docx file (Microsoft Word 2007+). Legacy .doc is not supported.');
      return;
    }
    setError(null);
    setFile(selected);
    setPdfBlob(null);
    setMessages([]);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const options: DocxToPdfOptions = { pageSize, orientation, margin };
      const res = await convertDocxToPdf(file, options);
      setPdfBlob(res.blob);
      setMessages(res.messages);
    } catch (err: any) {
      setError(err.message || 'Failed to convert DOCX file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !file) return;
    const base = file.name.replace(/\.docx$/i, '');
    downloadBlob(pdfBlob, `${base}-converted.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setPdfBlob(null);
    setMessages([]);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Local Word Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          DOCX to PDF Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Convert Microsoft Word documents directly in your browser without uploading proprietary files to third-party servers.
        </p>
      </div>

      <PrivacyNotice toolName="DOCX to PDF" />

      {/* Formatting disclaimer banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-start space-x-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">Browser-Side Fidelity Notice</span>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
            Headings, bullet lists, bold/italic text, and structured paragraphs are extracted directly from the DOCX file. Complex proprietary Microsoft Word layouts (floating text-wraps, SmartArt, equations, macros) may not replicate 1:1.
          </p>
        </div>
      </div>

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple={false}
          title="Drop your .docx document here"
          description="Select any standard Word .docx document for instant local conversion."
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                DOCX
              </div>
              <div>
                <p className="font-semibold text-sm text-[#09090B] dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-[var(--accent-text)] rounded"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Page Size
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setPageSize('a4')}
                  className={`py-2 rounded-lg font-bold border ${
                    pageSize === 'a4'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  A4
                </button>
                <button
                  onClick={() => setPageSize('letter')}
                  className={`py-2 rounded-lg font-bold border ${
                    pageSize === 'letter'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Letter
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Orientation
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`py-2 rounded-lg font-bold border ${
                    orientation === 'portrait'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`py-2 rounded-lg font-bold border ${
                    orientation === 'landscape'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Margins
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setMargin(30)}
                  className={`py-2 rounded-lg font-semibold border ${
                    margin === 30
                      ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 text-[var(--accent-hover)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Normal (30pt)
                </button>
                <button
                  onClick={() => setMargin(50)}
                  className={`py-2 rounded-lg font-semibold border ${
                    margin === 50
                      ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 text-[var(--accent-hover)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Wide (50pt)
                </button>
              </div>
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
              onClick={handleConvert}
              disabled={isProcessing}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Convert to PDF</span>
            </button>

            {pdfBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF ({formatFileSize(pdfBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
