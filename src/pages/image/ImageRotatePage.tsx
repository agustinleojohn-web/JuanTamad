import React, { useState } from 'react';
import {
  RotateCw,
  RotateCcw,
  Download,
  Trash2,
  RefreshCw,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageRotatePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [angle, setAngle] = useState<number>(0); // -180 to 180
  const [rotatedBlob, setRotatedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setRotatedBlob(null);
    setAngle(0);
    const url = URL.createObjectURL(f);
    setImageSrc(url);
  };

  const handleRotate = async () => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      const rad = (angle * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));

      // Bounding box size to avoid clipping
      const newWidth = Math.round(img.width * cos + img.height * sin);
      const newHeight = Math.round(img.width * sin + img.height * cos);

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const mime = file.type || 'image/png';
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), mime, 0.95)
      );
      setRotatedBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!rotatedBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop() || 'png';
    downloadBlob(rotatedBlob, `${base}-rotated-${angle}deg.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <RotateCw className="w-3.5 h-3.5" />
          <span>Precision Angular Rotation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Rotate Image
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Rotate to any custom angle (-180° to +180°) with auto-expanded canvas bounds or 90° batch steps.
        </p>
      </div>

      <PrivacyNotice toolName="Rotate Image" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to rotate"
          description="Supports precision straightening and 90° orientation correction"
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
                setRotatedBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* 90-degree step buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Quick Steps:
            </span>
            <button
              onClick={() => {
                setAngle((prev) => (prev - 90 < -180 ? prev - 90 + 360 : prev - 90));
                setRotatedBlob(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center space-x-1 hover:bg-slate-50 dark:hover:bg-[#27272A]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>-90° Left</span>
            </button>
            <button
              onClick={() => {
                setAngle((prev) => (prev + 90 > 180 ? prev + 90 - 360 : prev + 90));
                setRotatedBlob(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center space-x-1 hover:bg-slate-50 dark:hover:bg-[#27272A]"
            >
              <RotateCw className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>+90° Right</span>
            </button>
            <button
              onClick={() => {
                setAngle(180);
                setRotatedBlob(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#27272A]"
            >
              180° Flip
            </button>
            <button
              onClick={() => {
                setAngle(0);
                setRotatedBlob(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-400 hover:text-slate-700"
            >
              Reset 0°
            </button>
          </div>

          {/* Continuous Angle Slider & Compass */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A]">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Arbitrary Angle Dial:</span>
              </span>
              <span className="text-sm font-bold text-[var(--accent-text)]">{angle}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={angle}
              onChange={(e) => {
                setAngle(Number(e.target.value));
                setRotatedBlob(null);
              }}
              className="w-full accent-[var(--accent-text)]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 px-1">
              <span>-180°</span>
              <span>-90°</span>
              <span>0°</span>
              <span>+90°</span>
              <span>+180°</span>
            </div>
          </div>

          {/* Preview Viewport */}
          <div className="relative w-full max-h-[460px] overflow-hidden rounded-xl border border-slate-200 dark:border-[#27272A] bg-[#000000] p-4 flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Rotation preview"
              className="max-h-[420px] w-auto max-w-full object-contain transition-transform"
              style={{
                transform: `rotate(${angle}deg)`,
              }}
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRotate}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Rendering Rotation...' : `Apply ${angle}° Rotation`}</span>
            </button>

            {rotatedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Rotated Image ({formatFileSize(rotatedBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
