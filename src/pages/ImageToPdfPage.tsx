import React, { useState } from 'react';
import {
  FileText,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { convertImagesToPdf, ImageToPdfOptions } from '../services/pdf/pdfLibService';
import { downloadBlob } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export const ImageToPdfPage: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(20);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    const items: ImageItem[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...items]);
    setPdfBlob(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setPdfBlob(null);
  };

  const removeImage = (index: number) => {
    const item = images[index];
    URL.revokeObjectURL(item.previewUrl);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPdfBlob(null);
  };

  const clearAll = () => {
    images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setImages([]);
    setPdfBlob(null);
  };

  const handleGenerate = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    try {
      const options: ImageToPdfOptions = {
        pageSize,
        orientation,
        margin,
        imageLayout: 'fit',
      };
      const blob = await convertImagesToPdf(
        images.map((i) => ({ file: i.file, name: i.file.name })),
        options
      );
      setPdfBlob(blob);
    } catch (err: any) {
      alert(`Failed to create PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, 'juantamad-converted-images.pdf');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Multi-Page Document Maker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Image to PDF Converter
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Convert photos or scan images into a single formatted PDF document. Reorder pages freely.
          </p>
        </div>

        {images.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#730000] hover:bg-[#580000] text-white shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Create PDF ({images.length} Images)</span>
            </button>
            {pdfBlob && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download ({formatFileSize(pdfBlob.size)})</span>
              </button>
            )}
            <button
              onClick={clearAll}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <PrivacyNotice toolName="Image to PDF" />

      {images.length === 0 ? (
        <div className="max-w-2xl mx-auto py-8">
          <Dropzone
            onFilesSelected={handleFiles}
            accept="image/*"
            title="Drop images here to combine into PDF"
            description="Supports JPG, PNG, WebP. Multiple files can be selected."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Images List / Reorder */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Document Pages ({images.length})
                </span>
                <span className="text-xs text-slate-400">Drag or use arrows to change order</span>
              </div>

              <div className="space-y-2">
                {images.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <span className="w-6 text-center text-xs font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="w-12 h-12 rounded object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatFileSize(item.file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => moveImage(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveImage(idx, 'down')}
                        disabled={idx === images.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeImage(idx)}
                        className="p-1.5 text-slate-400 hover:text-[#730000]"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Dropzone
                  onFilesSelected={handleFiles}
                  accept="image/*"
                  compact
                  title="Add more images"
                  description="Drop more photos to append"
                />
              </div>
            </div>
          </div>

          {/* Right: PDF Settings */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-900 dark:text-white text-base pb-2 border-b border-slate-100 dark:border-slate-800">
                PDF Page Settings
              </h3>

              {/* Page Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Page Dimensions
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      setPageSize('a4');
                      setPdfBlob(null);
                    }}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      pageSize === 'a4'
                        ? 'border-[#730000] bg-[#730000] text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    A4
                  </button>
                  <button
                    onClick={() => {
                      setPageSize('letter');
                      setPdfBlob(null);
                    }}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      pageSize === 'letter'
                        ? 'border-[#730000] bg-[#730000] text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Letter
                  </button>
                  <button
                    onClick={() => {
                      setPageSize('fit');
                      setPdfBlob(null);
                    }}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      pageSize === 'fit'
                        ? 'border-[#730000] bg-[#730000] text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Fit Image
                  </button>
                </div>
              </div>

              {/* Orientation (if not fit) */}
              {pageSize !== 'fit' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Orientation
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        setOrientation('portrait');
                        setPdfBlob(null);
                      }}
                      className={`py-2 rounded-lg font-bold border transition-colors ${
                        orientation === 'portrait'
                          ? 'border-[#730000] bg-[#730000] text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      onClick={() => {
                        setOrientation('landscape');
                        setPdfBlob(null);
                      }}
                      className={`py-2 rounded-lg font-bold border transition-colors ${
                        orientation === 'landscape'
                          ? 'border-[#730000] bg-[#730000] text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Landscape
                    </button>
                  </div>
                </div>
              )}

              {/* Margins */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Page Margin ({margin}pt)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[0, 15, 30, 45].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMargin(m);
                        setPdfBlob(null);
                      }}
                      className={`py-1.5 rounded-lg border font-semibold ${
                        margin === m
                          ? 'border-[#730000] bg-[#730000]/10 text-[#580000] dark:bg-[#580000] dark:text-[#730000]/30'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {m === 0 ? 'None' : `${m}pt`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Generate PDF Document</span>
                </button>

                {pdfBlob && (
                  <button
                    onClick={handleDownload}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Now</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
