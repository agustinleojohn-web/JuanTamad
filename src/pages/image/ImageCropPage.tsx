import React, { useState, useRef, useEffect } from 'react';
import {
  Crop as CropIcon,
  Download,
  Trash2,
  RefreshCw,
  RotateCw,
  Maximize2,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

interface AspectRatioPreset {
  label: string;
  ratio: number | null; // width / height, or null for freeform
}

const PRESETS: AspectRatioPreset[] = [
  { label: 'Freeform', ratio: null },
  { label: '1:1 Square', ratio: 1 },
  { label: '4:5 Instagram', ratio: 4 / 5 },
  { label: '16:9 Landscape', ratio: 16 / 9 },
  { label: '9:16 Story/Reels', ratio: 9 / 16 },
  { label: '4:3 Standard', ratio: 4 / 3 },
  { label: '3:2 Photography', ratio: 3 / 2 },
];

export const ImageCropPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Crop rectangle percentages (0 - 100)
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 10,
    y: 10,
    w: 80,
    h: 80,
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setCroppedBlob(null);
    const url = URL.createObjectURL(f);
    setImageSrc(url);
    setCropRect({ x: 10, y: 10, w: 80, h: 80 });
  };

  const applyRatio = (ratio: number | null) => {
    setSelectedRatio(ratio);
    if (!ratio) return;

    if (!imgRef.current) return;
    const imgAspect = imgRef.current.naturalWidth / imgRef.current.naturalHeight;

    if (ratio > imgAspect) {
      // Wider than image
      const w = 90;
      const h = (w / ratio) * imgAspect;
      setCropRect({ x: 5, y: Math.max(0, (100 - h) / 2), w, h });
    } else {
      // Taller than image
      const h = 90;
      const w = (h * ratio) / imgAspect;
      setCropRect({ x: Math.max(0, (100 - w) / 2), y: 5, w, h });
    }
  };

  const handleExecuteCrop = async () => {
    if (!imgRef.current || !file) return;
    setIsProcessing(true);

    try {
      const img = imgRef.current;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      const sx = (cropRect.x / 100) * nw;
      const sy = (cropRect.y / 100) * nh;
      const sw = (cropRect.w / 100) * nw;
      const sh = (cropRect.h / 100) * nh;

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sw));
      canvas.height = Math.max(1, Math.round(sh));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to create canvas context');

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      const mime = file.type || 'image/png';
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), mime, 0.95)
      );
      setCroppedBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!croppedBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop() || 'png';
    downloadBlob(croppedBlob, `${base}-cropped.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <CropIcon className="w-3.5 h-3.5" />
          <span>Precision Crop</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Crop Image
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Trim margins, adjust aspect ratios, and export clean pixel-perfect crops directly in your browser.
        </p>
      </div>

      <PrivacyNotice toolName="Crop Image" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to crop"
          description="Supports JPG, PNG, WebP, AVIF, and HEIC"
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
                setImageSrc(null);
                setCroppedBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Aspect Ratio Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Aspect Ratio Preset
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyRatio(p.ratio)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedRatio === p.ratio
                      ? 'bg-[var(--accent)] border-[var(--accent-text)] text-white'
                      : 'border-slate-200 dark:border-[#27272A] hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Crop Visualizer */}
          <div
            ref={containerRef}
            className="relative w-full max-h-[500px] overflow-hidden rounded-xl border border-slate-200 dark:border-[#27272A] bg-[#000000] flex items-center justify-center select-none"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Source to crop"
              className="max-h-[480px] w-auto max-w-full object-contain pointer-events-none"
            />

            {/* Crop Overlay Mask */}
            <div
              className="absolute border-2 border-[var(--accent-text)]/40 bg-[var(--accent-text)]/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move"
              style={{
                left: `${cropRect.x}%`,
                top: `${cropRect.y}%`,
                width: `${cropRect.w}%`,
                height: `${cropRect.h}%`,
              }}
            >
              {/* Corner handles */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-white border border-[var(--accent-text)] -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-white border border-[var(--accent-text)] translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-white border border-[var(--accent-text)] -translate-x-1/2 translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-[var(--accent-text)] translate-x-1/2 translate-y-1/2" />
            </div>
          </div>

          {/* Manual crop size sliders */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Left ({Math.round(cropRect.x)}%)</span>
              <input
                type="range"
                min="0"
                max={Math.max(0, 100 - cropRect.w)}
                value={cropRect.x}
                onChange={(e) => setCropRect({ ...cropRect, x: Number(e.target.value) })}
                className="w-full accent-[var(--accent-text)]"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Top ({Math.round(cropRect.y)}%)</span>
              <input
                type="range"
                min="0"
                max={Math.max(0, 100 - cropRect.h)}
                value={cropRect.y}
                onChange={(e) => setCropRect({ ...cropRect, y: Number(e.target.value) })}
                className="w-full accent-[var(--accent-text)]"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Width ({Math.round(cropRect.w)}%)</span>
              <input
                type="range"
                min="10"
                max={100 - cropRect.x}
                value={cropRect.w}
                onChange={(e) => setCropRect({ ...cropRect, w: Number(e.target.value) })}
                className="w-full accent-[var(--accent-text)]"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Height ({Math.round(cropRect.h)}%)</span>
              <input
                type="range"
                min="10"
                max={100 - cropRect.y}
                value={cropRect.h}
                onChange={(e) => setCropRect({ ...cropRect, h: Number(e.target.value) })}
                className="w-full accent-[var(--accent-text)]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExecuteCrop}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Cropping...' : 'Apply Crop'}</span>
            </button>

            {croppedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Cropped ({formatFileSize(croppedBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
