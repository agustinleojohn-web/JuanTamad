import React, { useState, useRef, useEffect } from 'react';
import {
  Eraser,
  Download,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Undo2,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { inpaintImage } from '../../services/image/advancedImageService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const ImageObjectRemoverPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setResultBlob(null);

    const url = URL.createObjectURL(f);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      initCanvases(img);
    };
    img.src = url;
  };

  const initCanvases = (img: HTMLImageElement) => {
    if (!canvasRef.current || !maskCanvasRef.current) return;
    const c = canvasRef.current;
    const m = maskCanvasRef.current;

    c.width = img.width;
    c.height = img.height;
    m.width = img.width;
    m.height = img.height;

    const ctx = c.getContext('2d');
    const mCtx = m.getContext('2d');
    if (ctx && mCtx) {
      ctx.drawImage(img, 0, 0);
      mCtx.clearRect(0, 0, m.width, m.height);
    }
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const m = maskCanvasRef.current;
    if (!m) return { x: 0, y: 0 };
    const rect = m.getBoundingClientRect();
    const scaleX = m.width / rect.width;
    const scaleY = m.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawBrush(e);
  };

  const drawBrush = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    const m = maskCanvasRef.current;
    if (!m) return;
    const mCtx = m.getContext('2d');
    if (!mCtx) return;

    const { x, y } = getCanvasCoords(e);

    mCtx.fillStyle = 'rgba(239, 68, 68, 0.65)';
    mCtx.beginPath();
    mCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    mCtx.fill();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearMask = () => {
    const m = maskCanvasRef.current;
    if (!m) return;
    const mCtx = m.getContext('2d');
    mCtx?.clearRect(0, 0, m.width, m.height);
  };

  const handleErase = async () => {
    if (!canvasRef.current || !maskCanvasRef.current || !file) return;
    setIsProcessing(true);

    try {
      const c = canvasRef.current;
      const m = maskCanvasRef.current;

      const healedCanvas = await inpaintImage(c, m);
      const ctx = c.getContext('2d');
      ctx?.drawImage(healedCanvas, 0, 0);
      clearMask();

      const mime = file.type || 'image/png';
      const blob = await new Promise<Blob>((resolve) =>
        healedCanvas.toBlob((b) => resolve(b!), mime, 0.95)
      );
      setResultBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop() || 'png';
    downloadBlob(resultBlob, `${base}-erased.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Eraser className="w-3.5 h-3.5" />
          <span>Magic Inpaint Eraser</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Object Remover
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Brush over unwanted objects, people, stamps, or watermarks to erase and fill them seamlessly with surrounding pixels.
        </p>
      </div>

      <PrivacyNotice toolName="Object Remover" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/*"
          multiple={false}
          title="Drop image here to erase objects"
          description="Erase power lines, text, blemishes, or background people"
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
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
                setResultBlob(null);
              }}
              className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change image</span>
            </button>
          </div>

          {/* Eraser Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                Brush Radius: {brushSize}px
              </span>
              <input
                type="range"
                min="8"
                max="80"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-48 accent-[#730000]"
              />
            </div>

            <button
              onClick={clearMask}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1.5"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Clear Brush Strokes</span>
            </button>
          </div>

          {/* Interactive Painting Canvas */}
          <div className="relative w-full max-h-[500px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center select-none">
            <canvas
              ref={canvasRef}
              className="max-h-[480px] w-auto max-w-full object-contain"
            />
            <canvas
              ref={maskCanvasRef}
              onMouseDown={startDraw}
              onMouseMove={drawBrush}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              className="absolute top-0 left-0 max-h-[480px] w-auto max-w-full object-contain cursor-crosshair"
              style={{
                width: canvasRef.current ? `${canvasRef.current.clientWidth}px` : undefined,
                height: canvasRef.current ? `${canvasRef.current.clientHeight}px` : undefined,
                left: canvasRef.current ? `${canvasRef.current.offsetLeft}px` : 0,
                top: canvasRef.current ? `${canvasRef.current.offsetTop}px` : 0,
              }}
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleErase}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Inpainting Pixels...' : 'Erase Painted Object'}</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#730000]/50 dark:hover:bg-[#730000] dark:text-slate-950 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Healed Image</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
