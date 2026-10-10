import React, { useState } from 'react';
import {
  Maximize2,
  Download,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Crop,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { applyPerspectiveTilt } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageTiltPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [tiltH, setTiltH] = useState<number>(0); // -45 to 45
  const [tiltV, setTiltV] = useState<number>(0); // -45 to 45
  const [autoCrop, setAutoCrop] = useState<boolean>(true);
  const [tiltedBlob, setTiltedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setTiltedBlob(null);
    setTiltH(0);
    setTiltV(0);
    const url = URL.createObjectURL(f);
    setImageSrc(url);
  };

  const handleTilt = async () => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      const canvas = await applyPerspectiveTilt(img, tiltH, tiltV, autoCrop);

      const mime = file.type || 'image/png';
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), mime, 0.95)
      );
      setTiltedBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!tiltedBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop() || 'png';
    downloadBlob(tiltedBlob, `${base}-perspective.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Perspective Warp Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Tilt &amp; Perspective Warp
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Fix keystone distortion, architectural perspective, and skewed camera angles with 3D quad warp directly in your browser.
        </p>
      </div>

      <PrivacyNotice toolName="Tilt & Perspective" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to adjust perspective"
          description="Fix document scans, whiteboard photos, and tilted buildings"
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
                setTiltedBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Perspective Tilt Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A]">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Horizontal Perspective Skew</span>
                <span className="font-bold text-[var(--accent-text)]">{tiltH}°</span>
              </div>
              <input
                type="range"
                min="-35"
                max="35"
                value={tiltH}
                onChange={(e) => {
                  setTiltH(Number(e.target.value));
                  setTiltedBlob(null);
                }}
                className="w-full accent-[var(--accent-text)]"
              />
              <p className="text-[10px] text-slate-400">Corrects side-angle angled shots</p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A]">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Vertical Perspective Tilt</span>
                <span className="font-bold text-[var(--accent-text)]">{tiltV}°</span>
              </div>
              <input
                type="range"
                min="-35"
                max="35"
                value={tiltV}
                onChange={(e) => {
                  setTiltV(Number(e.target.value));
                  setTiltedBlob(null);
                }}
                className="w-full accent-[var(--accent-text)]"
              />
              <p className="text-[10px] text-slate-400">Corrects top-down or looking-up distortion</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoCrop"
              checked={autoCrop}
              onChange={(e) => setAutoCrop(e.target.checked)}
              className="rounded text-[var(--accent-text)] focus:ring-[var(--accent-text)]/50"
            />
            <label htmlFor="autoCrop" className="text-xs text-slate-600 dark:text-slate-400">
              Auto-crop empty boundary margins generated by 3D projection
            </label>
          </div>

          {/* Perspective Preview Box */}
          <div className="relative w-full max-h-[460px] overflow-hidden rounded-xl border border-slate-200 dark:border-[#27272A] bg-[#000000] p-6 flex items-center justify-center [perspective:800px]">
            <img
              src={imageSrc}
              alt="Tilt preview"
              className="max-h-[400px] w-auto max-w-full object-contain transition-transform duration-150"
              style={{
                transform: `rotateY(${tiltH}deg) rotateX(${-tiltV}deg)`,
              }}
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleTilt}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Warping Perspective...' : 'Render Corrected Perspective'}</span>
            </button>

            {tiltedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Corrected Image ({formatFileSize(tiltedBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
