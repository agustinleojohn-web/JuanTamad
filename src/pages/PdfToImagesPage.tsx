import React, { useState } from 'react';
import {
  Layers,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import {
  loadPdfDocument,
  renderPdfPageToImage,
  RenderedPageImage,
} from '../services/pdf/pdfRenderer';
import { downloadBlob, downloadZip } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

export const PdfToImagesPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [scale, setScale] = useState<number>(2.0); // 2x gives crisp retina resolution
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [renderedImages, setRenderedImages] = useState<RenderedPageImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setError(null);
    try {
      const doc = await loadPdfDocument(f);
      const total = doc.numPages;
      setFile(f);
      setTotalPages(total);
      // Select all pages by default
      setSelectedPages(Array.from({ length: total }, (_, i) => i + 1));
      setRenderedImages([]);
    } catch (err: any) {
      setError(err.message || 'Failed to read PDF. Ensure it is not password-protected.');
    }
  };

  const togglePage = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const selectAll = () => {
    setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
  };

  const selectNone = () => {
    setSelectedPages([]);
  };

  const handleRender = async () => {
    if (!file || selectedPages.length === 0) return;
    setIsRendering(true);
    setError(null);
    setRenderedImages([]);

    try {
      const doc = await loadPdfDocument(file);
      const results: RenderedPageImage[] = [];

      for (let i = 0; i < selectedPages.length; i++) {
        const pageNum = selectedPages[i];
        setProgress({ current: i + 1, total: selectedPages.length });
        const img = await renderPdfPageToImage(doc, pageNum, scale, format);
        results.push(img);
        setRenderedImages([...results]);
      }
    } catch (err: any) {
      setError(err.message || 'Error converting pages to images.');
    } finally {
      setIsRendering(false);
      setProgress(null);
    }
  };

  const downloadSingle = (img: RenderedPageImage) => {
    if (!file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    const ext = format === 'image/png' ? 'png' : 'jpg';
    downloadBlob(img.blob, `${base}-page-${img.pageNumber}.${ext}`);
  };

  const downloadAllZip = async () => {
    if (!file || renderedImages.length === 0) return;
    const base = file.name.replace(/\.pdf$/i, '');
    const ext = format === 'image/png' ? 'png' : 'jpg';

    const zipItems = renderedImages.map((img) => ({
      name: `${base}-page-${img.pageNumber}.${ext}`,
      blob: img.blob,
    }));

    await downloadZip(zipItems, `${base}-images.zip`);
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setSelectedPages([]);
    setRenderedImages([]);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>High-Resolution Page Renderer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          PDF to Images Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Extract every page or selected pages of any PDF document into crisp PNG or JPEG images without uploading sensitive data.
        </p>
      </div>

      <PrivacyNotice toolName="PDF to Images" />

      {!file ? (
        <div className="max-w-2xl mx-auto py-8">
          <Dropzone
            onFilesSelected={handleFiles}
            accept=".pdf,application/pdf"
            multiple={false}
            title="Drop PDF file here to extract images"
            description="Extract pages into PNG or JPEG at 100% or 200% resolution."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Rendered Pages or Page Selection */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#27272A]">
                <div className="truncate">
                  <span className="font-bold text-sm text-[#09090B] dark:text-white block truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {totalPages} Total Pages • {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove file</span>
                </button>
              </div>

              {/* Page selection buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Select Pages ({selectedPages.length} of {totalPages} selected)
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={selectAll}
                      className="text-[var(--accent-text)] hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <button
                      onClick={selectNone}
                      className="text-slate-400 hover:underline font-medium"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-[#27272A] rounded-xl">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isSelected = selectedPages.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePage(p)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {renderedImages.length > 0 && (
              <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#09090B] dark:text-white">
                    Rendered Images ({renderedImages.length})
                  </h3>
                  <button
                    onClick={downloadAllZip}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm flex items-center space-x-1"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Download All as ZIP</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {renderedImages.map((img) => (
                    <div
                      key={img.pageNumber}
                      className="border border-slate-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-slate-50 dark:bg-[#000000] flex flex-col group"
                    >
                      <div className="h-44 p-2 flex items-center justify-center overflow-hidden">
                        <img
                          src={img.dataUrl}
                          alt={`Page ${img.pageNumber}`}
                          className="max-w-full max-h-full object-contain shadow-sm rounded"
                        />
                      </div>
                      <div className="p-2.5 bg-white dark:bg-[#09090B] border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[#27272A] dark:text-slate-200">
                            Page {img.pageNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {img.width}×{img.height}px
                          </span>
                        </div>
                        <button
                          onClick={() => downloadSingle(img)}
                          className="p-1.5 rounded bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] text-[var(--accent-text)] dark:text-[var(--accent-text)] hover:bg-[var(--accent-text)]/10"
                          title="Download Image"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Render Settings */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-5">
              <h3 className="font-bold text-[#09090B] dark:text-white text-base pb-2 border-b border-slate-100 dark:border-[#27272A]">
                Render Quality
              </h3>

              {/* Format */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Image Format
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setFormat('image/png')}
                    className={`py-2 rounded-lg font-bold border ${
                      format === 'image/png'
                        ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    PNG (Lossless)
                  </button>
                  <button
                    onClick={() => setFormat('image/jpeg')}
                    className={`py-2 rounded-lg font-bold border ${
                      format === 'image/jpeg'
                        ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    JPEG (Smaller)
                  </button>
                </div>
              </div>

              {/* Scale / Resolution */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Render Resolution Scale
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => setScale(1.0)}
                    className={`py-2 rounded-lg font-semibold border ${
                      scale === 1.0
                        ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 text-[var(--accent-hover)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    1x (Standard)
                  </button>
                  <button
                    onClick={() => setScale(2.0)}
                    className={`py-2 rounded-lg font-semibold border ${
                      scale === 2.0
                        ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 text-[var(--accent-hover)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    2x (High Res)
                  </button>
                  <button
                    onClick={() => setScale(3.0)}
                    className={`py-2 rounded-lg font-semibold border ${
                      scale === 3.0
                        ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 text-[var(--accent-hover)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    3x (Print DPI)
                  </button>
                </div>
              </div>

              {progress && (
                <div className="p-3 rounded-xl bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] text-xs text-[var(--accent-text)] dark:text-[var(--accent-text)]">
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Rendering page...</span>
                    <span>
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--accent-text)]/20 dark:bg-[var(--accent-text)]/20 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[var(--accent)] h-1.5 rounded-full transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              {/* Action */}
              <button
                onClick={handleRender}
                disabled={isRendering || selectedPages.length === 0}
                className="w-full py-3 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRendering ? 'animate-spin' : ''}`} />
                <span>Render {selectedPages.length} Pages</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
