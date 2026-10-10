import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sliders,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Split,
  Columns,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Layers,
  FileCheck,
  ArrowRight,
  Eye,
  Play,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import {
  SquooshSettings,
  DEFAULT_SQUOOSH_SETTINGS,
  SquooshCodec,
  SquooshResult,
  BatchItem,
  optimizeWithSquoosh,
  processSquooshBatch,
  downloadSquooshBatchZip,
  loadImageElement,
} from '../../services/image/squooshService';
import { formatFileSize, calculateSizeComparison } from '../../utils/fileSize';

export const SquooshPage: React.FC = () => {
  // Batch Queue
  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Squoosh Compression Settings
  const [settings, setSettings] = useState<SquooshSettings>(DEFAULT_SQUOOSH_SETTINGS);

  // Active Comparison Result
  const [activeResult, setActiveResult] = useState<SquooshResult | null>(null);
  const [isProcessingActive, setIsProcessingActive] = useState<boolean>(false);
  const [activeError, setActiveError] = useState<string | null>(null);

  // Interactive Squoosh Viewer State
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = fit, 1.5, 2, 3
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Batch Processing Status
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  const activeItem = queue[activeIndex] || null;

  // Handle new files dropped into Squoosh
  const handleFiles = async (files: File[]) => {
    const newItems: BatchItem[] = [];

    for (const file of files) {
      const url = URL.createObjectURL(file);
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      try {
        const img = await loadImageElement(url);
        newItems.push({
          id,
          file,
          originalSize: file.size,
          originalWidth: img.naturalWidth || img.width,
          originalHeight: img.naturalHeight || img.height,
          originalUrl: url,
          status: 'idle',
          progress: 0,
        });
      } catch (err) {
        newItems.push({
          id,
          file,
          originalSize: file.size,
          originalWidth: 0,
          originalHeight: 0,
          originalUrl: url,
          status: 'error',
          progress: 0,
          error: 'Failed to read image',
        });
      }
    }

    setQueue((prev) => {
      const combined = [...prev, ...newItems];
      return combined;
    });
  };

  // Run Squoosh optimization on the actively viewed image whenever settings change
  const runActiveOptimization = useCallback(async () => {
    if (!activeItem || activeItem.status === 'error') return;

    setIsProcessingActive(true);
    setActiveError(null);

    try {
      const result = await optimizeWithSquoosh(activeItem.file, settings);
      setActiveResult(result);

      // Also update the queue item
      setQueue((prev) =>
        prev.map((item, idx) =>
          idx === activeIndex
            ? { ...item, status: 'done', result, progress: 100 }
            : item
        )
      );
    } catch (err: any) {
      setActiveError(err?.message || 'Compression error');
    } finally {
      setIsProcessingActive(false);
    }
  }, [activeItem, settings, activeIndex]);

  // Debounced auto-render for active image when settings or active item change
  useEffect(() => {
    if (!activeItem) return;

    const timer = setTimeout(() => {
      runActiveOptimization();
    }, 200);

    return () => clearTimeout(timer);
  }, [runActiveOptimization]);

  // Slider Drag Handling
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };
    const onMouseUp = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDraggingSlider, handleSliderMove]);

  // Execute Batch conversion using active Squoosh settings
  const handleRunBatch = async () => {
    if (queue.length === 0 || isBatchRunning) return;

    setIsBatchRunning(true);
    setBatchProgress({ current: 0, total: queue.length });

    await processSquooshBatch(
      queue,
      settings,
      (itemId, status, result, error) => {
        setQueue((prev) =>
          prev.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                status,
                result: result || item.result,
                error,
                progress: status === 'done' ? 100 : item.progress,
              };
            }
            return item;
          })
        );

        if (status === 'done' || status === 'error') {
          setBatchProgress((prev) => ({ ...prev, current: prev.current + 1 }));
        }
      }
    );

    setIsBatchRunning(false);
  };

  // Download single active result
  const handleDownloadActive = () => {
    if (!activeItem || !activeResult) return;
    const baseName =
      activeItem.file.name.substring(0, activeItem.file.name.lastIndexOf('.')) ||
      activeItem.file.name;
    const fileName = `${baseName}_squoosh.${activeResult.extension}`;

    const a = document.createElement('a');
    a.href = activeResult.url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download all batch results as ZIP
  const handleDownloadBatchZip = async () => {
    try {
      await downloadSquooshBatchZip(queue, 'juantamad_squoosh_batch.zip');
    } catch (err: any) {
      alert(err?.message || 'Download failed');
    }
  };

  // Remove single item from queue
  const handleRemoveItem = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (activeIndex >= index && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  // Clear all items
  const handleClearAll = () => {
    queue.forEach((q) => {
      URL.revokeObjectURL(q.originalUrl);
      if (q.result) URL.revokeObjectURL(q.result.url);
    });
    setQueue([]);
    setActiveResult(null);
    setActiveIndex(0);
  };

  // Stats calculation
  const comparisonStats =
    activeItem && activeResult
      ? calculateSizeComparison(activeItem.originalSize, activeResult.sizeBytes)
      : null;

  const completedBatchCount = queue.filter((q) => q.status === 'done').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#27272A] pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--accent-text)]/10 text-[var(--accent-text)] border border-[var(--accent-text)]/20">
              Squoosh Studio • Pro Image Compression
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-slate-300">
              Batch Enabled
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#09090B] dark:text-white tracking-tight flex items-center gap-2">
            <span>Squoosh Interactive Optimizer</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Google Chrome Labs Squoosh studio with interactive before/after split viewer, MozJPEG, WebP, PNG quantization, AVIF, and <strong className="text-[var(--accent-text)] dark:text-[var(--accent-text)]">batch conversion using your exact settings</strong>.
          </p>
        </div>

        {/* Global Action Badges */}
        <div className="flex items-center space-x-2">
          {queue.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-slate-200 dark:border-[#27272A] transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
          {queue.length > 1 && (
            <button
              onClick={handleRunBatch}
              disabled={isBatchRunning}
              className="px-4 py-2 text-xs font-bold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl shadow-md shadow-[var(--accent-text)]/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isBatchRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting ({batchProgress.current}/{batchProgress.total})...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Batch Convert All ({queue.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      {queue.length === 0 ? (
        <div className="space-y-6">
          <Dropzone
            onFilesSelected={handleFiles}
            title="Drop images here to open in Squoosh"
            description="Supports JPG, PNG, WebP, AVIF, GIF, BMP, HEIC — Single or Multiple images for batch processing"
            multiple={true}
          />
          <PrivacyNotice />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center: Interactive Squoosh Comparison Viewer (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Viewer Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#09090B] border border-slate-200 dark:border-[#27272A]">
              {/* Size Comparison Badge */}
              {comparisonStats && activeResult && (
                <div className="flex items-center space-x-2 text-xs font-medium">
                  <span className="text-slate-500">Original:</span>
                  <span className="font-semibold text-[#27272A] dark:text-slate-200">
                    {formatFileSize(activeItem.originalSize)}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="font-bold text-[var(--accent-text)] dark:text-[var(--accent-text)]">
                    {formatFileSize(activeResult.sizeBytes)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      comparisonStats.percentageSaved > 0
                        ? 'bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {comparisonStats.isSmaller
                      ? `↓ ${Math.abs(Math.round(comparisonStats.percentageSaved))}% smaller`
                      : `↑ +${Math.abs(Math.round(comparisonStats.percentageSaved))}% larger`}
                  </span>
                </div>
              )}

              {/* View Mode & Zoom Controls */}
              <div className="flex items-center space-x-1.5 ml-auto">
                <button
                  onClick={() => setViewMode('split')}
                  title="Split Slider"
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                    viewMode === 'split'
                      ? 'bg-white dark:bg-[#27272A] shadow-sm text-[var(--accent-text)] dark:text-[var(--accent-text)]'
                      : 'text-slate-500 hover:text-[#09090B] dark:hover:text-white'
                  }`}
                >
                  <Split className="w-4 h-4" />
                  <span className="hidden sm:inline">Slider</span>
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  title="Side-by-Side"
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                    viewMode === 'side-by-side'
                      ? 'bg-white dark:bg-[#27272A] shadow-sm text-[var(--accent-text)] dark:text-[var(--accent-text)]'
                      : 'text-slate-500 hover:text-[#09090B] dark:hover:text-white'
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  <span className="hidden sm:inline">2-Up</span>
                </button>

                <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

                <button
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                  title="Zoom Out"
                  className="p-1.5 text-slate-500 hover:text-[#27272A] dark:hover:text-white rounded-lg transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-slate-500 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
                  title="Zoom In"
                  className="p-1.5 text-slate-500 hover:text-[#27272A] dark:hover:text-white rounded-lg transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Squoosh Interactive Canvas Area */}
            <div
              ref={sliderContainerRef}
              className="relative w-full h-[460px] sm:h-[540px] rounded-3xl overflow-hidden border border-slate-200 dark:border-[#27272A] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:16px_16px] flex items-center justify-center select-none cursor-crosshair shadow-sm"
              onMouseDown={() => viewMode === 'split' && setIsDraggingSlider(true)}
              onTouchStart={() => viewMode === 'split' && setIsDraggingSlider(true)}
            >
              {isProcessingActive && (
                <div className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#09090B]/90 shadow-md backdrop-blur border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-xs font-semibold text-[var(--accent-text)]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Squoosh encoding...</span>
                </div>
              )}

              {activeError && (
                <div className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-xl bg-red-100 text-red-800 text-xs font-semibold flex items-center space-x-1.5 border border-red-300">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{activeError}</span>
                </div>
              )}

              {viewMode === 'split' ? (
                /* Split Slider Mode */
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  {/* Right: Optimized Result (Bottom layer) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-transform"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    <img
                      src={activeResult?.url || activeItem.originalUrl}
                      alt="Squoosh Optimized"
                      className="max-w-full max-h-full object-contain pointer-events-none"
                    />
                  </div>

                  {/* Left: Original Image (Clipped layer) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none transition-transform"
                    style={{
                      clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                      transform: `scale(${zoomLevel})`,
                    }}
                  >
                    <img
                      src={activeItem.originalUrl}
                      alt="Original"
                      className="max-w-full max-h-full object-contain pointer-events-none"
                    />
                  </div>

                  {/* Vertical Divider Line with Squoosh Handle */}
                  <div
                    className="absolute top-0 bottom-0 z-20 pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="w-0.5 h-full bg-[var(--accent)] dark:bg-white shadow-[0_0_10px_rgba(115,0,0,0.5)] relative">
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--accent)] text-white shadow-xl flex items-center justify-center cursor-ew-resize pointer-events-auto border-2 border-white transition-transform hover:scale-110 active:scale-95">
                        <Split className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Labels */}
                  <div className="absolute bottom-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] font-semibold backdrop-blur">
                    Original ({formatFileSize(activeItem.originalSize)})
                  </div>
                  <div className="absolute bottom-4 right-4 z-10 px-2.5 py-1 rounded-lg bg-[var(--accent-text)]/90 text-white text-[11px] font-semibold backdrop-blur">
                    Squoosh ({activeResult ? formatFileSize(activeResult.sizeBytes) : '...'})
                  </div>
                </div>
              ) : (
                /* Side-by-Side 2-Up Mode */
                <div className="w-full h-full grid grid-cols-2 gap-2 p-2">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#27272A] bg-white/50 dark:bg-[#09090B]/50 flex items-center justify-center">
                    <img
                      src={activeItem.originalUrl}
                      alt="Original"
                      className="max-w-full max-h-full object-contain"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                      Original ({formatFileSize(activeItem.originalSize)})
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#27272A] bg-white/50 dark:bg-[#09090B]/50 flex items-center justify-center">
                    <img
                      src={activeResult?.url || activeItem.originalUrl}
                      alt="Squoosh"
                      className="max-w-full max-h-full object-contain"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-[var(--accent)] text-white text-[10px] font-bold">
                      Squoosh ({activeResult ? formatFileSize(activeResult.sizeBytes) : '...'})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Viewer Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#09090B] border border-slate-200 dark:border-[#27272A] shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-text)]/10 text-[var(--accent-text)] flex items-center justify-center font-bold text-xs uppercase">
                  {settings.codec}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#09090B] dark:text-white truncate max-w-[220px] sm:max-w-[320px]">
                    {activeItem.file.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {activeItem.originalWidth} × {activeItem.originalHeight} px • {formatFileSize(activeItem.originalSize)}
                    {activeResult && ` → ${activeResult.width} × ${activeResult.height} px`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={runActiveOptimization}
                  disabled={isProcessingActive}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors flex items-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessingActive ? 'animate-spin' : ''}`} />
                  <span>Re-calculate</span>
                </button>
                <button
                  onClick={handleDownloadActive}
                  disabled={!activeResult}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/25 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download This File</span>
                </button>
              </div>
            </div>

            {/* Batch Conversion Section (Requested specifically by user) */}
            <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#09090B] p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#27272A] pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm text-[#09090B] dark:text-white">
                      Batch Processing Queue ({queue.length} files)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-text)]/10 text-[var(--accent-text)]">
                      Same User Settings
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Batch convert all images using current {settings.codec.toUpperCase()} (Q:{settings.mozjpeg.quality}%) settings.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRunBatch}
                    disabled={isBatchRunning}
                    className="px-4 py-2 text-xs font-bold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {isBatchRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Converting ({batchProgress.current}/{batchProgress.total})...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Convert All ({queue.length})</span>
                      </>
                    )}
                  </button>

                  {completedBatchCount > 0 && (
                    <button
                      onClick={handleDownloadBatchZip}
                      className="px-4 py-2 text-xs font-bold bg-[#09090B] dark:bg-slate-100 text-white dark:text-[#09090B] hover:bg-[#27272A] rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Download All ZIP ({completedBatchCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Batch Queue Item Cards / Table */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {queue.map((item, idx) => {
                  const isSelected = idx === activeIndex;
                  const itemStats = item.result
                    ? calculateSizeComparison(item.originalSize, item.result.sizeBytes)
                    : null;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/5 dark:bg-[var(--accent-text)]/20'
                          : 'border-slate-200 dark:border-[#27272A] hover:bg-slate-50 dark:hover:bg-[#27272A]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={item.originalUrl}
                          alt="Thumbnail"
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#09090B] dark:text-white truncate max-w-[180px] sm:max-w-xs">
                            {item.file.name}
                          </p>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                            <span>{formatFileSize(item.originalSize)}</span>
                            {item.result && (
                              <>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="font-bold text-[var(--accent-text)] dark:text-[var(--accent-text)]">
                                  {formatFileSize(item.result.sizeBytes)}
                                </span>
                                <span className="text-[var(--accent-text)] font-semibold">
                                  (↓ {Math.abs(Math.round(itemStats?.percentageSaved || 0))}%)
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {item.status === 'processing' && (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Compressing</span>
                          </span>
                        )}
                        {item.status === 'done' && (
                          <span className="text-[10px] font-semibold text-[var(--accent-hover)] bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done</span>
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-[10px] font-semibold text-red-700 bg-red-50 dark:bg-[var(--accent-text-tint)] px-2 py-0.5 rounded-full">
                            Error
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(idx);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add more files zone inside batch drawer */}
              <div className="pt-2">
                <Dropzone
                  onFilesSelected={handleFiles}
                  title="Add more files to this Squoosh batch"
                  description="Drop more images anytime"
                  compact={true}
                  multiple={true}
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Squoosh Encoders & Quality Tuning (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#09090B] p-6 space-y-6 shadow-sm">
              {/* Codec Selection Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Select Codec / Encoder
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'mozjpeg', label: 'MozJPEG', desc: 'Universal' },
                      { id: 'webp', label: 'WebP', desc: 'High Ratio' },
                      { id: 'png', label: 'OxiPNG', desc: 'Quantized' },
                      { id: 'avif', label: 'AVIF', desc: 'Next-Gen' },
                      { id: 'gif', label: 'GIF', desc: 'Animation' },
                      { id: 'bmp', label: 'BMP', desc: 'Lossless' },
                    ] as const
                  ).map((codec) => (
                    <button
                      key={codec.id}
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, codec: codec.id as SquooshCodec }))
                      }
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        settings.codec === codec.id
                          ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/5 dark:bg-[var(--accent-text)]/20 text-[var(--accent-text)] dark:text-[var(--accent-text)] font-bold shadow-sm ring-1 ring-[var(--accent-text)]'
                          : 'border-slate-200 dark:border-[#27272A] hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-black">{codec.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{codec.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Codec Fine Tuning Options */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#27272A]/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
                {settings.codec === 'mozjpeg' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Quality:</span>
                        <span className="text-[var(--accent-text)] font-mono">{settings.mozjpeg.quality}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={settings.mozjpeg.quality}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            mozjpeg: { ...prev.mozjpeg, quality: Number(e.target.value) },
                          }))
                        }
                        className="w-full accent-[var(--accent-text)]"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Chroma Subsampling:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                        <button
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              mozjpeg: { ...prev.mozjpeg, chromaSubsample: '4:2:0' },
                            }))
                          }
                          className={`p-2 rounded-xl border text-center transition-colors ${
                            settings.mozjpeg.chromaSubsample === '4:2:0'
                              ? 'bg-white dark:bg-slate-700 border-[var(--accent-text)] text-[var(--accent-text)]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600'
                          }`}
                        >
                          4:2:0 (Smaller file)
                        </button>
                        <button
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              mozjpeg: { ...prev.mozjpeg, chromaSubsample: '4:4:4' },
                            }))
                          }
                          className={`p-2 rounded-xl border text-center transition-colors ${
                            settings.mozjpeg.chromaSubsample === '4:4:4'
                              ? 'bg-white dark:bg-slate-700 border-[var(--accent-text)] text-[var(--accent-text)]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600'
                          }`}
                        >
                          4:4:4 (Crisp edges)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Smoothing:</span>
                        <span className="text-[var(--accent-text)] font-mono">{settings.mozjpeg.smoothing}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.mozjpeg.smoothing}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            mozjpeg: { ...prev.mozjpeg, smoothing: Number(e.target.value) },
                          }))
                        }
                        className="w-full accent-[var(--accent-text)]"
                      />
                    </div>
                  </div>
                )}

                {settings.codec === 'webp' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Compression Mode:
                      </span>
                      <div className="flex items-center space-x-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-semibold">
                        <button
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              webp: { ...prev.webp, mode: 'lossy' },
                            }))
                          }
                          className={`px-3 py-1 rounded-lg ${
                            settings.webp.mode === 'lossy'
                              ? 'bg-white dark:bg-[#09090B] text-[var(--accent-text)] font-bold shadow-sm'
                              : 'text-slate-600'
                          }`}
                        >
                          Lossy
                        </button>
                        <button
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              webp: { ...prev.webp, mode: 'lossless' },
                            }))
                          }
                          className={`px-3 py-1 rounded-lg ${
                            settings.webp.mode === 'lossless'
                              ? 'bg-white dark:bg-[#09090B] text-[var(--accent-text)] font-bold shadow-sm'
                              : 'text-slate-600'
                          }`}
                        >
                          Lossless
                        </button>
                      </div>
                    </div>

                    {settings.webp.mode === 'lossy' && (
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-700 dark:text-slate-300">Quality:</span>
                          <span className="text-[var(--accent-text)] font-mono">{settings.webp.quality}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={settings.webp.quality}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              webp: { ...prev.webp, quality: Number(e.target.value) },
                            }))
                          }
                          className="w-full accent-[var(--accent-text)]"
                        />
                      </div>
                    )}
                  </div>
                )}

                {settings.codec === 'png' && (
                  <div className="space-y-4">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <span>Reduce Palette (Quantize Colors):</span>
                      <input
                        type="checkbox"
                        checked={settings.png.quantize}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            png: { ...prev.png, quantize: e.target.checked },
                          }))
                        }
                        className="rounded accent-[var(--accent-text)] w-4 h-4"
                      />
                    </label>

                    {settings.png.quantize && (
                      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-700 dark:text-slate-300">Max Colors:</span>
                            <span className="text-[var(--accent-text)] font-mono">{settings.png.maxColors}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
                            {[16, 32, 64, 128, 256].map((cols) => (
                              <button
                                key={cols}
                                onClick={() =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    png: { ...prev.png, maxColors: cols },
                                  }))
                                }
                                className={`py-1.5 rounded-lg border text-center ${
                                  settings.png.maxColors === cols
                                    ? 'bg-[var(--accent)] text-white border-[var(--accent-text)]'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600'
                                }`}
                              >
                                {cols}
                              </button>
                            ))}
                          </div>
                        </div>

                        <label className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.png.dither}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                png: { ...prev.png, dither: e.target.checked },
                              }))
                            }
                            className="rounded accent-[var(--accent-text)]"
                          />
                          <span>Floyd-Steinberg Dithering (prevents color banding)</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {settings.codec === 'avif' && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">AVIF Quality:</span>
                      <span className="text-[var(--accent-text)] font-mono">{settings.avif.quality}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={settings.avif.quality}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          avif: { ...prev.avif, quality: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-[var(--accent-text)]"
                    />
                  </div>
                )}

                {(settings.codec === 'gif' || settings.codec === 'bmp') && (
                  <p className="text-xs text-slate-500">
                    Standard browser canvas raster encoding for {settings.codec.toUpperCase()}.
                  </p>
                )}
              </div>

              {/* Preprocessing Options: Resize, Rotate, Filters */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-[#27272A]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#27272A] dark:text-white uppercase tracking-wider">
                    Resize Image
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.resize.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        resize: { ...prev.resize, enabled: e.target.checked },
                      }))
                    }
                    className="rounded accent-[var(--accent-text)] w-4 h-4 cursor-pointer"
                  />
                </div>

                {settings.resize.enabled && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#27272A]/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="grid grid-cols-5 gap-1 text-[11px] font-semibold">
                      {[25, 50, 75, 100, 150].map((pct) => (
                        <button
                          key={pct}
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              resize: { ...prev.resize, mode: 'percent', percent: pct },
                            }))
                          }
                          className={`py-1.5 rounded-lg border text-center ${
                            settings.resize.percent === pct
                              ? 'bg-[var(--accent)] text-white border-[var(--accent-text)]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rotate & Color Effects */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-[#27272A]">
                <span className="text-xs font-bold text-[#27272A] dark:text-white uppercase tracking-wider block">
                  Rotate &amp; Visual Effects
                </span>

                <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, rotate: deg as 0 | 90 | 180 | 270 }))
                      }
                      className={`py-2 rounded-xl border text-center ${
                        settings.rotate === deg
                          ? 'bg-[var(--accent)] text-white border-[var(--accent-text)]'
                          : 'border-slate-200 dark:border-[#27272A] text-slate-600'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-4 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.grayscale}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, grayscale: e.target.checked }))
                      }
                      className="rounded accent-[var(--accent-text)]"
                    />
                    <span>Grayscale</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.invert}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, invert: e.target.checked }))
                      }
                      className="rounded accent-[var(--accent-text)]"
                    />
                    <span>Invert</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
