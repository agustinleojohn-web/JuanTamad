import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PrivacyNotice } from '../components/common/PrivacyNotice';

export const DocumentToolsPage: React.FC = () => {
  const tools = [
    {
      title: 'Image to PDF',
      path: '/document-tools/image-to-pdf',
      icon: Image,
      badge: 'Multi-Image',
      description: 'Combine single or multiple JPG, PNG, and WebP images into one organized, high-quality PDF document with custom margins and orientations.',
    },
    {
      title: 'DOCX to PDF',
      path: '/document-tools/docx-to-pdf',
      icon: FileText,
      badge: 'Word Document',
      description: 'Convert Microsoft Word DOCX files locally into clean PDF documents using in-browser structure extraction with honest layout preservation.',
    },
    {
      title: 'Text to PDF',
      path: '/document-tools/txt-to-pdf',
      icon: FileText,
      badge: 'Plain Text',
      description: 'Convert plain text files (.txt) or pasted text into paginated PDF documents with custom font sizes, margins, and page numbering.',
    },
    {
      title: 'HTML to PDF',
      path: '/document-tools/html-to-pdf',
      icon: FileCode,
      badge: 'Web Document',
      description: 'Sanitize and convert HTML code or files into clean PDF documents with structured headings, paragraphs, and list layouts.',
    },
    {
      title: 'CSV to PDF',
      path: '/document-tools/csv-to-pdf',
      icon: FileSpreadsheet,
      badge: 'Tabular Data',
      description: 'Turn delimited CSV tables into formatted paginated PDF reports with custom headers, alternating rows, and landscape layouts.',
    },
    {
      title: 'Spreadsheet to PDF (XLSX)',
      path: '/document-tools/xlsx-to-pdf',
      icon: FileSpreadsheet,
      badge: 'Excel / Sheets',
      description: 'Parse Excel .xlsx workbooks locally, select worksheets, and generate paginated PDF reports without transmitting spreadsheet data.',
    },
    {
      title: 'PDF to Images',
      path: '/document-tools/pdf-to-images',
      icon: Layers,
      badge: 'Page Renderer',
      description: 'Extract PDF pages as high-resolution PNG or JPEG images with selectable render scale, individual downloads, or bulk ZIP export.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Local Document Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Document Converters
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
          Convert Word documents, spreadsheets, text files, and images into clean PDF documents directly on your device.
        </p>
      </div>

      <PrivacyNotice toolName="Document Converters" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="group bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] hover:border-[var(--accent-text)]/50 dark:hover:border-[var(--accent-text)]/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] text-[var(--accent-text)] dark:text-[var(--accent-text)] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-slate-300">
                    {tool.badge}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-[#09090B] dark:text-white group-hover:text-[var(--accent-text)] dark:group-hover:text-[var(--accent-text)]/40 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 flex items-center space-x-1 text-xs font-bold text-[var(--accent-text)] dark:text-[var(--accent-text)] group-hover:translate-x-1 transition-transform">
                <span>Convert file</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
