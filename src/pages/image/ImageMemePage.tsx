import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Type,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageMemePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [style, setStyle] = useState<'classic' | 'modern'>('classic');
  const [topText, setTopText] = useState<string>('WHEN THE FILE OPTIMIZER');
  const [bottomText, setBottomText] = useState<string>('RUNS 100% IN BROWSER');
  const [fontSize, setFontSize] = useState<number>(42);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [isUppercase, setIsUppercase] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [memeBlob, setMemeBlob] = useState<Blob | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setMemeBlob(null);
    const url = URL.createObjectURL(f);
    setImageSrc(url);
  };

  const handleRenderMeme = async () => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      if (style === 'modern') {
        // Modern Twitter/Instagram style with top white caption header
        const headerHeight = Math.max(120, fontSize * 2.5);
        canvas.width = img.width;
        canvas.height = img.height + headerHeight;

        // White header
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, headerHeight);

        // Header caption text
        ctx.fillStyle = '#111827';
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const displayCaption = isUppercase ? topText.toUpperCase() : topText;
        ctx.fillText(displayCaption, 24, headerHeight / 2);

        // Draw image below
        ctx.drawImage(img, 0, headerHeight);
      } else {
        // Classic Impact top and bottom
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        ctx.font = `900 ${fontSize}px Impact, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(3, fontSize / 8);

        const tText = isUppercase ? topText.toUpperCase() : topText;
        const bText = isUppercase ? bottomText.toUpperCase() : bottomText;

        if (tText) {
          ctx.strokeText(tText, canvas.width / 2, fontSize * 1.3);
          ctx.fillText(tText, canvas.width / 2, fontSize * 1.3);
        }

        if (bText) {
          ctx.strokeText(bText, canvas.width / 2, canvas.height - fontSize * 0.5);
          ctx.fillText(bText, canvas.width / 2, canvas.height - fontSize * 0.5);
        }
      }

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png', 0.95)
      );
      setMemeBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!memeBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(memeBlob, `${base}-meme.png`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Type className="w-3.5 h-3.5" />
          <span>Meme Generator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Meme Creator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Create viral memes with classic top &amp; bottom Impact outlines or modern social media caption templates.
        </p>
      </div>

      <PrivacyNotice toolName="Meme Generator" />

      {!file || !imageSrc ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image template here to create meme"
          description="Supports all image formats"
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
                setImageSrc(null);
                setMemeBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Style toggle */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Meme Style:
            </span>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-[#27272A]">
              <button
                onClick={() => {
                  setStyle('classic');
                  setMemeBlob(null);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  style === 'classic'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Classic Impact (Top / Bottom)
              </button>
              <button
                onClick={() => {
                  setStyle('modern');
                  setMemeBlob(null);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  style === 'modern'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Modern Social Caption
              </button>
            </div>
          </div>

          {/* Text Inputs */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {style === 'classic' ? 'Top Text' : 'Caption Text'}
              </label>
              <input
                type="text"
                value={topText}
                onChange={(e) => {
                  setTopText(e.target.value);
                  setMemeBlob(null);
                }}
                placeholder="Enter meme text..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-xs sm:text-sm text-[#09090B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-text)]/50"
              />
            </div>

            {style === 'classic' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bottom Text
                </label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => {
                    setBottomText(e.target.value);
                    setMemeBlob(null);
                  }}
                  placeholder="Enter bottom punchline..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-xs sm:text-sm text-[#09090B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-text)]/50"
                />
              </div>
            )}
          </div>

          {/* Font Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A]">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Font Size</span>
                <span>{fontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(Number(e.target.value));
                  setMemeBlob(null);
                }}
                className="w-full accent-[var(--accent-text)]"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A]">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Text Color
              </span>
              <div className="flex items-center space-x-2 pt-1">
                {['#ffffff', '#facc15', '#ef4444', '#000000'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setTextColor(c);
                      setMemeBlob(null);
                    }}
                    className={`w-6 h-6 rounded-full border border-slate-300 ${
                      textColor === c ? 'ring-2 ring-[var(--accent-text)]/50' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-xl bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A]">
              <input
                type="checkbox"
                id="upper"
                checked={isUppercase}
                onChange={(e) => {
                  setIsUppercase(e.target.checked);
                  setMemeBlob(null);
                }}
                className="rounded text-[var(--accent-text)] focus:ring-[var(--accent-text)]/50"
              />
              <label htmlFor="upper" className="text-xs text-slate-700 dark:text-slate-300">
                Force ALL CAPS (Standard Meme)
              </label>
            </div>
          </div>

          {/* Live Preview Display */}
          <div className="relative w-full max-h-[460px] overflow-hidden rounded-xl border border-slate-200 dark:border-[#27272A] bg-[#000000] p-2 flex items-center justify-center">
            <div className="relative max-h-[440px] inline-block">
              {style === 'modern' && (
                <div className="bg-white text-[#09090B] p-3 font-semibold text-sm">
                  {isUppercase ? topText.toUpperCase() : topText}
                </div>
              )}
              <img
                src={imageSrc}
                alt="Meme base"
                className="max-h-[380px] w-auto object-contain"
              />
              {style === 'classic' && (
                <>
                  <div
                    className="absolute top-4 left-0 right-0 text-center font-black tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] px-4"
                    style={{
                      fontFamily: 'Impact, sans-serif',
                      fontSize: `${Math.round(fontSize * 0.7)}px`,
                      color: textColor,
                      textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                    }}
                  >
                    {isUppercase ? topText.toUpperCase() : topText}
                  </div>
                  <div
                    className="absolute bottom-4 left-0 right-0 text-center font-black tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] px-4"
                    style={{
                      fontFamily: 'Impact, sans-serif',
                      fontSize: `${Math.round(fontSize * 0.7)}px`,
                      color: textColor,
                      textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                    }}
                  >
                    {isUppercase ? bottomText.toUpperCase() : bottomText}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRenderMeme}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Compiling Meme...' : 'Generate Meme'}</span>
            </button>

            {memeBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Meme ({formatFileSize(memeBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
