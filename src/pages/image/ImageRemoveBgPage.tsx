import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Eye,
  Palette,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { removeImageBackground } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageRemoveBgPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState<number>(32);
  const [bgChoice, setBgChoice] = useState<'transparent' | '#ffffff' | '#000000' | 'custom'>('transparent');
  const [customBgColor, setCustomBgColor] = useState<string>('#3b82f6');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setResultUrl(null);
    setResultBlob(null);

    const url = URL.createObjectURL(f);
    setImageSrc(url);
  };

  const handleRemoveBackground = async () => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      const fill = bgChoice === 'transparent' ? undefined : bgChoice === 'custom' ? customBgColor : bgChoice;
      const canvas = await removeImageBackground(img, tolerance, fill);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(resultBlob, `${base}-nobg.png`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Alpha Matting</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Remove Background
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Automatically isolate subjects and extract transparent PNGs or custom solid backdrops directly in your browser.
        </p>
      </div>

      <PrivacyNotice toolName="Remove Background" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to remove background"
          description="Works best with portraits, logos, products, and stickers"
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
                setResultUrl(null);
                setResultBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Color Edge Sensitivity</span>
                </span>
                <span>{tolerance}</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={tolerance}
                onChange={(e) => {
                  setTolerance(Number(e.target.value));
                  setResultBlob(null);
                }}
                className="w-full accent-[var(--accent-text)]"
              />
              <p className="text-[11px] text-slate-400">
                Increase if background remains; decrease if subject edges are cut
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Replacement Background
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'transparent', label: 'Transparent' },
                  { id: '#ffffff', label: 'Pure White' },
                  { id: '#000000', label: 'Solid Black' },
                  { id: 'custom', label: 'Custom Color' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setBgChoice(bg.id as any);
                      setResultBlob(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      bgChoice === bg.id
                        ? 'bg-[var(--accent)] border-[var(--accent-text)] text-white'
                        : 'border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
                {bgChoice === 'custom' && (
                  <input
                    type="color"
                    value={customBgColor}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Visual Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Original Image
              </span>
              <div className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-[#000000] p-2 flex items-center justify-center min-h-[240px]">
                <img
                  src={imageSrc}
                  alt="Original"
                  className="max-h-[260px] w-auto object-contain"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Extracted Result
              </span>
              <div
                className="rounded-xl border border-slate-200 dark:border-[#27272A] p-2 flex items-center justify-center min-h-[240px]"
                style={{
                  backgroundImage:
                    bgChoice === 'transparent'
                      ? 'radial-gradient(#94a3b8 1px, transparent 1px)'
                      : undefined,
                  backgroundSize: '16px 16px',
                  backgroundColor: bgChoice !== 'transparent' ? (bgChoice === 'custom' ? customBgColor : bgChoice) : '#0f172a',
                }}
              >
                {resultUrl ? (
                  <img
                    src={resultUrl}
                    alt="No background"
                    className="max-h-[260px] w-auto object-contain"
                  />
                ) : (
                  <div className="text-xs text-slate-400 text-center">
                    Click "Remove Background" below to generate cut-out
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRemoveBackground}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Extracting Foreground...' : 'Remove Background Now'}</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Clean PNG ({formatFileSize(resultBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
