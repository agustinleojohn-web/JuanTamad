import React, { useState } from 'react';
import {
  FileText,
  Download,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { extractTextFromPdf } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfExtractTextPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setIsProcessing(true);
    try {
      const extracted = await extractTextFromPdf(f);
      setText(extracted);
    } catch (err: any) {
      alert(`Text extraction failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!text || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    const blob = new Blob([text], { type: 'text/plain' });
    downloadBlob(blob, `${base}-extracted-text.txt`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Local Text Extractor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Extract Text from PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Extract raw text from PDF documents instantly with zero API requirements and 100% in-browser parsing.
        </p>
      </div>

      <PrivacyNotice toolName="Extract Text" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to extract text"
          description="Instant plain text extraction across all document pages"
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Size: {formatFileSize(file.size)} • {text.length} characters extracted
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                disabled={!text}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-hover)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] hover:bg-[var(--accent-text)]/10 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>
              <button
                onClick={handleDownloadTxt}
                disabled={!text}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .TXT</span>
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setText('');
                }}
                className="text-xs text-[var(--accent-text)] hover:underline pl-2"
              >
                Change
              </button>
            </div>
          </div>

          {/* Search within text */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search in extracted text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
            />
          </div>

          {/* Text Area display */}
          <div className="h-96 overflow-y-auto p-4 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#000000] font-mono text-xs text-[#27272A] dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {isProcessing ? (
              <span className="text-slate-400 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting text across document pages...</span>
              </span>
            ) : (
              text || 'No text found in this PDF.'
            )}
          </div>
        </div>
      )}
    </div>
  );
};
