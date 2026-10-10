import React, { useState } from 'react';
import {
  Copy,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Plus,
  FileCheck,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { mergePdfs, getPdfPageCount } from '../services/pdf/pdfLibService';
import { downloadBlob } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

interface MergeItem {
  id: string;
  file: File;
  pageCount?: number;
}

export const PdfMergePage: React.FC = () => {
  const [files, setFiles] = useState<MergeItem[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (newFiles: File[]) => {
    setError(null);
    const items: MergeItem[] = [];

    for (const f of newFiles) {
      if (!f.name.toLowerCase().endsWith('.pdf')) continue;
      try {
        const count = await getPdfPageCount(f);
        items.push({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          pageCount: count,
        });
      } catch (err) {
        items.push({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
        });
      }
    }

    setFiles((prev) => [...prev, ...items]);
    setMergedBlob(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const copy = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
    setMergedBlob(null);
  };

  const removeItem = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedBlob(null);
  };

  const clearAll = () => {
    setFiles([]);
    setMergedBlob(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please provide at least 2 PDF files to merge.');
      return;
    }
    setIsMerging(true);
    setError(null);
    try {
      const blob = await mergePdfs(files.map((f) => f.file));
      setMergedBlob(blob);
    } catch (err: any) {
      setError(err.message || 'Failed to merge PDF files.');
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) return;
    downloadBlob(mergedBlob, 'juantamad-merged-document.pdf');
  };

  const totalPagesSum = files.reduce((acc, f) => acc + (f.pageCount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Copy className="w-3.5 h-3.5" />
          <span>Local Document Combiner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Merge PDF Files
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Combine multiple PDF documents into one single file in seconds. Drag and drop to arrange page sequence.
        </p>
      </div>

      <PrivacyNotice toolName="Merge PDF" />

      {files.length === 0 ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          title="Drop multiple PDF files here to merge"
          description="Select two or more PDF documents. Files remain 100% on your machine."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                Files Sequence ({files.length} documents)
              </span>
              <span className="text-xs text-slate-400">
                Total Pages: ~{totalPagesSum} pages
              </span>
            </div>
            <button
              onClick={clearAll}
              className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear queue</span>
            </button>
          </div>

          <div className="space-y-2">
            {files.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center space-x-3 truncate">
                  <span className="w-6 text-center text-xs font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
                    PDF
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatFileSize(item.file.size)}
                      {item.pageCount ? ` • ${item.pageCount} pages` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === files.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-[#730000]"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Dropzone
              onFilesSelected={handleFiles}
              accept=".pdf,application/pdf"
              compact
              title="Add more PDF files"
              description="Drop more documents here to merge"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleMerge}
              disabled={isMerging || files.length < 2}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isMerging ? 'animate-spin' : ''}`} />
              <span>Merge {files.length} PDFs</span>
            </button>

            {mergedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Merged PDF ({formatFileSize(mergedBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
