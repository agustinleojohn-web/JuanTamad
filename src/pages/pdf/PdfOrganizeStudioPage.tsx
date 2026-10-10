import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  Copy,
  Trash2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Download,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { generatePdfThumbnails } from '../../services/pdf/pdfRenderer';
import { organizePdfPages, OrganizePageItem } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

interface PageCard {
  uniqueId: string;
  originalPageNumber: number;
  rotation: number;
}

export const PdfOrganizeStudioPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageCard[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setResultBlob(null);

    const thumbs = await generatePdfThumbnails(f, 40);
    const thumbMap: Record<number, string> = {};
    thumbs.forEach((t) => {
      thumbMap[t.pageNumber] = t.dataUrl;
    });
    setThumbnails(thumbMap);

    const initialCards: PageCard[] = thumbs.map((t) => ({
      uniqueId: `${t.pageNumber}-${Math.random()}`,
      originalPageNumber: t.pageNumber,
      rotation: 0,
    }));
    setPages(initialCards);
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    setPages((prev) => {
      const copy = [...prev];
      const target = direction === 'left' ? index - 1 : index + 1;
      if (target < 0 || target >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
    setResultBlob(null);
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
    setResultBlob(null);
  };

  const duplicatePage = (index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      const target = copy[index];
      copy.splice(index + 1, 0, {
        uniqueId: `${target.originalPageNumber}-${Math.random()}`,
        originalPageNumber: target.originalPageNumber,
        rotation: target.rotation,
      });
      return copy;
    });
    setResultBlob(null);
  };

  const deletePage = (index: number) => {
    setPages((prev) => prev.filter((_, idx) => idx !== index));
    setResultBlob(null);
  };

  const reverseAll = () => {
    setPages((prev) => [...prev].reverse());
    setResultBlob(null);
  };

  const handleExport = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    try {
      const items: OrganizePageItem[] = pages.map((p) => ({
        originalPageNumber: p.originalPageNumber,
        rotation: p.rotation,
      }));
      const blob = await organizePdfPages(file, items);
      setResultBlob(blob);
    } catch (err: any) {
      alert(`Organize error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(resultBlob, `${base}-organized.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Studio Workspace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Organize PDF Studio
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Rearrange, rotate, duplicate, delete, and reverse pages visually using interactive thumbnail cards.
        </p>
      </div>

      <PrivacyNotice toolName="Organize PDF Studio" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to organize pages"
          description="Drag, drop, rotate and duplicate pages in visual card studio"
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                {pages.length} Pages active • {formatFileSize(file.size)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={reverseAll}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center space-x-1"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Reverse Order</span>
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setPages([]);
                  setResultBlob(null);
                }}
                className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1 pl-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Change file</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((card, idx) => {
              const thumbUrl = thumbnails[card.originalPageNumber];

              return (
                <div
                  key={card.uniqueId}
                  className="rounded-xl border border-slate-200 dark:border-[#27272A] p-2.5 bg-slate-50 dark:bg-[#000000] flex flex-col justify-between shadow-sm group hover:border-[var(--accent-text)]/50 transition-colors"
                >
                  {/* Top card header */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-bold text-[#27272A] dark:text-slate-200">
                      Page {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (orig #{card.originalPageNumber})
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="h-36 w-full flex items-center justify-center overflow-hidden mb-2 rounded bg-white dark:bg-[#09090B] border border-slate-100 dark:border-[#27272A]">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={`Page ${idx + 1}`}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        style={{ transform: `rotate(${card.rotation}deg)` }}
                      />
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">Loading...</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-200 dark:border-[#27272A] text-slate-500">
                    <button
                      onClick={() => movePage(idx, 'left')}
                      disabled={idx === 0}
                      title="Move left"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272A] flex items-center justify-center disabled:opacity-20"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => rotatePage(idx)}
                      title="Rotate 90°"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272A] flex items-center justify-center text-[var(--accent-text)]"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => duplicatePage(idx)}
                      title="Duplicate page"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272A] flex items-center justify-center text-teal-600"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deletePage(idx)}
                      disabled={pages.length <= 1}
                      title="Delete page"
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-[var(--accent-text)] flex items-center justify-center disabled:opacity-20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action bar */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              disabled={isProcessing || pages.length === 0}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Save &amp; Export Organized PDF ({pages.length} Pages)</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Organized PDF ({formatFileSize(resultBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
