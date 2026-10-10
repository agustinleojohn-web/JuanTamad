import React, { useState } from 'react';
import {
  Scissors,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { splitPdf, getPdfPageCount } from '../services/pdf/pdfLibService';
import { downloadBlob, downloadZip } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

export const PdfSplitPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'ranges' | 'all'>('ranges');
  const [rangeInput, setRangeInput] = useState<string>('1-2, 3');
  const [isSplitting, setIsSplitting] = useState<boolean>(false);
  const [splitResults, setSplitResults] = useState<Array<{ name: string; blob: Blob }>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setError(null);
    try {
      const count = await getPdfPageCount(f);
      setFile(f);
      setTotalPages(count);
      setRangeInput(count > 2 ? `1-${Math.ceil(count / 2)}, ${Math.ceil(count / 2) + 1}-${count}` : '1, 2');
      setSplitResults([]);
    } catch (err: any) {
      setError('Could not open PDF file. Verify it is not corrupted or password-protected.');
    }
  };

  const parseRanges = (input: string, max: number): number[][] => {
    const parts = input.split(',').map((p) => p.trim()).filter(Boolean);
    const result: number[][] = [];

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > max) {
          throw new Error(`Invalid range: "${part}". Valid pages are 1 to ${max}.`);
        }
        const range: number[] = [];
        for (let p = start; p <= end; p++) range.push(p);
        result.push(range);
      } else {
        const page = parseInt(part, 10);
        if (isNaN(page) || page < 1 || page > max) {
          throw new Error(`Invalid page number: "${part}". Valid pages are 1 to ${max}.`);
        }
        result.push([page]);
      }
    }

    return result;
  };

  const handleSplit = async () => {
    if (!file || totalPages === 0) return;
    setIsSplitting(true);
    setError(null);

    try {
      let pageGroups: number[][] = [];

      if (splitMode === 'all') {
        pageGroups = Array.from({ length: totalPages }, (_, i) => [i + 1]);
      } else {
        pageGroups = parseRanges(rangeInput, totalPages);
      }

      const results = await splitPdf(file, pageGroups);
      setSplitResults(results);
    } catch (err: any) {
      setError(err.message || 'Splitting failed');
    } finally {
      setIsSplitting(false);
    }
  };

  const handleDownloadAllZip = async () => {
    if (!file || splitResults.length === 0) return;
    const base = file.name.replace(/\.pdf$/i, '');
    await downloadZip(splitResults, `${base}-split-files.zip`);
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setSplitResults([]);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Scissors className="w-3.5 h-3.5" />
          <span>Local Document Splitter</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Split PDF Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Extract specific ranges or break down every page of a PDF into individual files without uploading anything.
        </p>
      </div>

      <PrivacyNotice toolName="Split PDF" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to split"
          description="Split pages locally with zero upload delay."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                {totalPages} Pages total • {formatFileSize(file.size)}
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

          {/* Split Mode Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Split Strategy
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => {
                  setSplitMode('ranges');
                  setSplitResults([]);
                }}
                className={`p-3 rounded-xl border text-left font-medium transition-colors ${
                  splitMode === 'ranges'
                    ? 'border-[#730000] bg-[#730000]/10/50 dark:bg-[#580000]/40 text-[#730000] dark:text-[#730000]/30 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>Custom Page Ranges</div>
                <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                  e.g. 1-3, 4, 5-8
                </div>
              </button>
              <button
                onClick={() => {
                  setSplitMode('all');
                  setSplitResults([]);
                }}
                className={`p-3 rounded-xl border text-left font-medium transition-colors ${
                  splitMode === 'all'
                    ? 'border-[#730000] bg-[#730000]/10/50 dark:bg-[#580000]/40 text-[#730000] dark:text-[#730000]/30 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>Extract Every Page</div>
                <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                  {totalPages} separate single-page PDFs
                </div>
              </button>
            </div>
          </div>

          {splitMode === 'ranges' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Page Ranges (1 to {totalPages})
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => {
                  setRangeInput(e.target.value);
                  setSplitResults([]);
                }}
                placeholder="e.g. 1-2, 3, 4-5"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#730000]/50 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Comma-separated page numbers or ranges (e.g. 1-3, 5, 7-10).
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Split Button */}
          <button
            onClick={handleSplit}
            disabled={isSplitting}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSplitting ? 'animate-spin' : ''}`} />
            <span>Split PDF Now</span>
          </button>

          {/* Results List */}
          {splitResults.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Generated Files ({splitResults.length})
                </span>
                <button
                  onClick={handleDownloadAllZip}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-sm flex items-center space-x-1"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Download All as ZIP</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {splitResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-[#730000] shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formatFileSize(item.blob.size)})
                      </span>
                    </div>

                    <button
                      onClick={() => downloadBlob(item.blob, item.name)}
                      className="px-2.5 py-1 rounded bg-[#730000]/10 dark:bg-[#580000] text-[#730000] dark:text-[#730000]/40 hover:bg-[#730000]/10 font-semibold flex items-center space-x-1 shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
