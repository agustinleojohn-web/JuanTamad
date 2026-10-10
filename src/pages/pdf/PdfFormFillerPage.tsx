import React, { useState } from 'react';
import {
  FileSignature,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  ListFilter,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { inspectAndFillPdfForm } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfFormFillerPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<Array<{ name: string; type: string; value: string }>>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setResultBlob(null);
    try {
      const res = await inspectAndFillPdfForm(f);
      setFields(res.fields);
      const initial: Record<string, string | boolean> = {};
      res.fields.forEach((fld) => {
        initial[fld.name] = fld.value;
      });
      setFieldValues(initial);
    } catch (err: any) {
      alert(`Could not read form fields: ${err.message}`);
    }
  };

  const handleSaveForm = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await inspectAndFillPdfForm(file, fieldValues);
      if (res.blob) {
        setResultBlob(res.blob);
      }
    } catch (err: any) {
      alert(`Error filling form: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(resultBlob, `${base}-filled.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <FileSignature className="w-3.5 h-3.5" />
          <span>AcroForm Inspector</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          PDF Form Filler
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Inspect, populate, and save interactive PDF form fields and checkboxes directly from your browser.
        </p>
      </div>

      <PrivacyNotice toolName="PDF Form Filler" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop interactive PDF form here"
          description="Detects AcroForm text boxes, checkboxes, and form entries"
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                Found {fields.length} Interactive Form Fields • {formatFileSize(file.size)}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setFields([]);
                setResultBlob(null);
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No interactive AcroForm fields were detected in this PDF. It may be a scanned or flattened document.
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {fields.map((fld) => (
                <div key={fld.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>{fld.name}</span>
                    <span className="text-[10px] text-slate-400">{fld.type}</span>
                  </div>

                  {fld.type.toLowerCase().includes('check') ? (
                    <label className="flex items-center space-x-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(fieldValues[fld.name])}
                        onChange={(e) =>
                          setFieldValues((prev) => ({ ...prev, [fld.name]: e.target.checked }))
                        }
                        className="rounded accent-[var(--accent-text)]"
                      />
                      <span className="text-slate-600 dark:text-slate-400">Checked</span>
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={(fieldValues[fld.name] as string) || ''}
                      onChange={(e) =>
                        setFieldValues((prev) => ({ ...prev, [fld.name]: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveForm}
              disabled={isProcessing || fields.length === 0}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Save Filled Form</span>
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[#27272A] dark:hover:bg-slate-700 shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Filled PDF</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
