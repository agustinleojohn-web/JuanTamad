import React, { useState } from 'react';
import {
  Stamp,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { watermarkPdf, WatermarkOptions } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfWatermarkPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(0.25);
  const [angle, setAngle] = useState<number>(-45);
  const [colorHex, setColorHex] = useState<string>('#ef4444');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setResultBlob(null);
  };

  const handleApply = async () => {
    if (!file || !text.trim()) return;
    setIsProcessing(true);
    try {
      const options: WatermarkOptions = {
        text,
        fontSize,
        opacity,
        angleDegrees: angle,
        colorHex,
      };
      const blob = await watermarkPdf(file, options);
      setResultBlob(blob);
    } catch (err: any) {
      alert(`Watermark failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(resultBlob, `${base}-watermarked.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Stamp className="w-3.5 h-3.5" />
          <span>Document Stamping</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Watermark PDF Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Stamp diagonal or horizontal text watermarks across every page with live opacity and angle tuning.
        </p>
      </div>

      <PrivacyNotice toolName="Watermark PDF" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to watermark"
          description="Apply custom text watermarks across document pages"
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
                setResultBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Watermark Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-xs sm:text-sm text-[#09090B] dark:text-white font-bold tracking-wider"
              />
              <div className="flex gap-2 mt-2">
                {['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'SAMPLE'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setText(s)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Opacity: {Math.round(opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent-text)]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Font Size ({fontSize}pt)
                </label>
                <input
                  type="range"
                  min="24"
                  max="80"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--accent-text)]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Rotation Angle
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[-45, 0, 45].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAngle(a)}
                      className={`py-1.5 rounded-lg border font-bold ${
                        angle === a
                          ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {a}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Visual Preview Mock */}
            <div className="h-44 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#000000] flex items-center justify-center overflow-hidden relative select-none">
              <span className="text-xs text-slate-300 dark:text-slate-700 font-mono absolute top-2 left-3">
                Live Preview
              </span>
              <div
                className="font-black tracking-widest text-center"
                style={{
                  fontSize: `${fontSize * 0.7}px`,
                  color: colorHex,
                  opacity,
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {text || 'WATERMARK'}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApply}
              disabled={isProcessing || !text.trim()}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Apply Watermark to PDF</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Watermarked PDF</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
