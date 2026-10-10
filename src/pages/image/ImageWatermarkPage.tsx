import React, { useState } from 'react';
import {
  Stamp,
  Download,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageWatermarkPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [opacity, setOpacity] = useState<number>(45);
  const [fontSize, setFontSize] = useState<number>(36);
  const [angle, setAngle] = useState<number>(-30);
  const [position, setPosition] = useState<'center' | 'repeat' | 'bottom-right'>('repeat');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [watermarkedBlob, setWatermarkedBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setWatermarkedBlob(null);
    const url = URL.createObjectURL(f);
    setImageSrc(url);
  };

  const handleApplyWatermark = async () => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(img, 0, 0);

      ctx.save();
      ctx.fillStyle = textColor;
      ctx.globalAlpha = opacity / 100;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (position === 'center') {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.fillText(watermarkText, 0, 0);
      } else if (position === 'bottom-right') {
        ctx.textAlign = 'right';
        ctx.fillText(watermarkText, canvas.width - 30, canvas.height - 30);
      } else {
        // Repeated tiled diagonal pattern
        const stepX = 280;
        const stepY = 180;
        for (let y = 50; y < canvas.height + 200; y += stepY) {
          for (let x = -100; x < canvas.width + 200; x += stepX) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((angle * Math.PI) / 180);
            ctx.fillText(watermarkText, 0, 0);
            ctx.restore();
          }
        }
      }

      ctx.restore();

      const mime = file.type || 'image/png';
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), mime, 0.95)
      );
      setWatermarkedBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop() || 'png';
    downloadBlob(watermarkedBlob, `${base}-watermarked.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Stamp className="w-3.5 h-3.5" />
          <span>Copyright Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Watermark Image
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Stamp custom text or diagonal copyright patterns with live opacity, angle, and position controls.
        </p>
      </div>

      <PrivacyNotice toolName="Watermark Image" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to add watermark"
          description="Supports JPG, PNG, and WebP"
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
                setWatermarkedBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Watermark Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Watermark Text
            </label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => {
                setWatermarkText(e.target.value);
                setWatermarkedBlob(null);
              }}
              placeholder="e.g. COPYRIGHT © 2026, DO NOT COPY"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-xs sm:text-sm text-[#09090B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-text)]/50"
            />
          </div>

          {/* Placement and Style Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Watermark Pattern
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'repeat', label: 'Diagonal Tiled Pattern' },
                  { id: 'center', label: 'Single Centered Badge' },
                  { id: 'bottom-right', label: 'Bottom Right Signature' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPosition(p.id as any);
                      setWatermarkedBlob(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-left transition-colors ${
                      position === p.id
                        ? 'bg-[var(--accent)] border-[var(--accent-text)] text-white'
                        : 'border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Opacity</span>
                  <span>{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => {
                    setOpacity(Number(e.target.value));
                    setWatermarkedBlob(null);
                  }}
                  className="w-full accent-[var(--accent-text)]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Angle</span>
                  <span>{angle}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={angle}
                  onChange={(e) => {
                    setAngle(Number(e.target.value));
                    setWatermarkedBlob(null);
                  }}
                  className="w-full accent-[var(--accent-text)]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Font Size</span>
                  <span>{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="72"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(Number(e.target.value));
                    setWatermarkedBlob(null);
                  }}
                  className="w-full accent-[var(--accent-text)]"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Color
                </span>
                <div className="flex items-center space-x-2 pt-1">
                  {['#ffffff', '#000000', '#ef4444', '#f59e0b'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setTextColor(c);
                        setWatermarkedBlob(null);
                      }}
                      className={`w-6 h-6 rounded-full border border-slate-300 ${
                        textColor === c ? 'ring-2 ring-[var(--accent-text)]/50' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApplyWatermark}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Stamping Watermark...' : 'Apply Watermark'}</span>
            </button>

            {watermarkedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Watermarked Image ({formatFileSize(watermarkedBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
