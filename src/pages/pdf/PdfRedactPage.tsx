import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  EyeOff,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { redactPdf, RedactionBox } from '../../services/pdf/pdfAdvancedService';
import { loadPdfDocument, renderPdfPageToCanvas } from '../../services/pdf/pdfRenderer';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfRedactPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [redactions, setRedactions] = useState<RedactionBox[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  // Canvas interactive drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    const doc = await loadPdfDocument(f);
    setTotalPages(doc.numPages);
    setCurrentPage(1);
    setRedactions([]);
    setResultBlob(null);
  };

  // Render current page onto canvas
  useEffect(() => {
    if (!file || !canvasRef.current) return;
    let cancelled = false;

    loadPdfDocument(file).then(async (doc) => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      await renderPdfPageToCanvas(doc, currentPage, 1.2, canvas);
    });

    return () => {
      cancelled = true;
    };
  }, [file, currentPage]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDragStart({ x, y });
    setDragCurrent({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDragCurrent({ x, y });
  };

  const handleMouseUp = () => {
    if (dragStart && dragCurrent) {
      const x = Math.min(dragStart.x, dragCurrent.x);
      const y = Math.min(dragStart.y, dragCurrent.y);
      const width = Math.abs(dragCurrent.x - dragStart.x);
      const height = Math.abs(dragCurrent.y - dragStart.y);

      if (width > 2 && height > 1) {
        setRedactions((prev) => [
          ...prev,
          {
            pageNumber: currentPage,
            x,
            y,
            width,
            height,
          },
        ]);
        setResultBlob(null);
      }
    }
    setDragStart(null);
    setDragCurrent(null);
  };

  const removeRedaction = (index: number) => {
    setRedactions((prev) => prev.filter((_, i) => i !== index));
    setResultBlob(null);
  };

  const handleApply = async () => {
    if (!file || redactions.length === 0) return;
    setIsProcessing(true);
    try {
      const blob = await redactPdf(file, redactions);
      setResultBlob(blob);
    } catch (err: any) {
      alert(`Redaction failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(resultBlob, `${base}-redacted.pdf`);
  };

  const pageRedactions = redactions.filter((r) => r.pageNumber === currentPage);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Confidentiality Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Redact &amp; Blackout PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Draw permanent blackout redaction rectangles over SSNs, names, and confidential text before sharing.
        </p>
      </div>

      <PrivacyNotice toolName="Redact & Blackout" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop PDF file here to redact"
          description="Click & drag over confidential content to blackout permanently"
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Page {currentPage} of {totalPages} • Total Blackout Boxes: {redactions.length}
              </span>
            </div>

            {/* Page navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded border text-xs font-semibold disabled:opacity-30"
              >
                Previous Page
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 rounded border text-xs font-semibold disabled:opacity-30"
              >
                Next Page
              </button>
            </div>
          </div>

          <p className="text-xs text-[#580000] dark:text-[#730000]/40 font-medium">
            💡 Click and drag directly on the page below to create a blacked-out area.
          </p>

          {/* Interactive Redaction Canvas Container */}
          <div className="flex justify-center bg-slate-100 dark:bg-slate-950 p-4 rounded-xl overflow-auto">
            <div
              className="relative inline-block cursor-crosshair select-none shadow-md rounded border border-slate-200 dark:border-slate-800"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <canvas ref={canvasRef} className="block max-w-full h-auto" />

              {/* Render existing redaction boxes on this page */}
              {pageRedactions.map((r, idx) => (
                <div
                  key={idx}
                  className="absolute bg-black pointer-events-none"
                  style={{
                    left: `${r.x}%`,
                    top: `${r.y}%`,
                    width: `${r.width}%`,
                    height: `${r.height}%`,
                  }}
                />
              ))}

              {/* In-progress drag rectangle */}
              {dragStart && dragCurrent && (
                <div
                  className="absolute bg-black/80 border-2 border-[#730000]/50 pointer-events-none"
                  style={{
                    left: `${Math.min(dragStart.x, dragCurrent.x)}%`,
                    top: `${Math.min(dragStart.y, dragCurrent.y)}%`,
                    width: `${Math.abs(dragCurrent.x - dragStart.x)}%`,
                    height: `${Math.abs(dragCurrent.y - dragStart.y)}%`,
                  }}
                />
              )}
            </div>
          </div>

          {/* List of redactions */}
          {redactions.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Active Blackout Areas ({redactions.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {redactions.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span>Box #{idx + 1} (p. {r.pageNumber})</span>
                    <button
                      onClick={() => removeRedaction(idx)}
                      className="text-[#730000] hover:text-rose-700 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApply}
              disabled={isProcessing || redactions.length === 0}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Burn {redactions.length} Blackouts Permanently</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Redacted PDF</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
