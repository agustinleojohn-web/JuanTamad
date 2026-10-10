import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  ArrowRight,
  Columns,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { loadPdfDocument, renderPdfPageToCanvas } from '../../services/pdf/pdfRenderer';

export const PdfComparePage: React.FC = () => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [imgAUrl, setImgAUrl] = useState<string>('');
  const [imgBUrl, setImgBUrl] = useState<string>('');
  const [diffUrl, setDiffUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'side' | 'diff'>('side');
  const [isComparing, setIsComparing] = useState<boolean>(false);

  useEffect(() => {
    if (!fileA || !fileB) return;
    let cancelled = false;
    setIsComparing(true);

    const renderBoth = async () => {
      try {
        const [docA, docB] = await Promise.all([
          loadPdfDocument(fileA),
          loadPdfDocument(fileB),
        ]);
        setTotalPages(Math.max(docA.numPages, docB.numPages));

        const canvasA = await renderPdfPageToCanvas(docA, Math.min(page, docA.numPages), 1.2);
        const canvasB = await renderPdfPageToCanvas(docB, Math.min(page, docB.numPages), 1.2);

        if (cancelled) return;
        setImgAUrl(canvasA.toDataURL());
        setImgBUrl(canvasB.toDataURL());

        // Generate Pixel Difference Canvas
        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = Math.max(canvasA.width, canvasB.width);
        diffCanvas.height = Math.max(canvasA.height, canvasB.height);
        const ctxDiff = diffCanvas.getContext('2d');
        const ctxA = canvasA.getContext('2d');
        const ctxB = canvasB.getContext('2d');

        if (ctxDiff && ctxA && ctxB) {
          const imgDataA = ctxA.getImageData(0, 0, canvasA.width, canvasA.height);
          const imgDataB = ctxB.getImageData(0, 0, canvasB.width, canvasB.height);
          const outImg = ctxDiff.createImageData(diffCanvas.width, diffCanvas.height);

          const minLen = Math.min(imgDataA.data.length, imgDataB.data.length, outImg.data.length);
          for (let i = 0; i < minLen; i += 4) {
            const diffR = Math.abs(imgDataA.data[i] - imgDataB.data[i]);
            const diffG = Math.abs(imgDataA.data[i + 1] - imgDataB.data[i + 1]);
            const diffB = Math.abs(imgDataA.data[i + 2] - imgDataB.data[i + 2]);
            const totalDiff = diffR + diffG + diffB;

            if (totalDiff > 40) {
              // Highlight difference in vibrant magenta/red
              outImg.data[i] = 239;     // R
              outImg.data[i + 1] = 68;  // G
              outImg.data[i + 2] = 68;  // B
              outImg.data[i + 3] = 255; // A
            } else {
              // Dim unchanged pixels to gray
              const gray = Math.round(imgDataA.data[i] * 0.3 + imgDataA.data[i + 1] * 0.59 + imgDataA.data[i + 2] * 0.11);
              outImg.data[i] = gray;
              outImg.data[i + 1] = gray;
              outImg.data[i + 2] = gray;
              outImg.data[i + 3] = 70;
            }
          }
          ctxDiff.putImageData(outImg, 0, 0);
          setDiffUrl(diffCanvas.toDataURL());
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsComparing(false);
      }
    };

    renderBoth();

    return () => {
      cancelled = true;
    };
  }, [fileA, fileB, page]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Pixel Diff Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Compare Two PDF Documents
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Visually compare two revisions of a PDF and highlight additions, deletions, and layout discrepancies with pixel-diff overlays.
        </p>
      </div>

      <PrivacyNotice toolName="Compare PDF" />

      {/* Upload Zone for Doc A and Doc B */}
      {(!fileA || !fileB) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
              Document A (Original / Older Version)
            </span>
            {fileA ? (
              <div className="p-4 rounded-xl border border-[#730000]/50 bg-[#730000]/10/50 dark:bg-[#580000]/30 text-xs font-semibold text-[#730000] dark:text-[#730000]/30 flex justify-between">
                <span>{fileA.name}</span>
                <button onClick={() => setFileA(null)} className="text-[#730000]">Change</button>
              </div>
            ) : (
              <Dropzone
                onFilesSelected={(files) => setFileA(files[0])}
                accept=".pdf,application/pdf"
                multiple={false}
                title="Drop Document A"
                description="Original baseline PDF"
              />
            )}
          </div>

          <div className="space-y-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
              Document B (New / Modified Version)
            </span>
            {fileB ? (
              <div className="p-4 rounded-xl border border-[#730000]/50 bg-[#730000]/10/50 dark:bg-[#580000]/30 text-xs font-semibold text-[#730000] dark:text-[#730000]/30 flex justify-between">
                <span>{fileB.name}</span>
                <button onClick={() => setFileB(null)} className="text-[#730000]">Change</button>
              </div>
            ) : (
              <Dropzone
                onFilesSelected={(files) => setFileB(files[0])}
                accept=".pdf,application/pdf"
                multiple={false}
                title="Drop Document B"
                description="Revised or modified PDF"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Header controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                Comparing {fileA.name} vs {fileB.name}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Mode switch */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setViewMode('side')}
                  className={`px-3 py-1.5 rounded-md font-semibold flex items-center space-x-1 ${
                    viewMode === 'side'
                      ? 'bg-[#730000] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Side by Side</span>
                </button>
                <button
                  onClick={() => setViewMode('diff')}
                  className={`px-3 py-1.5 rounded-md font-semibold flex items-center space-x-1 ${
                    viewMode === 'diff'
                      ? 'bg-[#730000] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Pixel Diff Highlight</span>
                </button>
              </div>

              {/* Page navigation */}
              <div className="flex items-center space-x-1.5 text-xs">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2 py-1 rounded border disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="font-bold">
                  p. {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2 py-1 rounded border disabled:opacity-30"
                >
                  Next
                </button>
              </div>

              <button
                onClick={() => {
                  setFileA(null);
                  setFileB(null);
                }}
                className="text-xs text-[#730000] hover:underline pl-2"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Views */}
          {viewMode === 'side' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950">
                <span className="text-xs font-bold text-slate-500 block mb-2">
                  Document A (Page {page})
                </span>
                <div className="h-[440px] flex items-center justify-center overflow-auto p-2 bg-white dark:bg-slate-900 rounded border">
                  {imgAUrl ? (
                    <img src={imgAUrl} alt="Doc A" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400">Loading...</span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950">
                <span className="text-xs font-bold text-slate-500 block mb-2">
                  Document B (Page {page})
                </span>
                <div className="h-[440px] flex items-center justify-center overflow-auto p-2 bg-white dark:bg-slate-900 rounded border">
                  {imgBUrl ? (
                    <img src={imgBUrl} alt="Doc B" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400">Loading...</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950 text-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                Red Discrepancies Highlighted on Gray Baseline
              </span>
              <div className="h-[520px] flex items-center justify-center overflow-auto p-2 bg-white dark:bg-slate-900 rounded border">
                {diffUrl ? (
                  <img src={diffUrl} alt="Diff Highlight" className="max-w-full max-h-full object-contain shadow-md" />
                ) : (
                  <span className="text-xs text-slate-400">Rendering visual diff...</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
