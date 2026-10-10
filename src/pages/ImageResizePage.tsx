import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import {
  processImage,
  OutputFormat,
  FORMAT_EXT_MAP,
} from '../services/image/imageProcessor';
import { getImageDimensions, ImageDimensions } from '../utils/fileValidation';
import { formatFileSize } from '../utils/fileSize';
import { downloadBlob, downloadZip } from '../utils/download';
import { generateOutputFilename } from '../utils/filename';

interface ResizableFile {
  id: string;
  file: File;
  previewUrl: string;
  originalDims: ImageDimensions;
  targetWidth: number;
  targetHeight: number;
  maintainAspect: boolean;
  resultBlob?: Blob;
  status: 'idle' | 'processing' | 'done' | 'error';
  error?: string;
}

export const ImageResizePage: React.FC = () => {
  const [files, setFiles] = useState<ResizableFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [format, setFormat] = useState<OutputFormat>('webp');
  const [quality, setQuality] = useState<number>(85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const selected = files[selectedIndex];

  const handleFiles = async (newFiles: File[]) => {
    const items: ResizableFile[] = [];

    for (const f of newFiles) {
      try {
        const dims = await getImageDimensions(f);
        const url = URL.createObjectURL(f);
        items.push({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          previewUrl: url,
          originalDims: dims,
          targetWidth: dims.width,
          targetHeight: dims.height,
          maintainAspect: true,
          status: 'idle',
        });
      } catch (err) {
        console.error(err);
      }
    }

    setFiles((prev) => [...prev, ...items]);
  };

  const updateSelectedDimensions = (w?: number, h?: number, lockAspect = selected?.maintainAspect) => {
    if (!selected) return;

    let newW = w !== undefined ? w : selected.targetWidth;
    let newH = h !== undefined ? h : selected.targetHeight;

    if (lockAspect && selected.originalDims.width > 0) {
      const ratio = selected.originalDims.width / selected.originalDims.height;
      if (w !== undefined && h === undefined) {
        newH = Math.max(1, Math.round(w / ratio));
      } else if (h !== undefined && w === undefined) {
        newW = Math.max(1, Math.round(h * ratio));
      }
    }

    setFiles((prev) =>
      prev.map((f, i) =>
        i === selectedIndex
          ? {
              ...f,
              targetWidth: newW,
              targetHeight: newH,
              maintainAspect: lockAspect ?? true,
              status: 'idle',
              resultBlob: undefined,
            }
          : f
      )
    );
  };

  const scaleByPercent = (percent: number) => {
    if (!selected) return;
    const factor = percent / 100;
    const newW = Math.max(1, Math.round(selected.originalDims.width * factor));
    const newH = Math.max(1, Math.round(selected.originalDims.height * factor));
    updateSelectedDimensions(newW, newH, true);
  };

  const resizeSingle = async (index: number) => {
    const item = files[index];
    setFiles((prev) =>
      prev.map((it, i) => (i === index ? { ...it, status: 'processing', error: undefined } : it))
    );

    try {
      const res = await processImage(item.file, {
        format,
        quality,
        resizeMode: 'custom',
        targetWidth: item.targetWidth,
        targetHeight: item.targetHeight,
        maintainAspectRatio: false, // target dimensions already calculated
      });

      setFiles((prev) =>
        prev.map((it, i) =>
          i === index ? { ...it, status: 'done', resultBlob: res.blob } : it
        )
      );
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((it, i) =>
          i === index ? { ...it, status: 'error', error: err.message || 'Resize failed' } : it
        )
      );
    }
  };

  const resizeAll = async () => {
    setIsProcessing(true);
    for (let i = 0; i < files.length; i++) {
      await resizeSingle(i);
    }
    setIsProcessing(false);
  };

  const downloadItem = (item: ResizableFile) => {
    if (!item.resultBlob) return;
    const ext = FORMAT_EXT_MAP[format];
    const name = generateOutputFilename(
      item.file.name,
      `${item.targetWidth}x${item.targetHeight}`,
      ext
    );
    downloadBlob(item.resultBlob, name);
  };

  const downloadAllZip = async () => {
    const ready = files.filter((f) => f.resultBlob);
    if (ready.length === 0) return;

    const zipItems = ready.map((f) => ({
      name: generateOutputFilename(
        f.file.name,
        `${f.targetWidth}x${f.targetHeight}`,
        FORMAT_EXT_MAP[format]
      ),
      blob: f.resultBlob!,
    }));

    await downloadZip(zipItems, 'juantamad-resized-images.zip');
  };

  const removeFile = (index: number) => {
    const item = files[index];
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (selectedIndex >= index && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const clearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setSelectedIndex(0);
  };

  const isUpscaling =
    selected &&
    (selected.targetWidth > selected.originalDims.width ||
      selected.targetHeight > selected.originalDims.height);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Precise Dimension Scaling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
            Image Resizer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Resize photos and graphics by exact pixels or percentage scale while locking aspect ratios.
          </p>
        </div>

        {files.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={resizeAll}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Resize All ({files.length})</span>
            </button>
            <button
              onClick={downloadAllZip}
              disabled={!files.some((f) => f.resultBlob)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Archive className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
            <button
              onClick={clearAll}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <PrivacyNotice toolName="Image Resizer" />

      {files.length === 0 ? (
        <div className="max-w-2xl mx-auto py-8">
          <Dropzone
            onFilesSelected={handleFiles}
            accept="image/*"
            title="Drop image files here to resize"
            description="Supports PNG, JPG, WebP, AVIF, and GIF. Batch resizing enabled."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Preview & File Queue */}
          <div className="lg:col-span-8 space-y-6">
            {selected && (
              <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#27272A]">
                  <div className="truncate">
                    <span className="font-semibold text-[#09090B] dark:text-white text-sm truncate block">
                      {selected.file.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      Original: {selected.originalDims.width} × {selected.originalDims.height} px (
                      {formatFileSize(selected.file.size)})
                    </span>
                  </div>

                  {selected.status === 'done' && selected.resultBlob && (
                    <button
                      onClick={() => downloadItem(selected)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  )}
                </div>

                {/* Preview Image */}
                <div className="relative h-72 sm:h-96 rounded-xl bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-[#000000] border border-slate-200 dark:border-[#27272A] flex items-center justify-center p-4 overflow-hidden">
                  <img
                    src={selected.previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain shadow-sm rounded"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md text-xs text-white font-medium">
                    Target: {selected.targetWidth} × {selected.targetHeight} px
                  </div>
                </div>

                {isUpscaling && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Upscaling warning: Target dimensions exceed the original resolution. Upscaling may result in pixelation or blurriness.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Queue */}
            <div className="bg-white dark:bg-[#09090B] rounded-2xl p-4 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Files Queue ({files.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {files.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`cursor-pointer p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      idx === selectedIndex
                        ? 'border-[var(--accent-text)]/50 bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)]'
                        : 'border-slate-200 dark:border-[#27272A] hover:bg-slate-50 dark:hover:bg-[#27272A]/50'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="font-medium text-[#27272A] dark:text-slate-200 truncate">
                        {item.file.name}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {item.targetWidth}×{item.targetHeight}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="text-slate-400 hover:text-[var(--accent-text)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Dropzone
                  onFilesSelected={handleFiles}
                  compact
                  accept="image/*"
                  title="Add more files"
                  description="Drop more images here"
                />
              </div>
            </div>
          </div>

          {/* Right: Dimension Form Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-5">
              <h3 className="font-bold text-[#09090B] dark:text-white text-base pb-2 border-b border-slate-100 dark:border-[#27272A]">
                Resize Options
              </h3>

              {/* Social Media & Screen Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Social Media Presets
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {[
                    { label: 'IG Square', w: 1080, h: 1080 },
                    { label: 'IG Portrait', w: 1080, h: 1350 },
                    { label: 'Story/TikTok', w: 1080, h: 1920 },
                    { label: 'YouTube Thm', w: 1280, h: 720 },
                    { label: 'Twitter/X Post', w: 1200, h: 675 },
                    { label: 'LinkedIn Post', w: 1200, h: 627 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => updateSelectedDimensions(preset.w, preset.h, false)}
                      className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[var(--accent-text)]/50 text-slate-700 dark:text-slate-300 text-left truncate font-medium"
                    >
                      <span className="block font-semibold">{preset.label}</span>
                      <span className="text-[10px] text-slate-400">{preset.w}×{preset.h}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Percentage scaling shortcuts */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quick Scale (%)
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => scaleByPercent(pct)}
                      className="py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[var(--accent-text)]/50 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact dimensions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Exact Pixels
                  </label>
                  <button
                    onClick={() =>
                      updateSelectedDimensions(undefined, undefined, !selected?.maintainAspect)
                    }
                    className={`flex items-center space-x-1 text-xs px-2 py-0.5 rounded border transition-colors ${
                      selected?.maintainAspect
                        ? 'border-[var(--accent-text)]/50 text-[var(--accent-hover)] dark:text-[var(--accent-text)] bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)]'
                        : 'border-slate-300 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {selected?.maintainAspect ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{selected?.maintainAspect ? 'Locked' : 'Unlocked'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-500 mb-1 block">Width (px)</label>
                    <input
                      type="number"
                      value={selected?.targetWidth || ''}
                      onChange={(e) =>
                        updateSelectedDimensions(
                          e.target.value ? Math.max(1, parseInt(e.target.value, 10)) : 1,
                          undefined
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 mb-1 block">Height (px)</label>
                    <input
                      type="number"
                      value={selected?.targetHeight || ''}
                      onChange={(e) =>
                        updateSelectedDimensions(
                          undefined,
                          e.target.value ? Math.max(1, parseInt(e.target.value, 10)) : 1
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Format selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#27272A]">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Save Format
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['webp', 'jpeg', 'png'] as OutputFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`py-1.5 uppercase font-bold rounded-lg border ${
                        format === fmt
                          ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resize Action */}
              <button
                onClick={() => resizeSingle(selectedIndex)}
                disabled={selected?.status === 'processing'}
                className="w-full py-3 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${selected?.status === 'processing' ? 'animate-spin' : ''}`}
                />
                <span>Resize This Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
