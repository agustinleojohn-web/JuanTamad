import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Split,
  Columns,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { formatFileSize, calculateSizeComparison } from '../../utils/fileSize';

interface ComparisonViewerProps {
  originalUrl: string;
  originalSize: number;
  originalWidth?: number;
  originalHeight?: number;
  optimizedUrl: string;
  optimizedSize: number;
  optimizedWidth?: number;
  optimizedHeight?: number;
  optimizedFormat?: string;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  originalUrl,
  originalSize,
  originalWidth,
  originalHeight,
  optimizedUrl,
  optimizedSize,
  optimizedWidth,
  optimizedHeight,
  optimizedFormat,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = fit, 1.5, 2
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = calculateSizeComparison(originalSize, optimizedSize);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(pos);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Top Header & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-[#27272A]/80 border border-slate-200 dark:border-slate-700">
        {/* Left: Size Comparison Badges */}
        <div className="flex items-center space-x-3 text-xs sm:text-sm">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 dark:text-slate-400">Original:</span>
            <span className="font-semibold text-[#27272A] dark:text-slate-200">
              {formatFileSize(originalSize)}
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 dark:text-slate-400">Optimized:</span>
            <span className="font-bold text-[#09090B] dark:text-white">
              {formatFileSize(optimizedSize)}
            </span>
          </div>

          {/* Savings indicator */}
          {stats.isSmaller && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]">
              <CheckCircle2 className="w-3 h-3 text-[var(--accent-text)] dark:text-[var(--accent-text)]" />
              <span>
                -{stats.percentageSaved}% ({formatFileSize(stats.differenceBytes)} saved)
              </span>
            </span>
          )}

          {stats.isLarger && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>+{Math.abs(stats.percentageSaved)}% larger than source</span>
            </span>
          )}

          {stats.isSame && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              Same size
            </span>
          )}
        </div>

        {/* Right: View & Zoom Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white dark:bg-[#09090B] rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
              disabled={zoomLevel <= 1}
              aria-label="Zoom out"
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#27272A] disabled:opacity-30"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
              disabled={zoomLevel >= 3}
              aria-label="Zoom in"
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#27272A] disabled:opacity-30"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                aria-label="Reset zoom"
                className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-[#27272A] dark:hover:text-white"
              >
                Reset
              </button>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-white dark:bg-[#09090B] rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('slider')}
              title="Interactive Split Slider"
              className={`p-1.5 rounded text-xs font-medium flex items-center space-x-1 ${
                viewMode === 'slider'
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#27272A]'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Slider</span>
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              title="Side by Side"
              className={`p-1.5 rounded text-xs font-medium flex items-center space-x-1 ${
                viewMode === 'side-by-side'
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#27272A]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Side by Side</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          className="relative w-full h-[400px] sm:h-[520px] rounded-2xl overflow-hidden select-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-[#09090B] border border-slate-200 dark:border-[#27272A] cursor-ew-resize flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Zoom Wrapper */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-100 overflow-hidden"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Background Image: Original */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
            </div>

            {/* Foreground Image: Optimized with clip-path */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                clipPath: `inset(0 0 0 ${sliderPosition}%)`,
              }}
            >
              <img
                src={optimizedUrl}
                alt="Optimized"
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
            </div>
          </div>

          {/* Draggable Divider Line */}
          <div
            className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-xl pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Drag Handle Knob */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-[#09090B] border-2 border-[var(--accent-text)] shadow-lg flex items-center justify-center text-[var(--accent-text)] pointer-events-auto cursor-ew-resize">
              <div className="flex space-x-0.5">
                <div className="w-0.5 h-3 bg-[var(--accent)] rounded-full" />
                <div className="w-0.5 h-3 bg-[var(--accent)] rounded-full" />
              </div>
            </div>
          </div>

          {/* Floating Labels */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/60 backdrop-blur-md text-white shadow">
              Original ({originalWidth ? `${originalWidth}×${originalHeight}` : 'Source'})
            </span>
          </div>
          <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--accent-text)]/90 backdrop-blur-md text-white shadow">
              Optimized ({optimizedWidth ? `${optimizedWidth}×${optimizedHeight}` : ''}{' '}
              {optimizedFormat ? `• ${optimizedFormat.toUpperCase()}` : ''})
            </span>
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original Card */}
          <div className="border border-slate-200 dark:border-[#27272A] rounded-2xl bg-slate-50 dark:bg-[#09090B] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-[#27272A]/80 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-medium">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Original</span>
              <span className="text-slate-500">
                {formatFileSize(originalSize)}
                {originalWidth ? ` • ${originalWidth}×${originalHeight}px` : ''}
              </span>
            </div>
            <div className="p-4 flex-1 h-[320px] flex items-center justify-center overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>
          </div>

          {/* Optimized Card */}
          <div className="border border-[var(--accent-text)]/50 rounded-2xl bg-slate-50 dark:bg-[#09090B] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] border-b border-[var(--accent-text)]/20 dark:border-[var(--accent-text)]/40 flex justify-between items-center text-xs font-medium">
              <span className="font-semibold text-[var(--accent-text)] dark:text-[var(--accent-text)] flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]/50" />
                <span>Optimized</span>
              </span>
              <span className="text-[var(--accent-hover)] dark:text-[var(--accent-text)] font-semibold">
                {formatFileSize(optimizedSize)}
                {optimizedWidth ? ` • ${optimizedWidth}×${optimizedHeight}px` : ''}
              </span>
            </div>
            <div className="p-4 flex-1 h-[320px] flex items-center justify-center overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
              <img
                src={optimizedUrl}
                alt="Optimized"
                className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
