import React, { useState } from 'react';
import {
  LayoutGrid,
  Download,
  Trash2,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { createNUpHandouts } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfNUpPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [layout, setLayout] = useState<2 | 4 | 6>(2);
  const [sheetSize, setSheetSize] = useState<'a4' | 'letter'>('a4');
  const [sheetOrientation, setSheetOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setResultBlob(null);
  };

  const handleCreate = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const blob = await createNUpHandouts(file, layout, sheetSize, sheetOrientation);
      setResultBlob(blob);
    } catch (err: any) {
      alert(`Handout creation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(resultBlob, `${base}-${layout}up-handouts.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Printer className="w-3.5 h-3.5" />
          <span>Print Ready Layout</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          N-Up Handouts &amp; Booklets
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Arrange 2, 4, or 6 pages per printed sheet for compact study sheets, slides, and classroom handouts.
        </p>
      </div>

      <PrivacyNotice toolName="N-Up Handouts" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to create handouts"
          description="Combine multiple pages per printed sheet"
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

          {/* Layout Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pages Per Sheet
            </label>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <button
                onClick={() => setLayout(2)}
                className={`p-3 rounded-xl border text-center font-bold transition-colors ${
                  layout === 2
                    ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>2-Up (1×2)</div>
                <div className="text-[10px] font-normal opacity-80">Slides &amp; dual-page</div>
              </button>
              <button
                onClick={() => setLayout(4)}
                className={`p-3 rounded-xl border text-center font-bold transition-colors ${
                  layout === 4
                    ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>4-Up (2×2)</div>
                <div className="text-[10px] font-normal opacity-80">Standard handouts</div>
              </button>
              <button
                onClick={() => setLayout(6)}
                className={`p-3 rounded-xl border text-center font-bold transition-colors ${
                  layout === 6
                    ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>6-Up (3×2)</div>
                <div className="text-[10px] font-normal opacity-80">Compact notes</div>
              </button>
            </div>
          </div>

          {/* Sheet format */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Paper Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSheetSize('a4')}
                  className={`py-2 rounded-lg font-bold border ${
                    sheetSize === 'a4'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  A4
                </button>
                <button
                  onClick={() => setSheetSize('letter')}
                  className={`py-2 rounded-lg font-bold border ${
                    sheetSize === 'letter'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Letter
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Orientation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSheetOrientation('landscape')}
                  className={`py-2 rounded-lg font-bold border ${
                    sheetOrientation === 'landscape'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Landscape
                </button>
                <button
                  onClick={() => setSheetOrientation('portrait')}
                  className={`py-2 rounded-lg font-bold border ${
                    sheetOrientation === 'portrait'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Portrait
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCreate}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Compile {layout}-Up Handouts</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Handouts PDF</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
