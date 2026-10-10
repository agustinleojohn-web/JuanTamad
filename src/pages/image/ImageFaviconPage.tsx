import React, { useState } from 'react';
import {
  Globe,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  CheckCircle2,
  Copy,
  Code2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { generateFaviconZip } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageFaviconPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const htmlTags = `<!-- Favicon & Web App Icons -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

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

      const zip = await generateFaviconZip(img);
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
    downloadBlob(zipBlob, `${base}-favicon-pack.zip`);
  };

  const copyTags = () => {
    navigator.clipboard.writeText(htmlTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Globe className="w-3.5 h-3.5" />
          <span>Webmaster Icon Packager</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Favicon Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Generate multi-resolution .ico binaries, apple-touch-icons, web manifests, and HTML headers bundled in a single ZIP.
        </p>
      </div>

      <PrivacyNotice toolName="Favicon Generator" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop square logo or icon here"
          description="Supports PNG, SVG, JPG, and WebP (512×512 recommended)"
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

          {/* Included resolutions list */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Generated Favicon Package Contents:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'favicon.ico', desc: '16x16, 32x32, 48x48 multi-res binary' },
                { name: 'apple-touch-icon.png', desc: '180x180 iOS Safari home icon' },
                { name: 'favicon-32x32.png', desc: 'Standard desktop browser tabs' },
                { name: 'favicon-16x16.png', desc: 'Bookmarks & address bar' },
                { name: 'favicon-192x192.png', desc: 'Android PWA home screen' },
                { name: 'favicon-512x512.png', desc: 'PWA splash screen icon' },
                { name: 'site.webmanifest', desc: 'JSON web application manifest' },
                { name: 'README-tags.html', desc: 'Copy-paste HTML code snippet' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                >
                  <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* HTML Snippet preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#730000]" />
                <span>HTML Header Tags:</span>
              </span>
              <button
                onClick={copyTags}
                className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {htmlTags}
            </pre>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Generating Multi-Res Package...' : 'Generate Favicon ZIP'}</span>
            </button>

            {zipBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#730000]/50 dark:hover:bg-[#730000] dark:text-slate-950 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Favicon ZIP ({formatFileSize(zipBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
