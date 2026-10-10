import React, { useState } from 'react';
import {
  RotateCw,
  RotateCcw,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { rotatePdfPages, getPdfPageCount } from '../services/pdf/pdfLibService';
import { generatePdfThumbnails } from '../services/pdf/pdfRenderer';
import { downloadBlob } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

export const PdfRotatePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rotations, setRotations] = useState<Record<number, number>>({}); // pageNum -> degrees (90, 180, 270)
  const [thumbnails, setThumbnails] = useState<Array<{ pageNumber: number; dataUrl: string }>>([]);
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
      setRotations({});
      setResultBlob(null);

      // Generate thumbnails
      generatePdfThumbnails(f, 30)
        .then((thumbs) => setThumbnails(thumbs))
        .catch(() => {});
    } catch (err: any) {
      setError('Could not open PDF file.');
    }
  };

  const rotatePage = (pageNumber: number, delta: number) => {
    setRotations((prev) => {
      const current = prev[pageNumber] || 0;
      const next = (current + delta + 360) % 360;
      return { ...prev, [pageNumber]: next };
    });
    setResultBlob(null);
  };

  const rotateAllPages = (delta: number) => {
    setRotations((prev) => {
      const updated: Record<number, number> = {};
      for (let i = 1; i <= totalPages; i++) {
        const cur = prev[i] || 0;
        updated[i] = (cur + delta + 360) % 360;
      }
      return updated;
    });
    setResultBlob(null);
  };

  const handleApplyRotations = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await rotatePdfPages(file, rotations);
      setResultBlob(blob);
    } catch (err: any) {
      setError(err.message || 'Rotation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(resultBlob, `${base}-rotated.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setRotations({});
    setThumbnails([]);
    setResultBlob(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <RotateCw className="w-3.5 h-3.5" />
          <span>Orientation Correction</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Rotate PDF Pages
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Fix upside-down or sideways pages individually or rotate all pages in one click with live thumbnail previews.
        </p>
      </div>

      <PrivacyNotice toolName="Rotate PDF" />

      {!file ? (
        <div className="max-w-2xl mx-auto py-8">
          <Dropzone
            onFilesSelected={handleFiles}
            accept=".pdf,application/pdf"
            multiple={false}
            title="Drop PDF file here to rotate pages"
            description="Rotate pages by 90°, 180°, or 270° with visual inspection."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                {totalPages} Pages total • {formatFileSize(file.size)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => rotateAllPages(90)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center space-x-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All 90°</span>
              </button>
              <button
                onClick={handleReset}
                className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1 pl-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Change file</span>
              </button>
            </div>
          </div>

          {/* Thumbnail Grid with live CSS rotation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const rot = rotations[p] || 0;
              const thumb = thumbnails.find((t) => t.pageNumber === p);

              return (
                <div
                  key={p}
                  className="rounded-xl border border-slate-200 dark:border-[#27272A] p-2.5 flex flex-col items-center justify-between bg-slate-50 dark:bg-[#000000]"
                >
                  <div className="h-32 w-full flex items-center justify-center overflow-hidden mb-2 rounded bg-white dark:bg-[#09090B] border border-slate-100 dark:border-[#27272A]">
                    {thumb ? (
                      <img
                        src={thumb.dataUrl}
                        alt={`Page ${p}`}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        style={{ transform: `rotate(${rot}deg)` }}
                      />
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">Page {p}</span>
                    )}
                  </div>

                  <div className="w-full flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      p. {p} {rot > 0 && `(${rot}°)`}
                    </span>
                    <button
                      onClick={() => rotatePage(p, 90)}
                      className="p-1 rounded text-[var(--accent-text)] hover:bg-[var(--accent-text)]/10 dark:hover:bg-[var(--accent-hover)]"
                      title="Rotate 90° clockwise"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Action */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApplyRotations}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Save &amp; Generate Rotated PDF</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Rotated PDF ({formatFileSize(resultBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
