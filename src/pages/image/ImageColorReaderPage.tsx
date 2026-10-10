import React, { useState, useRef } from 'react';
import {
  Pipette,
  Copy,
  Trash2,
  RefreshCw,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { extractColorPalette, ColorEntry } from '../../services/image/advancedImageService';
import { formatFileSize } from '../../utils/fileSize';

export const ImageColorReaderPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [palette, setPalette] = useState<ColorEntry[]>([]);
  const [hoverColor, setHoverColor] = useState<{ hex: string; rgb: string; x: number; y: number } | null>(null);
  const [pinnedColor, setPinnedColor] = useState<{ hex: string; rgb: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setHoverColor(null);
    setPinnedColor(null);

    const url = URL.createObjectURL(f);
    setImageSrc(url);

    setIsProcessing(true);
    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = url;
      });

      // Init canvas for eyedropper
      const c = canvasRef.current;
      if (c) {
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx?.drawImage(img, 0, 0);
      }

      const colors = await extractColorPalette(img, 6);
      setPalette(colors);
      if (colors.length > 0) {
        setPinnedColor({ hex: colors[0].hex, rgb: colors[0].rgb });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= c.width || y < 0 || y >= c.height) return;

    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + [pixel[0], pixel[1], pixel[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

    setHoverColor({ hex, rgb, x, y });
  };

  const handleCanvasClick = () => {
    if (hoverColor) {
      setPinnedColor({ hex: hoverColor.hex, rgb: hoverColor.rgb });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Pipette className="w-3.5 h-3.5" />
          <span>Color Eyedropper &amp; Palette</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Color Reader &amp; Palette Extractor
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Hover anywhere on an image with pixel loupe precision, extract dominant brand palettes, and copy HEX &amp; RGB values.
        </p>
      </div>

      <PrivacyNotice toolName="Color Reader" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to sample colors"
          description="Works with artwork, photographs, and web mockups"
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
                setPalette([]);
                setHoverColor(null);
                setPinnedColor(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Active Color Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm shrink-0"
                style={{
                  backgroundColor: (hoverColor || pinnedColor)?.hex || '#ffffff',
                }}
              />
              <div>
                <span className="font-bold text-sm text-[#09090B] dark:text-white block font-mono">
                  {(hoverColor || pinnedColor)?.hex || '#------'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {(hoverColor || pinnedColor)?.rgb || 'rgb(---, ---, ---)'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  (hoverColor || pinnedColor) &&
                  copyToClipboard((hoverColor || pinnedColor)!.hex)
                }
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#27272A] text-xs font-semibold flex items-center space-x-1.5 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedText === (hoverColor || pinnedColor)?.hex ? 'Copied HEX!' : 'Copy HEX'}</span>
              </button>
              <button
                onClick={() =>
                  (hoverColor || pinnedColor) &&
                  copyToClipboard((hoverColor || pinnedColor)!.rgb)
                }
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#27272A] text-xs font-semibold flex items-center space-x-1.5 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedText === (hoverColor || pinnedColor)?.rgb ? 'Copied RGB!' : 'Copy RGB'}</span>
              </button>
            </div>
          </div>

          {/* Extracted Dominant Palette */}
          {palette.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Dominant Color Palette (Click swatch to select)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {palette.map((item) => (
                  <button
                    key={item.hex}
                    onClick={() => setPinnedColor({ hex: item.hex, rgb: item.rgb })}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/40 text-left hover:scale-[1.02] transition-transform"
                  >
                    <div
                      className="w-full h-12 rounded-lg mb-2 border border-slate-300 dark:border-slate-700"
                      style={{ backgroundColor: item.hex }}
                    />
                    <span className="font-bold text-xs text-[#09090B] dark:text-white block font-mono">
                      {item.hex}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {item.percentage}% of image
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Eyedropper Canvas Viewport */}
          <div className="space-y-1">
            <span className="text-xs text-slate-500">
              Hover over image to inspect pixel color • Click to pin color
            </span>
            <div className="relative w-full max-h-[480px] overflow-hidden rounded-xl border border-slate-200 dark:border-[#27272A] bg-[#000000] p-2 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
                className="max-h-[460px] w-auto max-w-full object-contain cursor-crosshair"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
