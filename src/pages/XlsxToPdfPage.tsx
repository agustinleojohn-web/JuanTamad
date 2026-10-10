import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Trash2,
  RefreshCw,
  Info,
  Table,
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import {
  readSpreadsheetSheets,
  getSheetPreview,
  convertXlsxToPdf,
} from '../services/documents/xlsxToPdf';
import { downloadBlob } from '../utils/download';
import { formatFileSize } from '../utils/fileSize';

export const XlsxToPdfPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [fontSize, setFontSize] = useState<number>(8);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setError(null);
    try {
      const buffer = await f.arrayBuffer();
      const info = readSpreadsheetSheets(buffer);
      if (info.sheetNames.length === 0) {
        throw new Error('No worksheets found in this workbook.');
      }
      setFile(f);
      setArrayBuffer(buffer);
      setSheetNames(info.sheetNames);
      setActiveSheet(info.activeSheet);
      const preview = getSheetPreview(buffer, info.activeSheet, 10);
      setPreviewRows(preview);
      setPdfBlob(null);
    } catch (err: any) {
      setError(err.message || 'Failed to read Excel workbook.');
    }
  };

  const handleSheetChange = (sheet: string) => {
    setActiveSheet(sheet);
    if (arrayBuffer) {
      const preview = getSheetPreview(arrayBuffer, sheet, 10);
      setPreviewRows(preview);
    }
    setPdfBlob(null);
  };

  const handleConvert = async () => {
    if (!arrayBuffer || !activeSheet) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await convertXlsxToPdf(arrayBuffer, activeSheet, {
        orientation,
        pageSize: 'a4',
        fontSize,
        includeHeaders: true,
        repeatHeaderOnNewPage: true,
      });
      setPdfBlob(blob);
    } catch (err: any) {
      setError(err.message || 'Conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !file) return;
    const base = file.name.replace(/\.xlsx$/i, '');
    downloadBlob(pdfBlob, `${base}-${activeSheet}.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setArrayBuffer(null);
    setSheetNames([]);
    setActiveSheet('');
    setPreviewRows([]);
    setPdfBlob(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Excel Workbook Processor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Spreadsheet to PDF Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Parse Microsoft Excel .xlsx files locally, select individual worksheets, and export paginated PDF reports.
        </p>
      </div>

      <PrivacyNotice toolName="Spreadsheet to PDF" />

      {/* Honest Limitation Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-start space-x-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">Browser-Side Spreadsheet Notice</span>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
            All tabular worksheet cells and formatted data are rendered to PDF. Complex Excel charts, VBA macros, conditional formatting rules, and embedded graphics are omitted.
          </p>
        </div>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto py-8">
          <Dropzone
            onFilesSelected={handleFiles}
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple={false}
            title="Drop your Excel spreadsheet (.xlsx) here"
            description="Process confidential spreadsheets completely in your device browser."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Sheet Tabs & Preview */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#27272A]">
                <div className="flex items-center space-x-2 truncate">
                  <Table className="w-4 h-4 text-[var(--accent-text)]" />
                  <span className="font-bold text-sm text-[#09090B] dark:text-white truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-400">({formatFileSize(file.size)})</span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove file</span>
                </button>
              </div>

              {/* Sheet tabs selector */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Select Worksheet
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {sheetNames.map((sheet) => (
                    <button
                      key={sheet}
                      onClick={() => handleSheetChange(sheet)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        activeSheet === sheet
                          ? 'bg-[var(--accent)] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {sheet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Preview */}
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
            </div>
          </div>

          {/* Right: PDF Settings */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#09090B] rounded-2xl p-5 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-5">
              <h3 className="font-bold text-[#09090B] dark:text-white text-base pb-2 border-b border-slate-100 dark:border-[#27272A]">
                PDF Layout
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
                    Landscape
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
                  <span className="text-slate-700 dark:text-slate-300">Font Size</span>
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

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Convert Sheet to PDF</span>
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
