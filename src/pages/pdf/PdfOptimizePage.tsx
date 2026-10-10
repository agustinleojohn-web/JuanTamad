import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Gauge,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { compressPdf } from '../../services/pdf/pdfAdvancedService';
import { formatFileSize, calculateSizeComparison } from '../../utils/fileSize';
import { downloadBlob } from '../../utils/download';

export const PdfOptimizePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<'screen' | 'ebook' | 'printer'>('screen');
  const [quality, setQuality] = useState<number>(65);
  const [scale, setScale] = useState<number>(1.2);
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [optimizedBlob, setOptimizedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setOptimizedBlob(null);
    setError(null);
  };

  const applyProfile = (p: 'screen' | 'ebook' | 'printer') => {
    setProfile(p);
    if (p === 'screen') {
      setQuality(55);
      setScale(1.0);
    } else if (p === 'ebook') {
      setQuality(75);
      setScale(1.4);
    } else {
      setQuality(90);
      setScale(2.0);
    }
    setOptimizedBlob(null);
  };

  const handleOptimize = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await compressPdf(file, quality, scale);
      setOptimizedBlob(blob);
    } catch (err: any) {
      setError(err.message || 'Optimization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!optimizedBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(optimizedBlob, `${base}-optimized.pdf`);
  };

  const stats =
    file && optimizedBlob
      ? calculateSizeComparison(file.size, optimizedBlob.size)
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Gauge className="w-3.5 h-3.5" />
          <span>Stream Optimizer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Optimize PDF Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Downscale bloated raster objects, compress internal image streams, and clean redundant dictionary references directly in your browser.
        </p>
      </div>

      <PrivacyNotice toolName="Optimize PDF" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to optimize"
          description="Compress image streams &amp; structure for faster loading"
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Original Size: {formatFileSize(file.size)}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setOptimizedBlob(null);
              }}
              className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          {/* Optimization Profiles */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Optimization Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'screen',
                  name: 'Screen / Web',
                  badge: 'Lowest Size',
                  desc: '72-96 DPI images, ideal for email & fast downloads',
                },
                {
                  id: 'ebook',
                  name: 'Office & E-Book',
                  badge: 'Recommended',
                  desc: '150 DPI balanced quality for reading on retina displays',
                },
                {
                  id: 'printer',
                  name: 'Prepress Print',
                  badge: 'High Detail',
                  desc: '200-300 DPI high resolution for physical printing',
                },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyProfile(p.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    profile === p.id
                      ? 'border-[#730000]/50 bg-[#730000]/10/50 dark:bg-[#580000]/30 text-[#580000] dark:text-[#730000]/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{p.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        profile === p.id
                          ? 'bg-[#730000]/20/80 dark:bg-[#730000] text-[#730000] dark:text-[#730000]/10'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {p.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Fine Tuning Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>JPEG Stream Quality</span>
                </span>
                <span>{quality}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={quality}
                onChange={(e) => {
                  setQuality(Number(e.target.value));
                  setOptimizedBlob(null);
                }}
                className="w-full accent-[#730000]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Render Resolution Scale</span>
                </span>
                <span>{scale}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.2"
                step="0.1"
                value={scale}
                onChange={(e) => {
                  setScale(Number(e.target.value));
                  setOptimizedBlob(null);
                }}
                className="w-full accent-[#730000]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="stripMeta"
              checked={stripMetadata}
              onChange={(e) => setStripMetadata(e.target.checked)}
              className="rounded text-[#730000] focus:ring-[#730000]/50"
            />
            <label htmlFor="stripMeta" className="text-xs text-slate-600 dark:text-slate-400">
              Strip non-essential metadata and trailer revisions to maximize byte reduction
            </label>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {stats && optimizedBlob && (
            <div className="p-4 rounded-xl bg-[#730000]/10 dark:bg-[#580000]/40 border border-[#730000]/20 dark:border-[#730000] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#730000] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {stats.percentageSaved}%
                </div>
                <div>
                  <span className="font-bold text-xs text-[#730000] dark:text-[#730000]/20 block">
                    Optimized Size: {formatFileSize(optimizedBlob.size)}
                  </span>
                  <span className="text-[11px] text-[#580000] dark:text-[#730000]/40">
                    Saved {formatFileSize(stats.differenceBytes)} of document payload
                  </span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#730000] hover:bg-[#580000] text-white flex items-center justify-center space-x-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Optimized PDF</span>
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleOptimize}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Optimizing Document Streams...' : 'Optimize PDF Now'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
