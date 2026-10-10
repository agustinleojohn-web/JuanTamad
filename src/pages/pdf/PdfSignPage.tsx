import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  Type,
  Stamp,
  Check,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { stampSignatureOnPdf, SignaturePlacement } from '../../services/pdf/pdfAdvancedService';
import { getPdfPageCount } from '../../services/pdf/pdfLibService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfSignPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [targetPage, setTargetPage] = useState<number>(1);
  const [mode, setMode] = useState<'draw' | 'type' | 'stamp'>('draw');
  const [typedName, setTypedName] = useState<string>('Juan Dela Cruz');
  const [stampText, setStampText] = useState<string>('APPROVED');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    const count = await getPdfPageCount(f);
    setTotalPages(count);
    setTargetPage(count); // default to last page where signature usually goes
    setResultBlob(null);
  };

  // Drawing canvas logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureDataUrl = (): string => {
    if (mode === 'draw' && canvasRef.current) {
      return canvasRef.current.toDataURL('image/png');
    }

    // Render typed cursive signature or badge stamp to offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = 400;
    offscreen.height = 160;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return '';

    if (mode === 'type') {
      ctx.font = 'italic bold 38px "Brush Script MT", "Caveat", "Segoe Script", cursive, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 200, 80);
      // Subtle signature baseline
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 115);
      ctx.lineTo(360, 115);
      ctx.stroke();
    } else if (mode === 'stamp') {
      // Stamp Badge Box
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 25, 340, 110);
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#059669';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stampText, 200, 65);
      ctx.font = '12px sans-serif';
      ctx.fillText(`VERIFIED ON ${new Date().toLocaleDateString()}`, 200, 105);
    }

    return offscreen.toDataURL('image/png');
  };

  const handleApplySignature = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const dataUrl = getSignatureDataUrl();
      const placement: SignaturePlacement = {
        pageNumber: targetPage,
        imageDataUrl: dataUrl,
        xPercent: 60, // bottom right area
        yPercent: 82,
        widthPercent: 28,
      };
      const blob = await stampSignatureOnPdf(file, placement);
      setResultBlob(blob);
    } catch (err: any) {
      alert(`Signature failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(resultBlob, `${base}-signed.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <PenTool className="w-3.5 h-3.5" />
          <span>Interactive Signature Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign PDF Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Draw handwritten signatures, type cursive scripts, or stamp approval badges directly onto your documents.
        </p>
      </div>

      <PrivacyNotice toolName="Sign PDF" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to sign"
          description="Apply handwritten or stamped signatures securely in-browser"
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                {totalPages} Pages total • {formatFileSize(file.size)}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResultBlob(null);
              }}
              className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Signature Method
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setMode('draw')}
                className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-semibold ${
                  mode === 'draw'
                    ? 'border-[#730000] bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Draw Freehand</span>
              </button>
              <button
                onClick={() => setMode('type')}
                className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-semibold ${
                  mode === 'type'
                    ? 'border-[#730000] bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Type Cursive</span>
              </button>
              <button
                onClick={() => setMode('stamp')}
                className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-semibold ${
                  mode === 'stamp'
                    ? 'border-[#730000] bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Stamp className="w-4 h-4" />
                <span>Approval Badge</span>
              </button>
            </div>
          </div>

          {/* Mode Inputs */}
          {mode === 'draw' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Draw with mouse or finger
                </span>
                <button
                  onClick={clearCanvas}
                  className="text-[#730000] hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Pad</span>
                </button>
              </div>
              <div className="border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 p-2 flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="bg-white rounded border border-slate-200 dark:border-slate-800 cursor-crosshair touch-none w-full max-w-md h-36"
                />
              </div>
            </div>
          )}

          {mode === 'type' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Type Your Name
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center font-serif italic text-3xl text-slate-800 dark:text-slate-100">
                {typedName || 'Signature'}
              </div>
            </div>
          )}

          {mode === 'stamp' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Stamp Text
              </label>
              <div className="flex gap-2">
                {['APPROVED', 'CONFIDENTIAL', 'SIGNED', 'FINAL'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStampText(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      stampText === st
                        ? 'border-[#730000] bg-[#730000] text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Page Selector */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Place Signature On Page:
            </label>
            <select
              value={targetPage}
              onChange={(e) => setTargetPage(parseInt(e.target.value, 10))}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Page {p} {p === totalPages ? '(Last Page)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApplySignature}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Apply Signature onto Page {targetPage}</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Signed PDF</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
