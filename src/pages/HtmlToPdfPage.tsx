import React, { useState } from 'react';
import { FileCode, Download, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { convertHtmlToPdf, HtmlToPdfOptions, sanitizeHtml } from '../services/documents/htmlToPdf';
import { downloadBlob } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

export const HtmlToPdfPage: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>(
    '<h1>Monthly Report</h1>\n<p>This is a sample document demonstrating <strong>client-side HTML to PDF</strong> generation.</p>\n<ul>\n  <li>100% in-browser processing</li>\n  <li>Zero cloud data leakage</li>\n  <li>Structured headings and lists</li>\n</ul>'
  );
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(40);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    const content = await f.text();
    setHtmlContent(content);
    setPdfBlob(null);
  };

  const handleConvert = async () => {
    if (!htmlContent.trim()) return;
    setIsProcessing(true);
    try {
      const options: HtmlToPdfOptions = { pageSize, orientation, margin };
      const blob = await convertHtmlToPdf(htmlContent, options);
      setPdfBlob(blob);
    } catch (err: any) {
      alert(`Conversion error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, 'converted-document.pdf');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <FileCode className="w-3.5 h-3.5" />
          <span>Sanitized HTML Converter</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          HTML to PDF Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Convert HTML code or uploaded .html files into clean PDF documents with automatic script sanitization.
        </p>
      </div>

      <PrivacyNotice toolName="HTML to PDF" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Editor & Dropzone */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#27272A]">
              <span className="font-bold text-sm text-[#09090B] dark:text-white">
                HTML Source Code
              </span>
              <button
                onClick={() => {
                  setHtmlContent('');
                  setPdfBlob(null);
                }}
                className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            <textarea
              value={htmlContent}
              onChange={(e) => {
                setHtmlContent(e.target.value);
                setPdfBlob(null);
              }}
              rows={14}
              placeholder="Paste HTML here or drop an HTML file..."
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#000000] text-[#09090B] dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-text)]/50"
            />

            <div className="pt-2">
              <Dropzone
                onFilesSelected={handleFiles}
                accept=".html,.htm,text/html"
                compact
                multiple={false}
                title="Or drop an .html file here"
                description="Upload existing HTML markup"
              />
            </div>
          </div>
        </div>

        {/* Right: PDF Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-5">
            <h3 className="font-bold text-[#09090B] dark:text-white text-base pb-2 border-b border-slate-100 dark:border-[#27272A]">
              PDF Options
            </h3>

            {/* Page Size */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Paper Size
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => setPageSize('a4')}
                  className={`py-2 rounded-lg font-bold border ${
                    pageSize === 'a4'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  A4
                </button>
                <button
                  onClick={() => setPageSize('letter')}
                  className={`py-2 rounded-lg font-bold border ${
                    pageSize === 'letter'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Letter
                </button>
              </div>
            </div>

            {/* Orientation */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Orientation
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`py-2 rounded-lg font-bold border ${
                    orientation === 'portrait'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`py-2 rounded-lg font-bold border ${
                    orientation === 'landscape'
                      ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Margins
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[20, 40, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMargin(m)}
                    className={`py-1.5 rounded-lg border font-semibold ${
                      margin === m
                        ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 text-[var(--accent-hover)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {m}pt
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleConvert}
                disabled={isProcessing || !htmlContent.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Generate PDF</span>
              </button>

              {pdfBlob && (
                <button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF ({formatFileSize(pdfBlob.size)})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
