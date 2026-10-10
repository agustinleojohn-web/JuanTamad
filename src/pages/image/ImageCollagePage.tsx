import React, { useState } from 'react';
import {
  LayoutGrid,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageCollagePage: React.FC = () => {
  const [images, setImages] = useState<Array<{ id: string; file: File; url: string }>>([]);
  const [layout, setLayout] = useState<'2-horizontal' | '2-vertical' | '3-columns' | '4-grid' | '6-grid'>('4-grid');
  const [gap, setGap] = useState<number>(12);
  const [borderRadius, setBorderRadius] = useState<number>(12);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [collageBlob, setCollageBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    const newItems = files.map((f) => ({
      id: Math.random().toString(),
      file: f,
      url: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newItems]);
    setCollageBlob(null);
  };

  const removeImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
    setCollageBlob(null);
  };

  const handleRenderCollage = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const loadedImgs = await Promise.all(
        images.map(
          (imgItem) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const el = new Image();
              el.onload = () => resolve(el);
              el.onerror = reject;
              el.src = imgItem.url;
            })
        )
      );

      const targetW = 1200;
      let targetH = 1200;

      // Define grid cells based on layout
      let cells: Array<{ x: number; y: number; w: number; h: number }> = [];

      if (layout === '2-horizontal') {
        targetH = 600;
        const cellW = (targetW - gap * 3) / 2;
        const cellH = targetH - gap * 2;
        cells = [
          { x: gap, y: gap, w: cellW, h: cellH },
          { x: gap * 2 + cellW, y: gap, w: cellW, h: cellH },
        ];
      } else if (layout === '2-vertical') {
        targetH = 1200;
        const cellW = targetW - gap * 2;
        const cellH = (targetH - gap * 3) / 2;
        cells = [
          { x: gap, y: gap, w: cellW, h: cellH },
          { x: gap, y: gap * 2 + cellH, w: cellW, h: cellH },
        ];
      } else if (layout === '3-columns') {
        targetH = 600;
        const cellW = (targetW - gap * 4) / 3;
        const cellH = targetH - gap * 2;
        cells = [
          { x: gap, y: gap, w: cellW, h: cellH },
          { x: gap * 2 + cellW, y: gap, w: cellW, h: cellH },
          { x: gap * 3 + cellW * 2, y: gap, w: cellW, h: cellH },
        ];
      } else if (layout === '6-grid') {
        targetH = 800;
        const cols = 3;
        const rows = 2;
        const cellW = (targetW - gap * (cols + 1)) / cols;
        const cellH = (targetH - gap * (rows + 1)) / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            cells.push({
              x: gap + c * (cellW + gap),
              y: gap + r * (cellH + gap),
              w: cellW,
              h: cellH,
            });
          }
        }
      } else {
        // 4-grid (2x2)
        targetH = 1200;
        const cols = 2;
        const rows = 2;
        const cellW = (targetW - gap * 3) / cols;
        const cellH = (targetH - gap * 3) / rows;
        cells = [
          { x: gap, y: gap, w: cellW, h: cellH },
          { x: gap * 2 + cellW, y: gap, w: cellW, h: cellH },
          { x: gap, y: gap * 2 + cellH, w: cellW, h: cellH },
          { x: gap * 2 + cellW, y: gap * 2 + cellH, w: cellW, h: cellH },
        ];
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Background fill
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetW, targetH);

      // Draw each photo into its cell with cover crop
      cells.forEach((cell, idx) => {
        if (idx >= loadedImgs.length) return;
        const img = loadedImgs[idx % loadedImgs.length];

        ctx.save();
        ctx.beginPath();
        if (borderRadius > 0) {
          ctx.roundRect(cell.x, cell.y, cell.w, cell.h, borderRadius);
        } else {
          ctx.rect(cell.x, cell.y, cell.w, cell.h);
        }
        ctx.clip();

        // Object-fit: cover
        const imgAspect = img.width / img.height;
        const cellAspect = cell.w / cell.h;
        let dw = cell.w;
        let dh = cell.h;
        let dx = cell.x;
        let dy = cell.y;

        if (imgAspect > cellAspect) {
          dw = cell.h * imgAspect;
          dx = cell.x + (cell.w - dw) / 2;
        } else {
          dh = cell.w / imgAspect;
          dy = cell.y + (cell.h - dh) / 2;
        }

        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      });

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png', 0.95)
      );
      setCollageBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!collageBlob) return;
    downloadBlob(collageBlob, `collage-${layout}.png`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Multi-Photo Montage</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Photo Collage Maker
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Combine multiple photos into beautiful grid layouts, adjust border radiuses, spacing, and background tones.
        </p>
      </div>

      <PrivacyNotice toolName="Collage Maker" />

      <Dropzone
        onFilesSelected={handleFiles}
        accept="image/*"
        multiple={true}
        title="Drop multiple images here to add to collage"
        description="Add 2 or more photos (JPG, PNG, WebP)"
      />

      {images.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {images.length} photos selected for collage
            </span>
            <button
              onClick={() => {
                setImages([]);
                setCollageBlob(null);
              }}
              className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>

          {/* Layout templates */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Collage Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: '2-horizontal', label: '2 Side-by-Side' },
                { id: '2-vertical', label: '2 Stacked' },
                { id: '3-columns', label: '3 Columns' },
                { id: '4-grid', label: '4 Grid (2×2)' },
                { id: '6-grid', label: '6 Grid (3×2)' },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    setLayout(tmpl.id as any);
                    setCollageBlob(null);
                  }}
                  className={`p-3 rounded-xl text-xs font-bold border transition-colors text-center ${
                    layout === tmpl.id
                      ? 'bg-[#730000] border-[#730000] text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spacing & Style Tuning */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Gap Margin</span>
                <span>{gap}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={gap}
                onChange={(e) => {
                  setGap(Number(e.target.value));
                  setCollageBlob(null);
                }}
                className="w-full accent-[#730000]"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Corner Rounding</span>
                <span>{borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={borderRadius}
                onChange={(e) => {
                  setBorderRadius(Number(e.target.value));
                  setCollageBlob(null);
                }}
                className="w-full accent-[#730000]"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Background Tone
              </span>
              <div className="flex items-center space-x-2 pt-1">
                {['#ffffff', '#0f172a', '#f1f5f9', '#fef3c7'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setBgColor(c);
                      setCollageBlob(null);
                    }}
                    className={`w-6 h-6 rounded-full border border-slate-300 ${
                      bgColor === c ? 'ring-2 ring-[#730000]/50' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Thumbnails of included images */}
          <div className="flex flex-wrap gap-2 pt-1">
            {images.map((img, i) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.url}
                  alt={`Slot ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRenderCollage}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Compiling Collage...' : 'Generate Collage'}</span>
            </button>

            {collageBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#730000]/50 dark:hover:bg-[#730000] dark:text-slate-950 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Collage ({formatFileSize(collageBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
