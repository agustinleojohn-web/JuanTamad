import React, { useState } from 'react';
import {
  Sliders,
  Download,
  Trash2,
  RefreshCw,
  Sun,
  Contrast,
  Thermometer,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import {
  applyImageAdjustments,
  ImageAdjustmentOptions,
} from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageAdjustPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [adjustedBlob, setAdjustedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [options, setOptions] = useState<ImageAdjustmentOptions>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    warmth: 0,
    vignette: 0,
    sharpen: 0,
  });

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setAdjustedBlob(null);
    const url = URL.createObjectURL(f);
    setImageSrc(url);
    resetSliders();
  };

  const resetSliders = () => {
    setOptions({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      warmth: 0,
      vignette: 0,
      sharpen: 0,
    });
    setAdjustedBlob(null);
  };

  const updateOpt = (key: keyof ImageAdjustmentOptions, val: number) => {
    setOptions((prev) => ({ ...prev, [key]: val }));
    setAdjustedBlob(null);
  };

  const handleApply = async () => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      const canvas = await applyImageAdjustments(img, options);

      const mime = file.type || 'image/png';
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), mime, 0.95)
      );
      setAdjustedBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!adjustedBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop() || 'png';
    downloadBlob(adjustedBlob, `${base}-adjusted.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>Professional Color Grading</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Image Adjustment Lab
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Precision light, exposure, contrast, tone curves, temperature warmth, and vignette controls with live feedback.
        </p>
      </div>

      <PrivacyNotice toolName="Image Adjust" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to adjust colors &amp; lighting"
          description="Supports high dynamic range JPEG, PNG, WebP, and AVIF"
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Size: {formatFileSize(file.size)}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetSliders}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all</span>
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setImageSrc(null);
                  setAdjustedBlob(null);
                }}
                className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Change image</span>
              </button>
            </div>
          </div>

          {/* Adjustment Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Exposure</span>
                <span>{options.exposure}</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                value={options.exposure}
                onChange={(e) => updateOpt('exposure', Number(e.target.value))}
                className="w-full accent-[#730000]"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Contrast</span>
                <span>{options.contrast}</span>
              </div>
              <input
                type="range"
                min="-70"
                max="70"
                value={options.contrast}
                onChange={(e) => updateOpt('contrast', Number(e.target.value))}
                className="w-full accent-[#730000]"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Brightness</span>
                <span>{options.brightness}</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                value={options.brightness}
                onChange={(e) => updateOpt('brightness', Number(e.target.value))}
                className="w-full accent-[#730000]"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Saturation</span>
                <span>{options.saturation}</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                value={options.saturation}
                onChange={(e) => updateOpt('saturation', Number(e.target.value))}
                className="w-full accent-[#730000]"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Warmth / Temperature</span>
                <span>{options.warmth}</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                value={options.warmth}
                onChange={(e) => updateOpt('warmth', Number(e.target.value))}
                className="w-full accent-[#730000]"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Vignette Effect</span>
                <span>{options.vignette}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={options.vignette}
                onChange={(e) => updateOpt('vignette', Number(e.target.value))}
                className="w-full accent-[#730000]"
              />
            </div>
          </div>

          {/* Live Preview Display */}
          <div className="relative w-full max-h-[460px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-2 flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Adjustment preview"
              className="max-h-[440px] w-auto max-w-full object-contain"
              style={{
                filter: `brightness(${100 + options.brightness + options.exposure * 0.8}%) contrast(${100 + options.contrast}%) saturate(${100 + options.saturation}%) sepia(${options.warmth > 0 ? options.warmth * 0.5 : 0}%) hue-rotate(${options.warmth < 0 ? options.warmth * 0.4 : 0}deg)`,
              }}
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Rendering Adjustments...' : 'Apply Color Tuning'}</span>
            </button>

            {adjustedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#730000]/50 dark:hover:bg-[#730000] dark:text-slate-950 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Adjusted Image ({formatFileSize(adjustedBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
