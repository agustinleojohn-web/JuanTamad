import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Maximize2,
  Split,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { upscaleImage } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageUpscalePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scaleFactor, setScaleFactor] = useState<2 | 4>(2);
  const [sharpenAmount, setSharpenAmount] = useState<number>(35);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [upscaledBlob, setUpscaledBlob] = useState<Blob | null>(null);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);
  const [upscaledDims, setUpscaledDims] = useState<{ w: number; h: number } | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setUpscaledUrl(null);
    setUpscaledBlob(null);

    const url = URL.createObjectURL(f);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      setOriginalDims({ w: img.width, h: img.height });
    };
    img.src = url;
  };

  const handleUpscale = async () => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      const canvas = await upscaleImage(img, scaleFactor, sharpenAmount);
      setUpscaledDims({ w: canvas.width, h: canvas.height });

      const mime = file.type || 'image/png';
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), mime, 0.95)
      );

      setUpscaledBlob(blob);
      setUpscaledUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!upscaledBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop() || 'png';
    downloadBlob(upscaledBlob, `${base}-${scaleFactor}x-upscaled.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Super-Resolution Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          AI Image Upscaler
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Upscale low-resolution photos 2x or 4x with bicubic detail recovery, unsharp masking, and zero cloud uploads.
        </p>
      </div>

      <PrivacyNotice toolName="Image Upscaler" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to upscale"
          description="Enhance resolution by 200% or 400% on your device"
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Original: {originalDims ? `${originalDims.w} × ${originalDims.h} px` : ''} ({formatFileSize(file.size)})
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setImageSrc(null);
                setUpscaledUrl(null);
                setUpscaledBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Upscale Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upscale Factor
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setScaleFactor(2);
                    setUpscaledBlob(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    scaleFactor === 2
                      ? 'bg-[var(--accent)] border-[var(--accent-text)] text-white'
                      : 'border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  2x (Double Resolution)
                </button>
                <button
                  onClick={() => {
                    setScaleFactor(4);
                    setUpscaledBlob(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    scaleFactor === 4
                      ? 'bg-[var(--accent)] border-[var(--accent-text)] text-white'
                      : 'border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  4x (Quadruple Resolution)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Detail Sharpening</span>
                </span>
                <span>{sharpenAmount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={sharpenAmount}
                onChange={(e) => {
                  setSharpenAmount(Number(e.target.value));
                  setUpscaledBlob(null);
                }}
                className="w-full accent-[var(--accent-text)]"
              />
              <p className="text-[11px] text-slate-400">
                Recovers sharp edges while suppressing noise artifacts
              </p>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Original Image
              </span>
              <div className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-[#000000] p-2 flex items-center justify-center min-h-[240px]">
                <img
                  src={imageSrc}
                  alt="Original preview"
                  className="max-h-[280px] w-auto object-contain"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Upscaled Result {upscaledDims ? `(${upscaledDims.w} × ${upscaledDims.h} px)` : ''}
              </span>
              <div className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-[#000000] p-2 flex items-center justify-center min-h-[240px]">
                {upscaledUrl ? (
                  <img
                    src={upscaledUrl}
                    alt="Upscaled preview"
                    className="max-h-[280px] w-auto object-contain"
                  />
                ) : (
                  <div className="text-xs text-slate-500 text-center">
                    Click "Upscale Image" below to render enhanced result
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpscale}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Upscaling Image...' : `Upscale to ${scaleFactor}x Resolution`}</span>
            </button>

            {upscaledBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Upscaled ({formatFileSize(upscaledBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
