import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  CheckCircle2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { generateAndroidLauncherIconsZip } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageAndroidIconPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [shape, setShape] = useState<'rounded' | 'circle' | 'squircle'>('squircle');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setZipBlob(null);
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

      const zip = await generateAndroidLauncherIconsZip(img, shape);
      setZipBlob(zip);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!zipBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(zipBlob, `${base}-android-icons.zip`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile App Asset Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Android Icon Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Compile standard and adaptive launcher icons (mdpi to xxxhdpi) with custom squircle, circle, and rounded corner masks.
        </p>
      </div>

      <PrivacyNotice toolName="Android Icon Generator" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop master app logo here"
          description="High resolution (512×512 or 1024×1024) PNG recommended"
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
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
              className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Shape Masking */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Adaptive Masking Silhouette
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'squircle', label: 'Material Squircle', desc: 'Modern Android standard' },
                { id: 'circle', label: 'Pure Circle', desc: 'Pixel Launcher round icon' },
                { id: 'rounded', label: 'Rounded Square', desc: 'Classic app icon' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setShape(s.id as any);
                    setZipBlob(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    shape === s.id
                      ? 'bg-[#730000] border-[#730000] text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs block">{s.label}</span>
                  <span className={`text-[10px] block mt-0.5 ${shape === s.id ? 'text-[#730000]/10' : 'text-slate-400'}`}>
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Densities preview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Included Densities &amp; Folders:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { folder: 'res/mipmap-mdpi', size: '48 × 48 px' },
                { folder: 'res/mipmap-hdpi', size: '72 × 72 px' },
                { folder: 'res/mipmap-xhdpi', size: '96 × 96 px' },
                { folder: 'res/mipmap-xxhdpi', size: '144 × 144 px' },
                { folder: 'res/mipmap-xxxhdpi', size: '192 × 192 px' },
              ].map((d) => (
                <div key={d.folder} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-bold text-[11px] block truncate">{d.folder}</span>
                  <span className="text-[10px] text-slate-400">{d.size}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Generating Density Assets...' : 'Compile Android Icon ZIP'}</span>
            </button>

            {zipBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#730000]/50 dark:hover:bg-[#730000] dark:text-slate-950 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Android ZIP ({formatFileSize(zipBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
