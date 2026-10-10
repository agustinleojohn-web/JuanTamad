import React, { useState } from 'react';
import {
  Crop,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { cropPdf, CropOptions } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfCropPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [top, setTop] = useState<number>(36); // 36 pt = 0.5 in
  const [bottom, setBottom] = useState<number>(36);
  const [left, setLeft] = useState<number>(36);
  const [right, setRight] = useState<number>(36);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setCroppedBlob(null);
  };

  const handleCrop = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const options: CropOptions = {
        topMargin: top,
        bottomMargin: bottom,
        leftMargin: left,
        rightMargin: right,
      };
      const blob = await cropPdf(file, options);
      setCroppedBlob(blob);
    } catch (err: any) {
      alert(`Crop failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!croppedBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(croppedBlob, `${base}-cropped.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Crop className="w-3.5 h-3.5" />
          <span>Dimension Trimming</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Crop PDF Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Trim unwanted margins, header space, or whitespace from PDF pages with point precision.
        </p>
      </div>

      <PrivacyNotice toolName="Crop PDF" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to crop"
          description="Adjust visible boundaries and trim margins"
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
                setCroppedBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          {/* Margins Form */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Top Trim (pt)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={top}
                onChange={(e) => setTop(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Bottom Trim (pt)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={bottom}
                onChange={(e) => setBottom(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Left Trim (pt)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={left}
                onChange={(e) => setLeft(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Right Trim (pt)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={right}
                onChange={(e) => setRight(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCrop}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Crop PDF Margins</span>
            </button>

            {croppedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Cropped PDF</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
