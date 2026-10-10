import React, { useState } from 'react';
import {
  Palette,
  Download,
  Trash2,
  RefreshCw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import {
  FILTER_PRESETS,
  PresetFilterName,
  applyImageAdjustments,
  ImageAdjustmentOptions,
} from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PhotoEditorPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PresetFilterName>('normal');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [editedBlob, setEditedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setEditedBlob(null);
    const url = URL.createObjectURL(f);
    setImageSrc(url);
    setActiveFilter('normal');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const applyEdits = async () => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      // 1. First apply rotation and flipping on canvas
      const rotCanvas = document.createElement('canvas');
      const is90or270 = rotation % 180 !== 0;
      rotCanvas.width = is90or270 ? img.height : img.width;
      rotCanvas.height = is90or270 ? img.width : img.height;

      const rCtx = rotCanvas.getContext('2d');
      if (rCtx) {
        rCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
        rCtx.rotate((rotation * Math.PI) / 180);
        rCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        rCtx.drawImage(img, -img.width / 2, -img.height / 2);
      }

      // 2. Apply aesthetic color filter preset
      const presetAdjustments = FILTER_PRESETS[activeFilter].adjustments;
      const opts: ImageAdjustmentOptions = {
        brightness: presetAdjustments.brightness || 0,
        contrast: presetAdjustments.contrast || 0,
        saturation: presetAdjustments.saturation || 0,
        exposure: presetAdjustments.exposure || 0,
        warmth: presetAdjustments.warmth || 0,
        vignette: presetAdjustments.vignette || 0,
        sharpen: presetAdjustments.sharpen || 0,
        grayscale: presetAdjustments.grayscale,
        sepia: presetAdjustments.sepia,
        invert: presetAdjustments.invert,
      };

      const finalCanvas = await applyImageAdjustments(rotCanvas, opts);

      const mime = file.type || 'image/png';
      const blob = await new Promise<Blob>((resolve) =>
        finalCanvas.toBlob((b) => resolve(b!), mime, 0.95)
      );
      setEditedBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!editedBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop() || 'png';
    downloadBlob(editedBlob, `${base}-edited.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Palette className="w-3.5 h-3.5" />
          <span>Aesthetic Photo Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Photo Editor
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Apply vintage, cyberpunk, and cinema filters, rotate, flip, and touch up tones directly in your browser.
        </p>
      </div>

      <PrivacyNotice toolName="Photo Editor" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop photo here to edit"
          description="Supports all standard image formats with real-time editing"
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
            <button
              onClick={() => {
                setFile(null);
                setImageSrc(null);
                setEditedBlob(null);
              }}
              className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Quick Filter Carousel */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Aesthetic Filters
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(FILTER_PRESETS) as PresetFilterName[]).map((fName) => (
                <button
                  key={fName}
                  onClick={() => {
                    setActiveFilter(fName);
                    setEditedBlob(null);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                    activeFilter === fName
                      ? 'bg-[#730000] border-[#730000] text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="block">{FILTER_PRESETS[fName].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transform Tools: Rotate & Flip */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Transforms:
            </span>
            <button
              onClick={() => {
                setRotation((rotation + 90) % 360);
                setEditedBlob(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center space-x-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#730000]" />
              <span>Rotate 90° ({rotation}°)</span>
            </button>

            <button
              onClick={() => {
                setFlipH(!flipH);
                setEditedBlob(null);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1.5 ${
                flipH
                  ? 'bg-[#730000]/10 dark:bg-[#580000]/40 border-[#730000]/50 text-[#730000]'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip Horizontal</span>
            </button>

            <button
              onClick={() => {
                setFlipV(!flipV);
                setEditedBlob(null);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1.5 ${
                flipV
                  ? 'bg-[#730000]/10 dark:bg-[#580000]/40 border-[#730000]/50 text-[#730000]'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FlipVertical className="w-3.5 h-3.5" />
              <span>Flip Vertical</span>
            </button>
          </div>

          {/* Interactive Live Canvas Preview */}
          <div className="relative w-full max-h-[460px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-2 flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Editor preview"
              className="max-h-[440px] w-auto max-w-full object-contain transition-transform"
              style={{
                transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                filter:
                  activeFilter === 'noir'
                    ? 'grayscale(1) contrast(1.4)'
                    : activeFilter === 'vintage'
                    ? 'sepia(0.3) contrast(1.1) brightness(0.95)'
                    : activeFilter === 'cyberpunk'
                    ? 'saturate(1.8) contrast(1.3) hue-rotate(-20deg)'
                    : activeFilter === 'golden'
                    ? 'sepia(0.25) saturate(1.4) brightness(1.05)'
                    : activeFilter === 'nordic'
                    ? 'saturate(0.85) contrast(1.2) hue-rotate(15deg)'
                    : activeFilter === 'vivid'
                    ? 'saturate(1.6) contrast(1.2)'
                    : activeFilter === 'soft'
                    ? 'brightness(1.1) contrast(0.9)'
                    : 'none',
              }}
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={applyEdits}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Processing Filter...' : 'Apply Filter &amp; Render'}</span>
            </button>

            {editedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#730000]/50 dark:hover:bg-[#730000] dark:text-slate-950 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Photo ({formatFileSize(editedBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
