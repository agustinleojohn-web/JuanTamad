import React, { useState } from 'react';
import {
  FileText,
  Download,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { convertPdfToWordDoc, extractTextFromPdf } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfToWordPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewText, setPreviewText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [wordBlob, setWordBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setWordBlob(null);

    try {
      const text = await extractTextFromPdf(f);
      setPreviewText(text.slice(0, 1500));
    } catch {}
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const blob = await convertPdfToWordDoc(file);
      setWordBlob(blob);
    } catch (err: any) {
      alert(`Conversion error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!wordBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(wordBlob, `${base}.docx`);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Editable Document Converter</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          PDF to Word (.DOCX) Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Convert PDF text into a genuine, native .docx file that opens cleanly in Microsoft Word, Google Docs, and LibreOffice — reconstructed from the PDF's text layout, including headings.
        </p>
      </div>

      <PrivacyNotice toolName="PDF to Word" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to convert to Word"
          description="Converts document content into an editable .docx file locally"
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                File Size: {formatFileSize(file.size)}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setWordBlob(null);
                setPreviewText('');
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          {/* Text preview */}
          {previewText && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Extracted Content Preview</span>
                <button
                  onClick={handleCopyText}
                  className="text-[var(--accent-text)] hover:underline flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#000000] max-h-48 overflow-y-auto text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {previewText}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Generate Word (.DOCX) File</span>
            </button>

            {wordBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download .DOCX Word Document</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
