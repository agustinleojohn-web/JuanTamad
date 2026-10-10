import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Trash2,
  RefreshCw,
  Table,
  Eye,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { convertCsvToPdf, parseCsv, CsvToPdfOptions } from '../services/documents/csvToPdf';
import { downloadBlob } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

export const CsvToPdfPage: React.FC = () => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [filename, setFilename] = useState<string>('table.csv');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [fontSize, setFontSize] = useState<number>(8);
  const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);
  const [repeatHeaders, setRepeatHeaders] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    const text = await f.text();
    setCsvContent(text);
    setFilename(f.name);
    const parsed = parseCsv(text);
    setPreviewRows(parsed.slice(0, 10));
    setPdfBlob(null);
  };

  const handleConvert = async () => {
    if (!csvContent.trim()) return;
    setIsProcessing(true);
    try {
      const options: CsvToPdfOptions = {
        orientation,
        pageSize,
        fontSize,
        includeHeaders,
        repeatHeaderOnNewPage: repeatHeaders,
        title: filename.replace(/\.csv$/i, ''),
      };
      const blob = await convertCsvToPdf(csvContent, options);
      setPdfBlob(blob);
    } catch (err: any) {
      alert(`Error converting CSV: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const base = filename.replace(/\.csv$/i, '');
    downloadBlob(pdfBlob, `${base}-table.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Tabular PDF Generator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          CSV to PDF Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Turn delimited comma or tab-separated data into neat, paginated PDF tables directly inside your browser.
        </p>
      </div>

      <PrivacyNotice toolName="CSV to PDF" />

      {!csvContent ? (
        <div className="max-w-2xl mx-auto py-8">
          <Dropzone
            onFilesSelected={handleFiles}
            accept=".csv,text/csv,text/plain"
            multiple={false}
            title="Drop your CSV file here"
            description="Supports comma, semicolon, and tab-delimited files."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Preview Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#27272A]">
                <div className="flex items-center space-x-2">
                  <Table className="w-4 h-4 text-[var(--accent-text)]" />
                  <span className="font-bold text-sm text-[#09090B] dark:text-white truncate">
                    {filename}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCsvContent('');
                    setPreviewRows([]);
                    setPdfBlob(null);
                  }}
                  className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove file</span>
                </button>
              </div>

              {/* Data preview */}
              <div className="overflow-x-auto border border-slate-200 dark:border-[#27272A] rounded-xl">
                <table className="w-full text-left text-xs">
                  {previewRows.length > 0 && (
                    <>
                      <thead className="bg-slate-50 dark:bg-[#27272A]/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#27272A]">
                        <tr>
                          {previewRows[0].map((headerCell, i) => (
                            <th key={i} className="p-2.5 whitespace-nowrap">
                              {headerCell || `Col ${i + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                        {previewRows.slice(1).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-[#27272A]/40">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Showing first {previewRows.length} rows preview</span>
                <span className="text-[var(--accent-text)] font-semibold">Ready for PDF generation</span>
              </div>
            </div>
          </div>

          {/* Right: PDF Settings */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-5">
              <h3 className="font-bold text-[#09090B] dark:text-white text-base pb-2 border-b border-slate-100 dark:border-[#27272A]">
                Table Layout Settings
              </h3>

              {/* Orientation */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Orientation
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      setOrientation('landscape');
                      setPdfBlob(null);
                    }}
                    className={`py-2 rounded-lg font-bold border ${
                      orientation === 'landscape'
                        ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Landscape (Recommended)
                  </button>
                  <button
                    onClick={() => {
                      setOrientation('portrait');
                      setPdfBlob(null);
                    }}
                    className={`py-2 rounded-lg font-bold border ${
                      orientation === 'portrait'
                        ? 'border-[var(--accent-text)] bg-[var(--accent)] text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Portrait
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Table Font Size</span>
                  <span className="text-[var(--accent-text)]">{fontSize}pt</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="12"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(parseInt(e.target.value, 10));
                    setPdfBlob(null);
                  }}
                  className="w-full accent-[var(--accent-text)] cursor-pointer"
                />
              </div>

              {/* Header options */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#27272A] text-xs">
                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => {
                      setIncludeHeaders(e.target.checked);
                      setPdfBlob(null);
                    }}
                    className="rounded accent-[var(--accent-text)]"
                  />
                  <span>First row is column header</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={repeatHeaders}
                    onChange={(e) => {
                      setRepeatHeaders(e.target.checked);
                      setPdfBlob(null);
                    }}
                    className="rounded accent-[var(--accent-text)]"
                  />
                  <span>Repeat header on every page</span>
                </label>
              </div>

              {/* Action */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Convert Table to PDF</span>
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
      )}
    </div>
  );
};
