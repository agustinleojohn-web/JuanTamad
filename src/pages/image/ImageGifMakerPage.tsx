import React, { useState } from 'react';
import {
  Film,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { createAnimatedGif } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageGifMakerPage: React.FC = () => {
  const [frames, setFrames] = useState<Array<{ id: string; file: File; url: string }>>([]);
  const [frameDelay, setFrameDelay] = useState<number>(250); // ms
  const [loopCount, setLoopCount] = useState<number>(0); // 0 = infinite
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    const newFrames = files.map((f) => ({
      id: Math.random().toString(),
      file: f,
      url: URL.createObjectURL(f),
    }));
    setFrames((prev) => [...prev, ...newFrames]);
    setGifBlob(null);
    setGifUrl(null);
  };

  const removeFrame = (id: string) => {
    setFrames(frames.filter((f) => f.id !== id));
    setGifBlob(null);
    setGifUrl(null);
  };

  const handleCreateGif = async () => {
    if (frames.length === 0) return;
    setIsProcessing(true);

    try {
      const targetW = 480;
      const targetH = 480;

      const canvases: HTMLCanvasElement[] = [];

      for (const f of frames) {
        const img = new Image();
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = f.url;
        });

        const c = document.createElement('canvas');
        c.width = targetW;
        c.height = targetH;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetW, targetH);

          // Fit center
          const scale = Math.min(targetW / img.width, targetH / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          ctx.drawImage(img, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh);
          canvases.push(c);
        }
      }

      const blob = await createAnimatedGif(canvases, frameDelay, loopCount);
      setGifBlob(blob);
      setGifUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!gifBlob) return;
    downloadBlob(gifBlob, `animated-sequence.gif`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Film className="w-3.5 h-3.5" />
          <span>Animation Sequencer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Animated GIF Maker
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Combine photo bursts, graphics, and still frames into looping animated GIFs directly in your browser.
        </p>
      </div>

      <PrivacyNotice toolName="GIF Maker" />

      <Dropzone
        onFilesSelected={handleFiles}
        accept="image/*"
        multiple={true}
        title="Drop image frames here to build animated GIF"
        description="Add multiple images in order to create a sequence"
      />

      {frames.length > 0 && (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <span className="font-bold text-sm text-[#09090B] dark:text-white">
              {frames.length} Animation Frames Loaded
            </span>
            <button
              onClick={() => {
                setFrames([]);
                setGifBlob(null);
                setGifUrl(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear frames</span>
            </button>
          </div>

          {/* Speed & Loop Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A]">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Frame Delay</span>
                <span>{frameDelay} ms ({Math.round(1000 / frameDelay)} FPS)</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={frameDelay}
                onChange={(e) => {
                  setFrameDelay(Number(e.target.value));
                  setGifBlob(null);
                }}
                className="w-full accent-[var(--accent-text)]"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A]">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Loop Mode
              </span>
              <div className="flex items-center space-x-2 pt-1">
                {[
                  { count: 0, label: 'Infinite Loop' },
                  { count: 1, label: 'Play Once' },
                  { count: 3, label: 'Loop 3 Times' },
                ].map((l) => (
                  <button
                    key={l.count}
                    onClick={() => {
                      setLoopCount(l.count);
                      setGifBlob(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      loopCount === l.count
                        ? 'bg-[var(--accent)] border-[var(--accent-text)] text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Frame strip */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Frame Sequence (Left to Right)
            </span>
            <div className="flex flex-wrap gap-2.5">
              {frames.map((f, i) => (
                <div key={f.id} className="relative group">
                  <img
                    src={f.url}
                    alt={`Frame ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                    #{i + 1}
                  </span>
                  <button
                    onClick={() => removeFrame(f.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* GIF Animation Preview */}
          {gifUrl && (
            <div className="p-4 rounded-xl bg-[#000000] flex flex-col items-center justify-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Rendered Animated GIF Preview
              </span>
              <img
                src={gifUrl}
                alt="Animated GIF"
                className="max-h-[320px] w-auto rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCreateGif}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Encoding GIF89a Frames...' : 'Generate Animated GIF'}</span>
            </button>

            {gifBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download GIF ({formatFileSize(gifBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
