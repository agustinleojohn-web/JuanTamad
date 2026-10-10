import React, { useState, useRef } from 'react';
import {
  EyeOff,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { applyCensorBoxes, BlurBox } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageBlurFacePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [censorType, setCensorType] = useState<'pixelate' | 'blur' | 'blackout'>('pixelate');
  const [boxes, setBoxes] = useState<BlurBox[]>([
    { id: '1', x: 35, y: 20, width: 30, height: 35, mode: 'pixelate' },
  ]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setResultBlob(null);

    const url = URL.createObjectURL(f);
    setImageSrc(url);
    setBoxes([{ id: '1', x: 35, y: 20, width: 30, height: 35, mode: censorType }]);
  };

  const addBox = () => {
    const id = Date.now().toString();
    setBoxes([...boxes, { id, x: 25, y: 25, width: 25, height: 25, mode: censorType }]);
  };

  const removeBox = (id: string) => {
    setBoxes(boxes.filter((b) => b.id !== id));
  };

  const updateBox = (id: string, partial: Partial<BlurBox>) => {
    setBoxes(boxes.map((b) => (b.id === id ? { ...b, ...partial } : b)));
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

      const updatedBoxes = boxes.map((b) => ({ ...b, mode: censorType }));
      const canvas = await applyCensorBoxes(img, updatedBoxes);

      const mime = file.type || 'image/png';
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), mime, 0.95)
      );
      setResultBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop() || 'png';
    downloadBlob(resultBlob, `${base}-censored.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Face Blur &amp; Censor Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Blur Faces &amp; Sensitive Data
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Censor faces, license plates, barcodes, or confidential details with mosaic pixelate, gaussian blur, or blackout bars.
        </p>
      </div>

      <PrivacyNotice toolName="Blur Faces" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to censor faces"
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
                setResultBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Censor Style:
              </span>
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-[#27272A]">
                {[
                  { id: 'pixelate', label: 'Mosaic Pixelate' },
                  { id: 'blur', label: 'Gaussian Blur' },
                  { id: 'blackout', label: 'Blackout Bar' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCensorType(s.id as any)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      censorType === s.id
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={addBox}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#27272A] flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>Add Censor Box</span>
            </button>
          </div>

          {/* Interactive Preview Container */}
          <div className="relative w-full max-h-[500px] overflow-hidden rounded-xl border border-slate-200 dark:border-[#27272A] bg-[#000000] flex items-center justify-center select-none">
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Preview"
              className="max-h-[480px] w-auto max-w-full object-contain pointer-events-none"
            />

            {/* Rendered Censor Boxes */}
            {boxes.map((box, idx) => (
              <div
                key={box.id}
                className="absolute border-2 border-rose-500 bg-rose-500/20 backdrop-blur-md cursor-move flex items-center justify-center text-white text-[11px] font-bold"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
              >
                <span>Censor #{idx + 1}</span>
              </div>
            ))}
          </div>

          {/* Box Position Adjusters */}
          <div className="space-y-3">
            {boxes.map((box, idx) => (
              <div
                key={box.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Box #{idx + 1}
                  </span>
                  {boxes.length > 1 && (
                    <button
                      onClick={() => removeBox(box.id)}
                      className="text-[var(--accent-text)] hover:underline text-[11px]"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">X Position: {Math.round(box.x)}%</span>
                    <input
                      type="range"
                      min="0"
                      max={100 - box.width}
                      value={box.x}
                      onChange={(e) => updateBox(box.id, { x: Number(e.target.value) })}
                      className="w-full accent-[var(--accent-text)]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Y Position: {Math.round(box.y)}%</span>
                    <input
                      type="range"
                      min="0"
                      max={100 - box.height}
                      value={box.y}
                      onChange={(e) => updateBox(box.id, { y: Number(e.target.value) })}
                      className="w-full accent-[var(--accent-text)]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Width: {Math.round(box.width)}%</span>
                    <input
                      type="range"
                      min="5"
                      max={100 - box.x}
                      value={box.width}
                      onChange={(e) => updateBox(box.id, { width: Number(e.target.value) })}
                      className="w-full accent-[var(--accent-text)]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Height: {Math.round(box.height)}%</span>
                    <input
                      type="range"
                      min="5"
                      max={100 - box.y}
                      value={box.height}
                      onChange={(e) => updateBox(box.id, { height: Number(e.target.value) })}
                      className="w-full accent-[var(--accent-text)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Applying Censors...' : 'Apply Censor Mask'}</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Censored Image ({formatFileSize(resultBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
