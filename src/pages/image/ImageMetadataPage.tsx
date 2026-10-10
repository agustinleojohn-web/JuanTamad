import React, { useState } from 'react';
import {
  FileText,
  Download,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Camera,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { readImageExif, stripImageExif, ExifDetails } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageMetadataPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [exif, setExif] = useState<ExifDetails | null>(null);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setCleanedBlob(null);

    const url = URL.createObjectURL(f);
    setImageSrc(url);

    setIsProcessing(true);
    try {
      const details = await readImageExif(f);
      setExif(details);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCleanMetadata = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const clean = await stripImageExif(file);
      setCleanedBlob(clean);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!cleanedBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop() || 'jpg';
    downloadBlob(cleanedBlob, `${base}-sanitized.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy &amp; EXIF Inspector</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Image Metadata &amp; EXIF Cleaner
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Inspect hidden camera settings, device models, timestamps, and GPS coordinates; clean and strip metadata with 1-click.
        </p>
      </div>

      <PrivacyNotice toolName="Image Metadata" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to view &amp; clean EXIF details"
          description="Supports JPEG, HEIC, PNG, and camera RAW formats"
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                File Size: {formatFileSize(file.size)} • Type: {file.type || 'image/jpeg'}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setImageSrc(null);
                setExif(null);
                setCleanedBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* EXIF Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detected Hardware &amp; Shot Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/40">
                  <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                    <Camera className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                    <span>Camera Make</span>
                  </div>
                  <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                    {exif?.make || 'Not embedded / Generic'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/40">
                  <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                    <Layers className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                    <span>Device Model</span>
                  </div>
                  <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                    {exif?.model || 'Unknown Device'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/40">
                  <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                    <span>Date Created</span>
                  </div>
                  <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                    {exif?.dateTime || 'No timestamp recorded'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/40">
                  <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                    <span>Processing Software</span>
                  </div>
                  <span className="font-bold text-sm text-[#09090B] dark:text-white block truncate">
                    {exif?.software || 'Standard Camera OS'}
                  </span>
                </div>
              </div>

              {exif?.hasExifData ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold block mb-0.5">EXIF Metadata Detected!</span>
                  This photo contains hardware markers and potential tracking tags. Use the "Strip All EXIF Metadata" button to protect your privacy before sharing online.
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] border border-[var(--accent-text)]/20 dark:border-[var(--accent-text)]/40 text-xs text-[var(--accent-text)] dark:text-[var(--accent-text)]">
                  <span className="font-bold block mb-0.5">Clean File</span>
                  No sensitive tracking tags found or file has already been stripped.
                </div>
              )}
            </div>

            {/* Image Preview thumbnail */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-[#27272A] bg-[#000000] p-2 flex items-center justify-center min-h-[220px]">
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="max-h-[240px] w-auto object-contain"
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCleanMetadata}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Strip All EXIF Metadata</span>
                </button>

                {cleanedBlob && (
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Sanitized Image</span>
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
