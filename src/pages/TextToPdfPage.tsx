import React, { useState } from 'react';
import { FileText, Download, RefreshCw, Trash2, Edit3, Upload } from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { convertTextToPdf, TextToPdfOptions } from '../services/documents/textToPdf';
import { downloadBlob } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

export const TextToPdfPage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [filename, setFilename] = useState<string>('document.txt');
  const [fontSize, setFontSize] = useState<number>(11);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(40);
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    const content = await f.text();
    setText(content);
    setFilename(f.name);
    setPdfBlob(null);
  };

  const handleConvert = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const options: TextToPdfOptions = {
        fontSize,
        lineHeight: Math.round(fontSize * 1.35),
        pageSize,
        orientation,
        margin,
        includePageNumbers,
      };
      const blob = await convertTextToPdf(text, options);
      setPdfBlob(blob);
    } catch (err: any) {
      alert(`Error creating PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const base = filename.replace(/\.txt$/i, '');
    downloadBlob(pdfBlob, `${base}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Text Formatter</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Text to PDF Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Convert raw text notes, logs, or .txt files into clean, readable, paginated PDF documents.
        </p>
      </div>

      <PrivacyNotice toolName="Text to PDF" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Text Input & Dropzone */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-[#730000]" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Document Text Content
                </span>
              </div>
              {text && (
                <button
                  onClick={() => {
                    setText('');
                    setPdfBlob(null);
                  }}
                  className="text-xs text-[#730000] hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear text</span>
                </button>
              )}
            </div>

            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setPdfBlob(null);
              }}
              placeholder="Paste your plain text here or upload a .txt file below..."
              rows={14}
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#730000]/50"
            />

            <div className="pt-2">
              <Dropzone
                onFilesSelected={handleFiles}
                accept=".txt,text/plain"
                compact
                multiple={false}
                title="Or drop a .txt file here"
                description="Upload existing plain text document"
              />
            </div>
          </div>
        </div>

        {/* Right: PDF Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base pb-2 border-b border-slate-100 dark:border-slate-800">
              Typography &amp; Layout
            </h3>

            {/* Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Font Size</span>
                <span className="text-[#730000]">{fontSize}pt</span>
              </div>
              <input
                type="range"
                min="8"
                max="18"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(parseInt(e.target.value, 10));
                  setPdfBlob(null);
                }}
                className="w-full accent-[#730000] cursor-pointer"
              />
            </div>

            {/* Page Size */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Paper Size
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => {
                    setPageSize('a4');
                    setPdfBlob(null);
                  }}
                  className={`py-2 rounded-lg font-bold border ${
                    pageSize === 'a4'
                      ? 'border-[#730000] bg-[#730000] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  A4
                </button>
                <button
                  onClick={() => {
                    setPageSize('letter');
                    setPdfBlob(null);
                  }}
                  className={`py-2 rounded-lg font-bold border ${
                    pageSize === 'letter'
                      ? 'border-[#730000] bg-[#730000] text-white'
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
                  onClick={() => {
                    setOrientation('portrait');
                    setPdfBlob(null);
                  }}
                  className={`py-2 rounded-lg font-bold border ${
                    orientation === 'portrait'
                      ? 'border-[#730000] bg-[#730000] text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => {
                    setOrientation('landscape');
                    setPdfBlob(null);
                  }}
                  className={`py-2 rounded-lg font-bold border ${
                    orientation === 'landscape'
                      ? 'border-[#730000] bg-[#730000] text-white'
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
                Margin
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[20, 40, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMargin(m);
                      setPdfBlob(null);
                    }}
                    className={`py-1.5 rounded-lg border font-semibold ${
                      margin === m
                        ? 'border-[#730000] bg-[#730000]/10 text-[#580000] dark:bg-[#580000] dark:text-[#730000]/30'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {m}pt
                  </button>
                ))}
              </div>
            </div>

            {/* Page numbers checkbox */}
            <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includePageNumbers}
                onChange={(e) => {
                  setIncludePageNumbers(e.target.checked);
                  setPdfBlob(null);
                }}
                className="rounded accent-[#730000]"
              />
              <span>Include page numbers in footer</span>
            </label>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleConvert}
                disabled={isProcessing || !text.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-md shadow-[#730000]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Create PDF</span>
              </button>

              {pdfBlob && (
                <button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
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
