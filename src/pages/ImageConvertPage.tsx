import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  CheckCircle,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import {
  processImage,
  OutputFormat,
  FORMAT_EXT_MAP,
  FORMAT_MIME_MAP,
} from '../services/image/imageProcessor';
import { formatFileSize } from '../utils/fileSize';
import { downloadBlob, downloadZip } from '../utils/download';
import { generateOutputFilename, getFileExtension } from '../utils/filename';

interface ConvertFile {
  id: string;
  file: File;
  targetFormat: OutputFormat;
  status: 'pending' | 'converting' | 'done' | 'error';
  resultBlob?: Blob;
  error?: string;
}

export const ImageConvertPage: React.FC = () => {
  const [files, setFiles] = useState<ConvertFile[]>([]);
  const [globalFormat, setGlobalFormat] = useState<OutputFormat>('webp');
  const [quality, setQuality] = useState<number>(85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFiles = (incoming: File[]) => {
    const newItems: ConvertFile[] = incoming.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      targetFormat: globalFormat,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...newItems]);
  };

  const handleGlobalFormatChange = (fmt: OutputFormat) => {
    setGlobalFormat(fmt);
    setFiles((prev) =>
      prev.map((item) => (item.status === 'done' ? item : { ...item, targetFormat: fmt }))
    );
  };

  const convertSingle = async (index: number) => {
    const item = files[index];
    setFiles((prev) =>
      prev.map((it, i) => (i === index ? { ...it, status: 'converting', error: undefined } : it))
    );

    try {
      const res = await processImage(item.file, {
        format: item.targetFormat,
        quality,
        resizeMode: 'none',
      });

      setFiles((prev) =>
        prev.map((it, i) =>
          i === index
            ? { ...it, status: 'done', resultBlob: res.blob }
            : it
        )
      );
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((it, i) =>
          i === index
            ? { ...it, status: 'error', error: err.message || 'Conversion failed' }
            : it
        )
      );
    }
  };

  const convertAll = async () => {
    setIsProcessing(true);
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'done') {
        await convertSingle(i);
      }
    }
    setIsProcessing(false);
  };

  const downloadSingle = (item: ConvertFile) => {
    if (!item.resultBlob) return;
    const ext = FORMAT_EXT_MAP[item.targetFormat];
    const name = generateOutputFilename(item.file.name, 'converted', ext);
    downloadBlob(item.resultBlob, name);
  };

  const downloadAllZip = async () => {
    const ready = files.filter((f) => f.resultBlob);
    if (ready.length === 0) return;

    const zipItems = ready.map((f) => ({
      name: generateOutputFilename(f.file.name, 'converted', FORMAT_EXT_MAP[f.targetFormat]),
      blob: f.resultBlob!,
    }));

    await downloadZip(zipItems, 'juantamad-converted-images.zip');
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => setFiles([]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Format Transformation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
            Image Converter
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Convert image formats locally between WebP, JPEG, PNG, and AVIF in bulk with zero quality loss or privacy risks.
          </p>
        </div>

        {files.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={convertAll}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Convert All ({files.length})</span>
            </button>
            <button
              onClick={downloadAllZip}
              disabled={!files.some((f) => f.resultBlob)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Archive className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
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

      <PrivacyNotice toolName="Image Converter" />

      {/* Global Controls */}
      <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Convert All To:
          </span>
          <div className="flex space-x-2">
            {(['webp', 'jpeg', 'png', 'avif'] as OutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleGlobalFormatChange(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  globalFormat === fmt
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {globalFormat !== 'png' && (
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-500 font-medium">Quality: {quality}%</span>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              className="accent-[var(--accent-text)] w-28 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Dropzone or Table */}
      {files.length === 0 ? (
        <div className="max-w-2xl mx-auto py-8">
          <Dropzone
            onFilesSelected={handleFiles}
            accept="image/*"
            title="Drop image files here to convert"
            description="Select any JPG, PNG, WebP, GIF, or BMP images. They will be processed completely locally."
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#09090B] rounded-2xl border border-slate-200 dark:border-[#27272A] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-[#27272A]/80 text-slate-500 border-b border-slate-200 dark:border-[#27272A] font-semibold">
                  <tr>
                    <th className="p-4">File Name</th>
                    <th className="p-4">Original</th>
                    <th className="p-4">Target Format</th>
                    <th className="p-4">Output Size</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                  {files.map((item, idx) => {
                    const ext = getFileExtension(item.file.name).toUpperCase();

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-[#27272A]/40">
                        <td className="p-4">
                          <div className="font-semibold text-[#27272A] dark:text-slate-200 truncate max-w-xs">
                            {item.file.name}
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">
                          <span className="uppercase font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#27272A] mr-2 text-[11px]">
                            {ext || 'IMG'}
                          </span>
                          {formatFileSize(item.file.size)}
                        </td>
                        <td className="p-4">
                          <select
                            value={item.targetFormat}
                            disabled={item.status === 'converting'}
                            onChange={(e) => {
                              const newFmt = e.target.value as OutputFormat;
                              setFiles((prev) =>
                                prev.map((f, i) =>
                                  i === idx ? { ...f, targetFormat: newFmt, status: 'pending', resultBlob: undefined } : f
                                )
                              );
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-xs font-semibold uppercase text-[#27272A] dark:text-white"
                          >
                            <option value="webp">WEBP</option>
                            <option value="jpeg">JPEG</option>
                            <option value="png">PNG</option>
                            <option value="avif">AVIF</option>
                          </select>
                        </td>
                        <td className="p-4">
                          {item.status === 'done' && item.resultBlob && (
                            <span className="font-bold text-[var(--accent-text)] dark:text-[var(--accent-text)]">
                              {formatFileSize(item.resultBlob.size)}
                            </span>
                          )}
                          {item.status === 'converting' && (
                            <span className="text-[var(--accent-text)] flex items-center space-x-1 animate-pulse">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Converting...</span>
                            </span>
                          )}
                          {item.status === 'pending' && (
                            <span className="text-slate-400">Ready</span>
                          )}
                          {item.status === 'error' && (
                            <span className="text-[var(--accent-text)] text-xs">{item.error}</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {item.status === 'done' ? (
                            <button
                              onClick={() => downloadSingle(item)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm inline-flex items-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => convertSingle(idx)}
                              disabled={item.status === 'converting'}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#27272A] hover:bg-[#09090B] text-white dark:bg-slate-700 dark:hover:bg-slate-600 inline-flex items-center space-x-1"
                            >
                              <span>Convert</span>
                            </button>
                          )}
                          <button
                            onClick={() => removeFile(item.id)}
                            className="p-1.5 text-slate-400 hover:text-[var(--accent-text)] rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2">
            <Dropzone
              onFilesSelected={handleFiles}
              accept="image/*"
              compact
              title="Add more images to convert"
              description="Drop more files here"
            />
          </div>
        </div>
      )}
    </div>
  );
};
