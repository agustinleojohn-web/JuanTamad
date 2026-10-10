import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy,
  Scissors,
  Layers,
  RotateCw,
  Crop,
  Binary,
  Printer,
  Sparkles,
  FileCode,
  FileText,
  Image,
  PenTool,
  EyeOff,
  Stamp,
  AlignLeft,
  FileLock2,
  FileSignature,
  Unlock,
  Info,
  GitCompare,
  Moon,
  Wrench,
  Search,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PrivacyNotice } from '../components/common/PrivacyNotice';

export interface PdfToolItem {
  id: string;
  title: string;
  path: string;
  icon: React.ElementType;
  badge: string;
  badgeColor?: string;
  description: string;
  category: 'edit' | 'convert' | 'security' | 'advanced';
}

export const PDF_ALL_TOOLS: PdfToolItem[] = [
  {
    id: 'merge',
    title: 'Merge PDF',
    path: '/pdf-tools/merge',
    icon: Copy,
    badge: 'Popular',
    badgeColor: 'emerald',
    description: 'Combine multiple PDF files into a single unified document with custom drag reordering.',
    category: 'edit',
  },
  {
    id: 'split',
    title: 'Split PDF',
    path: '/pdf-tools/split',
    icon: Scissors,
    badge: 'Visual Pick',
    badgeColor: 'teal',
    description: 'Extract specific pages or custom ranges using interactive visual thumbnail pickers.',
    category: 'edit',
  },
  {
    id: 'organize',
    title: 'Organize PDF',
    path: '/pdf-tools/organize',
    icon: Layers,
    badge: 'Studio',
    badgeColor: 'purple',
    description: 'Rearrange, rotate (90°), duplicate, delete, and reverse pages with visual thumbnail cards.',
    category: 'edit',
  },
  {
    id: 'compress',
    title: 'Compress PDF',
    path: '/pdf-tools/compress',
    icon: Sparkles,
    badge: 'Client-Side',
    badgeColor: 'cyan',
    description: 'Reduce file size and optimize image streams directly in your browser with zero data loss.',
    category: 'edit',
  },
  {
    id: 'optimize',
    title: 'Optimize PDF',
    path: '/pdf-tools/optimize',
    icon: Sparkles,
    badge: 'Stream Tuning',
    badgeColor: 'emerald',
    description: 'Downscale raster objects, compress internal image streams, and clean redundant dictionary references.',
    category: 'advanced',
  },
  {
    id: 'rotate',
    title: 'Rotate PDF',
    path: '/pdf-tools/rotate-pages',
    icon: RotateCw,
    badge: '1-Click',
    badgeColor: 'emerald',
    description: 'Rotate all or specific PDF pages by 90°, 180°, or 270° with 1-click batch controls.',
    category: 'edit',
  },
  {
    id: 'crop',
    title: 'Crop PDF',
    path: '/pdf-tools/crop',
    icon: Crop,
    badge: 'Trim',
    badgeColor: 'blue',
    description: 'Trim page margins and adjust visible dimensions with point-precision margins.',
    category: 'edit',
  },
  {
    id: 'page-numbers',
    title: 'Page Numbers',
    path: '/pdf-tools/page-numbers',
    icon: Binary,
    badge: 'Pagination',
    badgeColor: 'indigo',
    description: 'Add numbered pagination headers or footers with custom offsets and live visual preview.',
    category: 'edit',
  },
  {
    id: 'n-up',
    title: 'N-Up Handouts',
    path: '/pdf-tools/n-up',
    icon: Printer,
    badge: 'Print Ready',
    badgeColor: 'rose',
    description: 'Arrange 2, 4, or 6 pages per physical sheet for compact printable booklets and handouts.',
    category: 'edit',
  },
  {
    id: 'sign',
    title: 'Sign PDF',
    path: '/pdf-tools/sign',
    icon: PenTool,
    badge: 'Interactive',
    badgeColor: 'emerald',
    description: 'Draw handwritten signatures, type cursive scripts, and stamp approval badges interactively.',
    category: 'security',
  },
  {
    id: 'redact',
    title: 'Redact & Blackout',
    path: '/pdf-tools/redact',
    icon: EyeOff,
    badge: 'Permanent',
    badgeColor: 'rose',
    description: 'Draw opaque blackout redactions over confidential numbers, names, or sensitive text.',
    category: 'security',
  },
  {
    id: 'watermark',
    title: 'Watermark PDF',
    path: '/pdf-tools/watermark',
    icon: Stamp,
    badge: 'Live Preview',
    badgeColor: 'amber',
    description: 'Stamp custom text watermarks with real-time opacity, color, and angle preview.',
    category: 'security',
  },
  {
    id: 'header-footer',
    title: 'Header & Footer',
    path: '/pdf-tools/header-footer',
    icon: AlignLeft,
    badge: 'Macros',
    badgeColor: 'slate',
    description: 'Insert dynamic headers and footers with title, date, and page numbering macro tags.',
    category: 'edit',
  },
  {
    id: 'flatten',
    title: 'Flatten PDF',
    path: '/pdf-tools/flatten',
    icon: FileLock2,
    badge: 'Tamper-Proof',
    badgeColor: 'blue',
    description: 'Fuse interactive form fields, annotations, and visual layers into static un-editable pages.',
    category: 'security',
  },
  {
    id: 'form-filler',
    title: 'PDF Form Filler',
    path: '/pdf-tools/form-filler',
    icon: FileSignature,
    badge: 'AcroForm',
    badgeColor: 'teal',
    description: 'Inspect and populate interactive AcroForm text fields, checkboxes, and dropdowns.',
    category: 'edit',
  },
  {
    id: 'unlock',
    title: 'Unlock PDF',
    path: '/pdf-tools/unlock',
    icon: Unlock,
    badge: 'Decrypt',
    badgeColor: 'amber',
    description: 'Remove password protection, print restrictions, and copy locks from encrypted PDF documents.',
    category: 'security',
  },
  {
    id: 'properties',
    title: 'PDF Properties',
    path: '/pdf-tools/properties',
    icon: Info,
    badge: 'Metadata',
    badgeColor: 'slate',
    description: 'Inspect and edit document title, author, subject, keywords, creator, and producer.',
    category: 'edit',
  },
  {
    id: 'ocr',
    title: 'Gemini 2.0 AI OCR PDF',
    path: '/pdf-tools/ocr',
    icon: Sparkles,
    badge: 'Gemini 2.0 AI',
    badgeColor: 'indigo',
    description: 'Extract and structure text and data from scanned PDFs and document images using Gemini AI.',
    category: 'advanced',
  },
  {
    id: 'compare',
    title: 'Compare PDF',
    path: '/pdf-tools/compare',
    icon: GitCompare,
    badge: 'Pixel Diff',
    badgeColor: 'violet',
    description: 'Visually compare two PDF versions and highlight pixel discrepancies with Pixelmatch.',
    category: 'advanced',
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word (.DOC)',
    path: '/pdf-tools/pdf-to-word',
    icon: FileText,
    badge: 'Editable',
    badgeColor: 'blue',
    description: 'Convert PDF files into formatted Word documents (.doc) and structured Markdown.',
    category: 'convert',
  },
  {
    id: 'extract-text',
    title: 'Extract Text',
    path: '/pdf-tools/extract-text',
    icon: FileText,
    badge: 'Instant',
    badgeColor: 'emerald',
    description: 'Extract raw text from PDF documents instantly with zero API requirements.',
    category: 'convert',
  },
  {
    id: 'color-filters',
    title: 'Grayscale & Dark Mode',
    path: '/pdf-tools/color-filters',
    icon: Moon,
    badge: 'Ink Saver',
    badgeColor: 'slate',
    description: 'Convert color documents into clean monochrome for printing or inverted dark mode for night reading.',
    category: 'advanced',
  },
  {
    id: 'repair',
    title: 'Repair PDF',
    path: '/pdf-tools/repair',
    icon: Wrench,
    badge: 'Recovery',
    badgeColor: 'rose',
    description: 'Reconstruct broken byte streams, fix trailer dictionaries, and rebuild xref tables.',
    category: 'advanced',
  },
  {
    id: 'pdf-to-images',
    title: 'PDF to JPG & PNG',
    path: '/document-tools/pdf-to-images',
    icon: Image,
    badge: 'High-Res',
    badgeColor: 'teal',
    description: 'Export PDF pages to transparent lossless PNG or high-definition JPG images.',
    category: 'convert',
  },
  {
    id: 'image-to-pdf',
    title: 'JPG / PNG to PDF',
    path: '/document-tools/image-to-pdf',
    icon: Image,
    badge: 'Multi-Image',
    badgeColor: 'cyan',
    description: 'Compile multiple transparent PNG or JPG images into standard A4 or auto-sized PDF.',
    category: 'convert',
  },
  {
    id: 'html-to-pdf',
    title: 'HTML to PDF',
    path: '/document-tools/html-to-pdf',
    icon: FileCode,
    badge: 'Rich Editor',
    badgeColor: 'sky',
    description: 'Render and compile rich HTML, CSS, invoices, and templates into clean PDF documents.',
    category: 'convert',
  },
];

export const PdfToolsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'edit' | 'convert' | 'security' | 'advanced'>('all');
  const [search, setSearch] = useState('');

  const filtered = PDF_ALL_TOOLS.filter((t) => {
    const matchesCat = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.badge.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Complete PDF Power Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          PDF Toolkit
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
          Everything you need to merge, split, organize, compress, sign, redact, watermark, and convert PDF documents directly on your device.
        </p>
      </div>

      <PrivacyNotice toolName="PDF Toolkit" />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 text-xs font-semibold">
          {[
            { id: 'all', label: `All PDF Tools (${PDF_ALL_TOOLS.length})` },
            { id: 'edit', label: 'Organize & Edit' },
            { id: 'security', label: 'Security & Sign' },
            { id: 'convert', label: 'Converters' },
            { id: 'advanced', label: 'AI & Advanced' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-[#730000] shadow-sm font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search PDF tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#730000]/50 shadow-sm"
          />
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-[#730000]/50 dark:hover:border-[#730000]/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#730000]/10 dark:bg-[#580000]/60 text-[#730000] dark:text-[#730000]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {tool.badge}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#730000] dark:group-hover:text-[#730000]/40 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-[#730000] dark:text-[#730000]/40 group-hover:translate-x-0.5 transition-transform">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
