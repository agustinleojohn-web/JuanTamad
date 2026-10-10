import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  CheckCircle2,
  FolderTree,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { generateAndroidDrawablesZip } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageAndroidDrawablePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resourceName, setResourceName] = useState<string>('ic_custom_image');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setZipBlob(null);

    // Android resource names must be lowercase letters, numbers, and underscores
    const cleanName = f.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');
    setResourceName(cleanName.startsWith('ic_') ? cleanName : `ic_${cleanName}`);

    const url = URL.createObjectURL(f);
    setImageSrc(url);
  };

  const handleGenerate = async () => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      const zip = await generateAndroidDrawablesZip(img, resourceName);
      setZipBlob(zip);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!zipBlob) return;
    downloadBlob(zipBlob, `${resourceName}-android-drawables.zip`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <FolderTree className="w-3.5 h-3.5" />
          <span>Android Developer Resource Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Android Drawable Set Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Generate production-ready drawable folders (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) in a single drag-and-drop ZIP.
        </p>
      </div>

      <PrivacyNotice toolName="Android Drawables" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop master asset image here"
          description="High resolution (xxxhdpi / 4x baseline) PNG recommended"
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Source: {formatFileSize(file.size)}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setImageSrc(null);
                setZipBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Android Resource Name (lowercase, numbers, underscores)
            </label>
            <input
              type="text"
              value={resourceName}
              onChange={(e) => {
                setResourceName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                setZipBlob(null);
              }}
              placeholder="e.g. ic_navigation_logo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-xs sm:text-sm text-[#09090B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-text)]/50 font-mono"
            />
          </div>

          {/* Density Bucket List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Generated Android Resource Directory Tree:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { folder: 'res/drawable-mdpi', factor: '1.0x (160 dpi)' },
                { folder: 'res/drawable-hdpi', factor: '1.5x (240 dpi)' },
                { folder: 'res/drawable-xhdpi', factor: '2.0x (320 dpi)' },
                { folder: 'res/drawable-xxhdpi', factor: '3.0x (480 dpi)' },
                { folder: 'res/drawable-xxxhdpi', factor: '4.0x (640 dpi)' },
              ].map((d) => (
                <div key={d.folder} className="p-2.5 rounded-lg border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/40">
                  <span className="font-bold text-[11px] block truncate font-mono">{d.folder}</span>
                  <span className="text-[10px] text-slate-400">{d.factor}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Scaling Android Densities...' : 'Compile Android Drawables ZIP'}</span>
            </button>

            {zipBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Drawables ZIP ({formatFileSize(zipBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
