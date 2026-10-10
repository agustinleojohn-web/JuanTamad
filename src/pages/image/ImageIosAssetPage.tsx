import React, { useState } from 'react';
import {
  Apple,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { generateIosAssetsZip } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageIosAssetPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [assetName, setAssetName] = useState<string>('AppIcon');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setZipBlob(null);
    const cleanName = f.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_');
    setAssetName(cleanName || 'AppImage');

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

      const zip = await generateIosAssetsZip(img, assetName);
      setZipBlob(zip);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!zipBlob) return;
    downloadBlob(zipBlob, `${assetName}.imageset.zip`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Apple className="w-3.5 h-3.5" />
          <span>Xcode Developer Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          iOS XCAssets Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Compile universal @1x, @2x, and @3x retina scale assets with complete Contents.json manifests for Xcode.
        </p>
      </div>

      <PrivacyNotice toolName="iOS Asset Set" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop master asset image here"
          description="High resolution (@3x source) PNG or JPG recommended"
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Xcode Asset Name (.imageset identifier)
            </label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => {
                setAssetName(e.target.value);
                setZipBlob(null);
              }}
              placeholder="e.g. HeaderLogo, ProfileBadge"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#730000]/50"
            />
          </div>

          {/* Package contents overview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Generated Xcode Bundle Contents:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold block truncate">{assetName}.png</span>
                <span className="text-[10px] text-slate-400">1x Standard Display</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold block truncate">{assetName}@2x.png</span>
                <span className="text-[10px] text-slate-400">2x Retina Display</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold block truncate">{assetName}@3x.png</span>
                <span className="text-[10px] text-slate-400">3x Super Retina OLED</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold block truncate">Contents.json</span>
                <span className="text-[10px] text-slate-400">Xcode schema manifest</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Compiling Scales...' : 'Generate iOS Asset ZIP'}</span>
            </button>

            {zipBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#730000]/50 dark:hover:bg-[#730000] dark:text-slate-950 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download {assetName}.imageset.zip ({formatFileSize(zipBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
