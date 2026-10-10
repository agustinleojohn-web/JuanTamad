import React, { useState, useEffect } from 'react';
import {
  Sliders,
  ArrowRight,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  Image as ImageIcon,
  CheckCircle,
  FileCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { ComparisonViewer } from '../components/common/ComparisonViewer';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import {
  processImage,
  OutputFormat,
  ImageProcessingOptions,
  ImageProcessingResult,
  FORMAT_EXT_MAP,
} from '../services/image/imageProcessor';
import { formatFileSize, calculateSizeComparison } from '../utils/fileSize';
import { downloadBlob, downloadZip } from '../utils/download';
import { generateOutputFilename } from '../utils/filename';

interface QueueItem {
  id: string;
  file: File;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  result?: ImageProcessingResult;
  error?: string;
}

export const ImageCompressPage: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [format, setFormat] = useState<OutputFormat>('webp');
  const [quality, setQuality] = useState<number>(80);
  const [resizeMode, setResizeMode] = useState<'none' | 'percent' | 'custom'>('none');
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [customWidth, setCustomWidth] = useState<number | undefined>(undefined);
  const [customHeight, setCustomHeight] = useState<number | undefined>(undefined);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);

  const selectedItem = queue[selectedIndex];

  // When files are dropped
  const handleFiles = async (files: File[]) => {
    const newItems: QueueItem[] = [];

    for (const file of files) {
      const url = URL.createObjectURL(file);
      const id = `${file.name}-${Date.now()}-${Math.random()}`;

      // Get dimensions
      const img = new Image();
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 0, h: 0 });
        img.src = url;
      });

      newItems.push({
        id,
        file,
        originalUrl: url,
        originalWidth: dims.w,
        originalHeight: dims.h,
        status: 'idle',
      });
    }

    setQueue((prev) => [...prev, ...newItems]);
  };

  // Process a single item
  const processItem = async (item: QueueItem): Promise<QueueItem> => {
    const options: ImageProcessingOptions = {
      format,
      quality,
      resizeMode,
      scalePercent: resizeMode === 'percent' ? scalePercent : undefined,
      targetWidth: resizeMode === 'custom' ? customWidth : undefined,
      targetHeight: resizeMode === 'custom' ? customHeight : undefined,
      maintainAspectRatio: maintainAspect,
    };

    try {
      const result = await processImage(item.file, options);
      return {
        ...item,
        status: 'done',
        result,
        error: undefined,
      };
    } catch (err: any) {
      return {
        ...item,
        status: 'error',
        error: err.message || 'Compression failed',
      };
    }
  };

  // Re-process selected item when settings change
  useEffect(() => {
    if (!selectedItem) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      setQueue((prev) =>
        prev.map((it, idx) => (idx === selectedIndex ? { ...it, status: 'processing' } : it))
      );

      const updated = await processItem(selectedItem);
      if (cancelled) return;

      setQueue((prev) =>
        prev.map((it, idx) => (idx === selectedIndex ? updated : it))
      );
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    selectedIndex,
    format,
    quality,
    resizeMode,
    scalePercent,
    customWidth,
    customHeight,
    maintainAspect,
    selectedItem?.file,
  ]);

  // Process all items in batch
  const handleProcessAll = async () => {
    if (queue.length === 0) return;
    setIsBatchProcessing(true);

    for (let i = 0; i < queue.length; i++) {
      setQueue((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'processing' } : it))
      );
      const updated = await processItem(queue[i]);
      setQueue((prev) =>
        prev.map((it, idx) => (idx === i ? updated : it))
      );
    }

    setIsBatchProcessing(false);
  };

  // Download single item
  const handleDownloadItem = (item: QueueItem) => {
    if (!item.result) return;
    const ext = FORMAT_EXT_MAP[item.result.format];
    const filename = generateOutputFilename(item.file.name, 'optimized', ext);
    downloadBlob(item.result.blob, filename);
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    const readyItems = queue.filter((it) => it.result);
    if (readyItems.length === 0) return;

    const zipItems = readyItems.map((it) => {
      const ext = FORMAT_EXT_MAP[it.result!.format];
      return {
        name: generateOutputFilename(it.file.name, 'optimized', ext),
        blob: it.result!.blob,
      };
    });

    await downloadZip(zipItems, 'juantamad-compressed-images.zip');
  };

  // Remove single file
  const handleRemove = (index: number) => {
    const item = queue[index];
    if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
    if (item.result?.url) URL.revokeObjectURL(item.result.url);

    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (selectedIndex >= index && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  // Clear queue
  const handleClear = () => {
    queue.forEach((it) => {
      if (it.originalUrl) URL.revokeObjectURL(it.originalUrl);
      if (it.result?.url) URL.revokeObjectURL(it.result.url);
    });
    setQueue([]);
    setSelectedIndex(0);
  };

  // Presets
  const applyPreset = (preset: 'smallest' | 'balanced' | 'high' | 'lossless') => {
    if (preset === 'smallest') {
      setFormat('webp');
      setQuality(60);
    } else if (preset === 'balanced') {
      setFormat('webp');
      setQuality(80);
    } else if (preset === 'high') {
      setFormat('webp');
      setQuality(92);
    } else if (preset === 'lossless') {
      setFormat('png');
      setQuality(100);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Image Compressor</span>
            </div>
            
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
            Image Compressor
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Reduce file size drastically while preserving crisp visuals with live before/after inspection.
          </p>
        </div>

        {queue.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleProcessAll}
              disabled={isBatchProcessing}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isBatchProcessing ? 'animate-spin' : ''}`} />
              <span>Compress All ({queue.length})</span>
            </button>
            <button
              onClick={handleDownloadAllZip}
              disabled={!queue.some((q) => q.result)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Archive className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <PrivacyNotice toolName="Image Compressor" />

      {/* Main Workspace */}
      {queue.length === 0 ? (
        <div className="max-w-2xl mx-auto py-8">
          <Dropzone
            onFilesSelected={handleFiles}
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp"
            title="Drop image files here to compress"
            description="Supports PNG, JPEG, WebP, AVIF, and GIF. Batch upload supported."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Squoosh Comparison Viewer & Queue */}
          <div className="lg:col-span-8 space-y-6">
            {/* Viewer */}
            {selectedItem && (
              <div className="bg-white dark:bg-[#09090B] rounded-2xl p-4 border border-slate-200 dark:border-[#27272A] shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-[#27272A]">
                  <div className="flex items-center space-x-2 truncate">
                    <ImageIcon className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                    <span className="font-semibold text-sm text-[#09090B] dark:text-white truncate">
                      {selectedItem.file.name}
                    </span>
                  </div>
                  {selectedItem.status === 'processing' && (
                    <span className="flex items-center space-x-1 text-xs text-[var(--accent-text)] dark:text-[var(--accent-text)] font-medium animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing...</span>
                    </span>
                  )}
                  {selectedItem.status === 'done' && (
                    <button
                      onClick={() => handleDownloadItem(selectedItem)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  )}
                </div>

                {selectedItem.result ? (
                  <ComparisonViewer
                    originalUrl={selectedItem.originalUrl}
                    originalSize={selectedItem.file.size}
                    originalWidth={selectedItem.originalWidth}
                    originalHeight={selectedItem.originalHeight}
                    optimizedUrl={selectedItem.result.url}
                    optimizedSize={selectedItem.result.sizeBytes}
                    optimizedWidth={selectedItem.result.width}
                    optimizedHeight={selectedItem.result.height}
                    optimizedFormat={selectedItem.result.format}
                  />
                ) : (
                  <div className="h-[360px] flex items-center justify-center bg-slate-50 dark:bg-[#000000] rounded-xl text-slate-400 text-sm">
                    {selectedItem.status === 'error' ? (
                      <span className="text-[var(--accent-text)] flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{selectedItem.error}</span>
                      </span>
                    ) : (
                      <span>Loading compression preview...</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Queue List Bar */}
            <div className="bg-white dark:bg-[#09090B] rounded-2xl p-4 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Batch Files ({queue.length})</span>
                <span>Click to inspect</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
                {queue.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const stats = item.result
                    ? calculateSizeComparison(item.file.size, item.result.sizeBytes)
                    : null;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`cursor-pointer p-2 rounded-xl border flex items-center justify-between space-x-2 text-xs transition-all ${
                        isSelected
                          ? 'border-[var(--accent-text)]/50 bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] font-medium'
                          : 'border-slate-200 dark:border-[#27272A] hover:bg-slate-50 dark:hover:bg-[#27272A]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <img
                          src={item.originalUrl}
                          alt=""
                          className="w-8 h-8 rounded object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="truncate">
                          <p className="truncate text-[#27272A] dark:text-slate-200 font-medium">
                            {item.file.name}
                          </p>
                          <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                            <span>{formatFileSize(item.file.size)}</span>
                            {stats && stats.isSmaller && (
                              <span className="text-[var(--accent-text)] font-bold">
                                → -{stats.percentageSaved}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(idx);
                        }}
                        className="text-slate-400 hover:text-[var(--accent-text)] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add more files dropzone */}
              <div className="pt-2">
                <Dropzone
                  onFilesSelected={handleFiles}
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  compact
                  title="Add more images to batch"
                  description="Drop additional images here"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Compression Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-[#27272A]">
                <Sliders className="w-5 h-5 text-[var(--accent-text)]" />
                <h3 className="font-bold text-[#09090B] dark:text-white text-base">
                  Compression Settings
                </h3>
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => applyPreset('smallest')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[var(--accent-text)]/50 dark:hover:border-[var(--accent-text)]/50 text-left transition-colors"
                  >
                    <div className="font-semibold text-[#27272A] dark:text-slate-200">Smallest</div>
                    <div className="text-[10px] text-slate-500">WebP • 60% Qual</div>
                  </button>
                  <button
                    onClick={() => applyPreset('balanced')}
                    className="p-2 rounded-xl border border-[var(--accent-text)]/50 bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] text-left transition-colors"
                  >
                    <div className="font-semibold text-[var(--accent-text)] dark:text-[var(--accent-text)]">Balanced</div>
                    <div className="text-[10px] text-[var(--accent-text)]">WebP • 80% Qual</div>
                  </button>
                  <button
                    onClick={() => applyPreset('high')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[var(--accent-text)]/50 dark:hover:border-[var(--accent-text)]/50 text-left transition-colors"
                  >
                    <div className="font-semibold text-[#27272A] dark:text-slate-200">High Quality</div>
                    <div className="text-[10px] text-slate-500">WebP • 92% Qual</div>
                  </button>
                  <button
                    onClick={() => applyPreset('lossless')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[var(--accent-text)]/50 dark:hover:border-[var(--accent-text)]/50 text-left transition-colors"
                  >
                    <div className="font-semibold text-[#27272A] dark:text-slate-200">Lossless PNG</div>
                    <div className="text-[10px] text-slate-500">Crisp • Transparency</div>
                  </button>
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Format
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['webp', 'jpeg', 'png', 'avif'] as OutputFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                        format === fmt
                          ? 'bg-[var(--accent)] text-white border-[var(--accent-text)]'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                {format === 'jpeg' && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Note: JPEG does not support transparency; transparent regions will be filled with white.
                  </p>
                )}
              </div>

              {/* Quality Slider (unless PNG) */}
              {format !== 'png' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Quality</span>
                    <span className="text-[var(--accent-text)] dark:text-[var(--accent-text)] font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                    className="w-full accent-[var(--accent-text)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Smaller file</span>
                    <span>Best quality</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#27272A] text-xs text-slate-500">
                  PNG uses lossless compression. To reduce file size further, use WebP or scale dimensions.
                </div>
              )}

              {/* Resize Controls */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#27272A]">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Dimensions &amp; Scaling
                </label>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => setResizeMode('none')}
                    className={`py-1.5 rounded-lg border font-medium ${
                      resizeMode === 'none'
                        ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] text-[var(--accent-hover)] dark:text-[var(--accent-text)]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setResizeMode('percent')}
                    className={`py-1.5 rounded-lg border font-medium ${
                      resizeMode === 'percent'
                        ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] text-[var(--accent-hover)] dark:text-[var(--accent-text)]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Percent
                  </button>
                  <button
                    onClick={() => setResizeMode('custom')}
                    className={`py-1.5 rounded-lg border font-medium ${
                      resizeMode === 'custom'
                        ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] text-[var(--accent-hover)] dark:text-[var(--accent-text)]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {resizeMode === 'percent' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Scale</span>
                      <span className="font-semibold text-[#27272A] dark:text-white">{scalePercent}%</span>
                    </div>
                    <div className="flex space-x-2">
                      {[75, 50, 25].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setScalePercent(pct)}
                          className={`flex-1 py-1 rounded text-xs border ${
                            scalePercent === pct
                              ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {resizeMode === 'custom' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-slate-500 mb-1 block">Width (px)</label>
                        <input
                          type="number"
                          placeholder={selectedItem?.originalWidth?.toString() || 'Width'}
                          value={customWidth || ''}
                          onChange={(e) =>
                            setCustomWidth(e.target.value ? parseInt(e.target.value, 10) : undefined)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 mb-1 block">Height (px)</label>
                        <input
                          type="number"
                          placeholder={selectedItem?.originalHeight?.toString() || 'Height'}
                          value={customHeight || ''}
                          onChange={(e) =>
                            setCustomHeight(e.target.value ? parseInt(e.target.value, 10) : undefined)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
                        />
                      </div>
                    </div>
                    <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintainAspect}
                        onChange={(e) => setMaintainAspect(e.target.checked)}
                        className="rounded accent-[var(--accent-text)]"
                      />
                      <span>Lock aspect ratio</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Action Download Button */}
              {selectedItem?.result && (
                <button
                  onClick={() => handleDownloadItem(selectedItem)}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {selectedItem.result.format.toUpperCase()}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
