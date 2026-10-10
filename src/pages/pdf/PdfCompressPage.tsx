import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { compressPdf } from '../../services/pdf/pdfAdvancedService';
import { formatFileSize, calculateSizeComparison } from '../../utils/fileSize';
import { downloadBlob } from '../../utils/download';

export const PdfCompressPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<'maximum' | 'balanced' | 'high'>('balanced');
  const [customQuality, setCustomQuality] = useState<number>(70);
  const [scale, setScale] = useState<number>(1.2);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setCompressedBlob(null);
    setError(null);
  };

  const applyPreset = (p: 'maximum' | 'balanced' | 'high') => {
    setPreset(p);
    if (p === 'maximum') {
      setCustomQuality(40);
      setScale(1.0);
    } else if (p === 'balanced') {
      setCustomQuality(70);
      setScale(1.2);
    } else {
      setCustomQuality(88);
      setScale(1.5);
    }
    setCompressedBlob(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await compressPdf(file, customQuality, scale);
      setCompressedBlob(blob);
    } catch (err: any) {
      setError(err.message || 'Compression failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(compressedBlob, `${base}-compressed.pdf`);
  };

  const stats =
    file && compressedBlob
      ? calculateSizeComparison(file.size, compressedBlob.size)
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Client-Side PDF Optimizer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Compress PDF Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Shrink oversized PDF documents and optimize image streams directly on your device with zero upload latency.
        </p>
      </div>

      <PrivacyNotice toolName="Compress PDF" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to compress"
          description="Reduce PDF size for email attachments and uploads"
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Original Size: {formatFileSize(file.size)}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setCompressedBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Compression Level
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => applyPreset('maximum')}
                className={`p-3 rounded-xl border text-left font-medium transition-colors ${
                  preset === 'maximum'
                    ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] text-[var(--accent-text)] dark:text-[var(--accent-text)] font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>Maximum</div>
                <div className="text-[10px] text-slate-400 font-normal">Smallest size</div>
              </button>
              <button
                onClick={() => applyPreset('balanced')}
                className={`p-3 rounded-xl border text-left font-medium transition-colors ${
                  preset === 'balanced'
                    ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] text-[var(--accent-text)] dark:text-[var(--accent-text)] font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>Balanced (Recommended)</div>
                <div className="text-[10px] text-slate-400 font-normal">Good quality &amp; size</div>
              </button>
              <button
                onClick={() => applyPreset('high')}
                className={`p-3 rounded-xl border text-left font-medium transition-colors ${
                  preset === 'high'
                    ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] text-[var(--accent-text)] dark:text-[var(--accent-text)] font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>High Quality</div>
                <div className="text-[10px] text-slate-400 font-normal">Crisp text &amp; images</div>
              </button>
            </div>
          </div>

          {/* Results Comparison Box */}
          {stats && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#27272A]/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-3">
                <div>
                  <span className="text-slate-400 block text-xs">Original</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatFileSize(stats.originalBytes)}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 block text-xs">Compressed</span>
                  <span className="font-bold text-[#09090B] dark:text-white">
                    {formatFileSize(stats.newBytes)}
                  </span>
                </div>
              </div>

              {stats.isSmaller && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-text)]" />
                  <span>
                    -{stats.percentageSaved}% ({formatFileSize(stats.differenceBytes)} saved)
                  </span>
                </div>
              )}

              {stats.isLarger && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Original was already heavily compressed</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Compress PDF Now</span>
            </button>

            {compressedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download ({formatFileSize(compressedBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
