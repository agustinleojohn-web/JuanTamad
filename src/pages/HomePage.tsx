import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  ArrowRightLeft,
  Maximize2,
  FileText,
  FileSpreadsheet,
  FileCode,
  Layers,
  Copy,
  Scissors,
  RotateCw,
  Image,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  ArrowRight,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Files,
  Crop,
  Binary,
  Printer,
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
  Eraser,
  Palette,
  Film,
  Globe,
  Smartphone,
  Pipette,
  Apple,
  FolderTree,
  LayoutGrid,
  Type,
  Compass,
  FileIcon,
} from 'lucide-react';

interface ToolItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  category: 'image' | 'document' | 'pdf';
  badge: string;
  color: string;
}

const ALL_TOOLS: ToolItem[] = [
  // Image Tools
  {
    id: 'compress',
    title: 'Image Compressor',
    description: 'Squoosh-style before/after comparison slider with WebP, AVIF, JPEG, and PNG quality tuning.',
    path: '/image-tools/compress',
    icon: Sliders,
    category: 'image',
    badge: 'Popular',
    color: 'crimson',
  },
  {
    id: 'convert',
    title: 'Image Converter',
    description: 'Batch convert between WebP, JPEG, PNG, and AVIF formats with instant ZIP download.',
    path: '/image-tools/convert',
    icon: ArrowRightLeft,
    category: 'image',
    badge: 'Bulk',
    color: 'teal',
  },
  {
    id: 'resize',
    title: 'Image Resizer',
    description: 'Scale images to custom pixel dimensions or percentages with aspect ratio locking.',
    path: '/image-tools/resize',
    icon: Maximize2,
    category: 'image',
    badge: 'Precision',
    color: 'red',
  },
  {
    id: 'crop',
    title: 'Crop Image',
    description: 'Single or bulk crop by ratio (1:1, 4:5, 16:9, 9:16, 4:3, 3:2, Freeform) with interactive guides.',
    path: '/image-tools/crop',
    icon: Crop,
    category: 'image',
    badge: 'Aspect Ratio',
    color: 'teal',
  },
  {
    id: 'upscale',
    title: 'AI Upscaler',
    description: 'AI upscaler 2x or 4x with bicubic edge recovery and detail sharpening.',
    path: '/image-tools/upscale',
    icon: Sparkles,
    category: 'image',
    badge: 'AI 4x',
    color: 'indigo',
  },
  {
    id: 'remove-bg',
    title: 'Remove Background',
    description: 'Automatic client-side background removal with alpha matting and transparent PNG export.',
    path: '/image-tools/remove-bg',
    icon: Sparkles,
    category: 'image',
    badge: 'Alpha Matting',
    color: 'sky',
  },
  {
    id: 'object-remover',
    title: 'Object Remover',
    description: 'Erase objects, watermarks, stamps, and blemishes with on-device patch inpainting.',
    path: '/image-tools/object-remover',
    icon: Eraser,
    category: 'image',
    badge: 'Magic Eraser',
    color: 'rose',
  },
  {
    id: 'blur-face',
    title: 'Blur Face & Censor',
    description: 'Blur faces and private data with mosaic pixelate, gaussian blur, or blackout bars.',
    path: '/image-tools/blur-face',
    icon: EyeOff,
    category: 'image',
    badge: 'Privacy Censor',
    color: 'amber',
  },
  {
    id: 'photo-editor',
    title: 'Photo Editor',
    description: 'Quick aesthetic filters (Vintage, Cyberpunk, Noir), rotate 90°, and flip H/V.',
    path: '/image-tools/photo-editor',
    icon: Palette,
    category: 'image',
    badge: 'Filters',
    color: 'purple',
  },
  {
    id: 'adjust',
    title: 'Adjust Colors & Lighting',
    description: 'Advanced light, tone curves, exposure, contrast, warmth, and vignette grading.',
    path: '/image-tools/adjust',
    icon: Sliders,
    category: 'image',
    badge: 'Color Lab',
    color: 'blue',
  },
  {
    id: 'rotate-image',
    title: 'Rotate Image',
    description: 'Rotate one image to any angle (-180° to +180° dial), or batch-rotate in 90° steps.',
    path: '/image-tools/rotate',
    icon: RotateCw,
    category: 'image',
    badge: 'Continuous',
    color: 'red',
  },
  {
    id: 'tilt',
    title: 'Tilt & Perspective Warp',
    description: 'Fix architectural keystone distortion with perspective warp and auto-crop.',
    path: '/image-tools/tilt',
    icon: Compass,
    category: 'image',
    badge: '3D Warp',
    color: 'teal',
  },
  {
    id: 'metadata',
    title: 'Image Metadata (EXIF)',
    description: 'Check hidden camera details and 1-click strip all EXIF metadata for privacy.',
    path: '/image-tools/metadata',
    icon: ShieldCheck,
    category: 'image',
    badge: 'Clean EXIF',
    color: 'cyan',
  },
  {
    id: 'collage',
    title: 'Collage Maker',
    description: 'Layer and combine photos into clean grids with custom padding, borders, and rounding.',
    path: '/image-tools/collage',
    icon: LayoutGrid,
    category: 'image',
    badge: 'Montage',
    color: 'fuchsia',
  },
  {
    id: 'meme',
    title: 'Meme Generator',
    description: 'Upload or template, add top/bottom impact text or modern social caption bars.',
    path: '/image-tools/meme',
    icon: Type,
    category: 'image',
    badge: 'Viral',
    color: 'amber',
  },
  {
    id: 'watermark-image',
    title: 'Watermark Image',
    description: 'Stamp custom text or diagonal tiled watermarks with opacity and angle controls.',
    path: '/image-tools/watermark',
    icon: Stamp,
    category: 'image',
    badge: 'Copyright',
    color: 'rose',
  },
  {
    id: 'gif-maker',
    title: 'Animated GIF Maker',
    description: 'Compile multiple frames and bursts into looping animated GIF89a sequences.',
    path: '/image-tools/gif-maker',
    icon: Film,
    category: 'image',
    badge: 'GIF89a',
    color: 'violet',
  },
  {
    id: 'favicon',
    title: 'Favicon Generator',
    description: 'Generate 16x16, 32x32, 48x48, true .ico, and site.webmanifest bundled in ZIP.',
    path: '/image-tools/favicon',
    icon: Globe,
    category: 'image',
    badge: 'Multi-Res .ICO',
    color: 'blue',
  },
  {
    id: 'android-icons',
    title: 'Android Icon Generator',
    description: 'Launcher adaptive icons (mdpi–xxxhdpi), squircle, circle, and PWA icon packs.',
    path: '/image-tools/android-icons',
    icon: Smartphone,
    category: 'image',
    badge: 'Adaptive',
    color: 'red',
  },
  {
    id: 'color-reader',
    title: 'Color Reader & Palette',
    description: 'Loupe eyedropper pixel picker and top 6 dominant brand colors palette extractor.',
    path: '/image-tools/color-reader',
    icon: Pipette,
    category: 'image',
    badge: 'Eyedropper',
    color: 'pink',
  },
  {
    id: 'ios-assets',
    title: 'iOS Image Set (XCAssets)',
    description: 'Universal @1x, @2x, and @3x retina scale assets with Contents.json manifest ZIP.',
    path: '/image-tools/ios-assets',
    icon: Apple,
    category: 'image',
    badge: 'Xcode',
    color: 'slate',
  },
  {
    id: 'android-drawables',
    title: 'Android Drawable Set',
    description: 'mdpi–xxxhdpi drawable and mipmap ZIP folder structure ready for Android Studio.',
    path: '/image-tools/android-drawables',
    icon: FolderTree,
    category: 'image',
    badge: 'Resource ZIP',
    color: 'teal',
  },
  // Document Tools
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Combine multiple photos or scans into a single PDF with reordering and margin control.',
    path: '/document-tools/image-to-pdf',
    icon: Image,
    category: 'document',
    badge: 'Multi-Image',
    color: 'cyan',
  },
  {
    id: 'docx-to-pdf',
    title: 'DOCX to PDF',
    description: 'Extract and convert Microsoft Word documents to clean PDF locally without cloud servers.',
    path: '/document-tools/docx-to-pdf',
    icon: FileText,
    category: 'document',
    badge: 'Word Engine',
    color: 'blue',
  },
  {
    id: 'txt-to-pdf',
    title: 'Text to PDF',
    description: 'Format raw text files or notes into paginated, cleanly styled PDF documents.',
    path: '/document-tools/txt-to-pdf',
    icon: FileText,
    category: 'document',
    badge: 'Plain Text',
    color: 'indigo',
  },
  {
    id: 'html-to-pdf',
    title: 'HTML to PDF',
    description: 'Sanitize and convert HTML code or web documents into structured printable PDF pages.',
    path: '/document-tools/html-to-pdf',
    icon: FileCode,
    category: 'document',
    badge: 'Web Markup',
    color: 'sky',
  },
  {
    id: 'csv-to-pdf',
    title: 'CSV to PDF',
    description: 'Transform CSV and tab-delimited sheets into landscape tabular PDF reports.',
    path: '/document-tools/csv-to-pdf',
    icon: FileSpreadsheet,
    category: 'document',
    badge: 'Tables',
    color: 'red',
  },
  {
    id: 'xlsx-to-pdf',
    title: 'Spreadsheet to PDF',
    description: 'Parse Excel .xlsx workbooks, select worksheets, and generate tabular PDF reports.',
    path: '/document-tools/xlsx-to-pdf',
    icon: FileSpreadsheet,
    category: 'document',
    badge: 'Excel .XLSX',
    color: 'teal',
  },
  {
    id: 'pdf-to-images',
    title: 'PDF to Images',
    description: 'Render every PDF page into high-resolution PNG or JPEG images with ZIP export.',
    path: '/document-tools/pdf-to-images',
    icon: Layers,
    category: 'document',
    badge: 'High-Res',
    color: 'violet',
  },
  // PDF Tools
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one unified document with custom drag reordering.',
    path: '/pdf-tools/merge',
    icon: Copy,
    category: 'pdf',
    badge: 'Popular',
    color: 'amber',
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    description: 'Extract specific pages or custom ranges using interactive visual thumbnail pickers.',
    path: '/pdf-tools/split',
    icon: Scissors,
    category: 'pdf',
    badge: 'Visual Pick',
    color: 'rose',
  },
  {
    id: 'organize-pdf',
    title: 'Organize PDF',
    description: 'Rearrange, rotate (90°), duplicate, delete, and reverse pages with visual thumbnail cards.',
    path: '/pdf-tools/organize',
    icon: Layers,
    category: 'pdf',
    badge: 'Studio',
    color: 'purple',
  },
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    description: 'Reduce file size and optimize image streams directly in your browser with zero data loss.',
    path: '/pdf-tools/compress',
    icon: Sparkles,
    category: 'pdf',
    badge: 'Client-Side',
    color: 'red',
  },
  {
    id: 'optimize-pdf',
    title: 'Optimize PDF',
    description: 'Downscale raster objects, compress internal image streams, and clean redundant dictionary references.',
    path: '/pdf-tools/optimize',
    icon: Sparkles,
    category: 'pdf',
    badge: 'Stream Tuning',
    color: 'teal',
  },
  {
    id: 'rotate-pages',
    title: 'Rotate PDF',
    description: 'Rotate all or specific PDF pages by 90°, 180°, or 270° with 1-click batch controls.',
    path: '/pdf-tools/rotate-pages',
    icon: RotateCw,
    category: 'pdf',
    badge: 'Orient',
    color: 'red',
  },
  {
    id: 'crop-pdf',
    title: 'Crop PDF',
    path: '/pdf-tools/crop',
    icon: Crop,
    category: 'pdf',
    badge: 'Trim',
    color: 'blue',
    description: 'Trim page margins and adjust visible dimensions with point-precision margins.',
  },
  {
    id: 'page-numbers',
    title: 'Page Numbers',
    path: '/pdf-tools/page-numbers',
    icon: Binary,
    category: 'pdf',
    badge: 'Pagination',
    color: 'indigo',
    description: 'Add numbered pagination headers or footers with custom offsets and live visual preview.',
  },
  {
    id: 'n-up',
    title: 'N-Up Handouts',
    path: '/pdf-tools/n-up',
    icon: Printer,
    category: 'pdf',
    badge: 'Print Ready',
    color: 'rose',
    description: 'Arrange 2, 4, or 6 pages per physical sheet for compact printable booklets and handouts.',
  },
  {
    id: 'sign-pdf',
    title: 'Sign PDF',
    path: '/pdf-tools/sign',
    icon: PenTool,
    category: 'pdf',
    badge: 'Interactive',
    color: 'red',
    description: 'Draw handwritten signatures, type cursive scripts, and stamp approval badges interactively.',
  },
  {
    id: 'redact-pdf',
    title: 'Redact & Blackout',
    path: '/pdf-tools/redact',
    icon: EyeOff,
    category: 'pdf',
    badge: 'Permanent',
    color: 'rose',
    description: 'Draw opaque blackout redactions over confidential numbers, names, or sensitive text.',
  },
  {
    id: 'watermark-pdf',
    title: 'Watermark PDF',
    path: '/pdf-tools/watermark',
    icon: Stamp,
    category: 'pdf',
    badge: 'Live Preview',
    color: 'amber',
    description: 'Stamp custom text watermarks with real-time opacity, color, and angle preview.',
  },
  {
    id: 'header-footer',
    title: 'Header & Footer',
    path: '/pdf-tools/header-footer',
    icon: AlignLeft,
    category: 'pdf',
    badge: 'Macros',
    color: 'slate',
    description: 'Insert dynamic headers and footers with title, date, and page numbering macro tags.',
  },
  {
    id: 'flatten-pdf',
    title: 'Flatten PDF',
    path: '/pdf-tools/flatten',
    icon: FileLock2,
    category: 'pdf',
    badge: 'Tamper-Proof',
    color: 'blue',
    description: 'Fuse interactive form fields, annotations, and visual layers into static un-editable pages.',
  },
  {
    id: 'form-filler',
    title: 'PDF Form Filler',
    path: '/pdf-tools/form-filler',
    icon: FileSignature,
    category: 'pdf',
    badge: 'AcroForm',
    color: 'teal',
    description: 'Inspect and populate interactive AcroForm text fields, checkboxes, and dropdowns.',
  },
  {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    path: '/pdf-tools/unlock',
    icon: Unlock,
    category: 'pdf',
    badge: 'Decrypt',
    color: 'amber',
    description: 'Remove password protection from encrypted PDF documents.',
  },
  {
    id: 'pdf-properties',
    title: 'PDF Properties',
    path: '/pdf-tools/properties',
    icon: Info,
    category: 'pdf',
    badge: 'Metadata',
    color: 'slate',
    description: 'Inspect and edit document title, author, subject, keywords, creator, and producer.',
  },
  {
    id: 'ocr-pdf',
    title: 'Gemini 2.0 AI OCR PDF',
    path: '/pdf-tools/ocr',
    icon: Sparkles,
    category: 'pdf',
    badge: 'Gemini 2.0 AI',
    color: 'indigo',
    description: 'Extract and structure text from scanned PDFs and document images using Gemini AI.',
  },
  {
    id: 'compare-pdf',
    title: 'Compare PDF',
    path: '/pdf-tools/compare',
    icon: GitCompare,
    category: 'pdf',
    badge: 'Pixel Diff',
    color: 'violet',
    description: 'Visually compare two PDF versions and highlight pixel discrepancies with Pixelmatch.',
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word (.DOC)',
    path: '/pdf-tools/pdf-to-word',
    icon: FileText,
    category: 'pdf',
    badge: 'Editable',
    color: 'blue',
    description: 'Convert PDF files into formatted Word documents (.doc) and structured Markdown.',
  },
  {
    id: 'extract-text',
    title: 'Extract Text',
    path: '/pdf-tools/extract-text',
    icon: FileText,
    category: 'pdf',
    badge: 'Instant',
    color: 'red',
    description: 'Extract raw text from PDF documents instantly with zero API requirements.',
  },
  {
    id: 'color-filters',
    title: 'Grayscale & Dark Mode',
    path: '/pdf-tools/color-filters',
    icon: Moon,
    category: 'pdf',
    badge: 'Ink Saver',
    color: 'slate',
    description: 'Convert color documents into clean monochrome for print or inverted dark mode for night reading.',
  },
  {
    id: 'repair-pdf',
    title: 'Repair PDF',
    path: '/pdf-tools/repair',
    icon: Wrench,
    category: 'pdf',
    badge: 'Recovery',
    color: 'rose',
    description: 'Reconstruct broken byte streams, fix trailer dictionaries, and rebuild xref tables.',
  },
];


export const HomePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Are my files uploaded to any server or cloud?',
      a: 'JuanTamad processes supported files directly in your browser. Your files stay on your device during local processing.',
    },
    {
      q: 'Is JuanTamad free to use?',
      a: 'JuanTamad is designed to provide free browser-based tools without requiring an account or subscription.',
    },
    {
      q: 'What can I do with JuanTamad?',
      a: 'You can compress, convert, resize, crop, and edit images, convert documents, and manage PDF files using the available tools.',
    },
    {
      q: 'Can I use JuanTamad offline?',
      a: 'Some functionality may work after the required application assets have been cached. Availability depends on the tool and whether its dependencies are already available locally.',
    },
    {
      q: 'Are there limitations to document conversion?',
      a: 'Yes. Complex document layouts, embedded objects, macros, and proprietary formatting may not be reproduced exactly by browser-based conversion tools.',
    },
  ];

  const imageTools = ALL_TOOLS.filter((tool) => tool.category === 'image');
  const documentTools = ALL_TOOLS.filter(
    (tool) => tool.category === 'document',
  );
  const pdfTools = ALL_TOOLS.filter((tool) => tool.category === 'pdf');

  const featuredTools = [
    imageTools.find((tool) => tool.id === 'compress'),
    imageTools.find((tool) => tool.id === 'convert'),
    imageTools.find((tool) => tool.id === 'resize'),
    ALL_TOOLS.find((tool) => tool.id === 'remove-bg'),
    ALL_TOOLS.find((tool) => tool.id === 'image-to-pdf'),
    ALL_TOOLS.find((tool) => tool.id === 'merge-pdf'),
  ].filter((tool): tool is ToolItem => Boolean(tool));

  const toolGroups = [
    {
      title: 'Image tools',
      description: 'Optimize, convert, edit, and prepare your images.',
      icon: Image,
      path: '/image-tools',
      tools: imageTools.slice(0, 6),
      count: imageTools.length,
    },
    {
      title: 'Document converters',
      description: 'Turn common documents and data files into PDFs.',
      icon: FileText,
      path: '/document-tools',
      tools: documentTools.slice(0, 3),
      count: documentTools.length,
    },
    {
      title: 'PDF toolkit',
      description: 'Organize, optimize, sign, and manage PDF documents.',
      icon: Files,
      path: '/pdf-tools',
      tools: pdfTools.slice(0, 6),
      count: pdfTools.length,
    },
  ];

  return (
    <div className="overflow-hidden pb-16">
      {/* HERO */}
      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-[var(--accent)]/[0.07] via-transparent to-transparent"
        />

        <div className="mx-auto grid min-h-[600px] w-full max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:min-h-[660px] lg:grid-cols-2 lg:gap-12 lg:px-10">
          {/* Hero copy */}
          <div className="order-1 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-6 inline-flex items-center px-3.5 py-2 text-xs font-bold text-[var(--accent-text)]">
              
              YOUR ALL-IN-ONE FILE TOOLKIT
            </div>

            <h1 className="max-w-2xl text-balance text-4xl font-black leading-[1.06] tracking-[-0.045em] text-[#09090B] dark:text-white min-[420px]:text-5xl sm:text-6xl lg:text-7xl">
              Your files.
              <br />
              <span className="text-[var(--accent-text)]">
                Juan click away.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
              Compress images, convert files, and manage PDFs without the
              unnecessary hassle. Simple tools, right in your browser.
            </p>

            <div className="mt-8 flex w-full max-w-md flex-col gap-3 min-[480px]:flex-row lg:max-w-none">
              <Link
                to="/image-tools/compress"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-text)] focus-visible:ring-offset-2"
              >
                <Sliders className="h-4 w-4" />
                Compress an image
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>

              <Link
                to="/image-tools"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:border-[var(--accent)] hover:bg-slate-50 dark:border-[#303036] dark:bg-[#111113] dark:text-white dark:hover:bg-[#19191d]"
              >
                Explore all tools
                <ArrowRightLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-slate-500 dark:text-slate-400 lg:justify-start">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--accent-text)]" />
                Browser-based processing
              </span>
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-[var(--accent-text)]" />
                No account required
              </span>
            </div>
          </div>

          {/* Mascot: preserve 384 × 339 ratio */}
          <div className="order-2 flex min-w-0 items-center justify-center lg:order-2">
            <div className="relative w-[190px] max-w-full sm:w-[240px] lg:w-[min(100%,340px)]">
              <div
                aria-hidden="true"
                className="absolute inset-[12%] -z-10 rounded-full bg-[var(--accent)]/[0.09] blur-3xl"
              />
              <img
                src="/hero-wave.gif"
                alt="JuanTamad mascot waving hello"
                width={384}
                height={339}
                className="block h-auto w-full object-contain"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK VALUE STRIP */}
      <section className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-[#29292f] dark:border-[#29292f] dark:bg-[#101012] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            {
              icon: Zap,
              title: 'Quick workflows',
              text: 'Straightforward tools for everyday file tasks.',
            },
            {
              icon: ShieldCheck,
              title: 'Privacy-minded',
              text: 'Local processing for supported operations.',
            },
            {
              icon: Layers,
              title: 'One toolkit',
              text: 'Image, document, and PDF utilities together.',
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="flex items-start gap-3.5 p-5 sm:p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/[0.09] text-[var(--accent-text)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#09090B] dark:text-white">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* POPULAR TOOLS */}
      <section className="mx-auto mt-20 w-full max-w-7xl px-5 sm:mt-28 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent-text)]">
              Start here
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#09090B] dark:text-white sm:text-4xl">
              Get things done.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Jump straight into a tool. No need to browse the entire toolkit
              first.
            </p>
          </div>

          <Link
            to="/image-tools"
            className="inline-flex items-center gap-2 self-start text-sm font-bold text-[var(--accent-text)] transition hover:gap-3 sm:self-auto"
          >
            Browse tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)]/50 hover:shadow-xl hover:shadow-slate-900/[0.04] dark:border-[#29292f] dark:bg-[#101012] dark:hover:shadow-black/20 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)]/[0.09] text-[var(--accent-text)] transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-[#242428] dark:text-slate-300">
                    {tool.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-extrabold text-[#09090B] transition-colors group-hover:text-[var(--accent-text)] dark:text-white">
                  {tool.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {tool.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-[var(--accent-text)] dark:border-[#29292f]">
                  Open tool
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TOOL DIRECTORY */}
      <section className="mx-auto mt-24 w-full max-w-7xl px-5 sm:mt-32 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent-text)]">
            The toolkit
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#09090B] dark:text-white sm:text-4xl">
            Everything in its place.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            Find the right utility for your next image, document, or PDF task.
          </p>
        </div>

        <div className="mt-10 space-y-12">
          {toolGroups.map((group) => {
            const GroupIcon = group.icon;

            return (
              <div key={group.title}>
                <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-[#29292f] sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/[0.09] text-[var(--accent-text)]">
                      <GroupIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#09090B] dark:text-white">
                        {group.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={group.path}
                    className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-[var(--accent-text)] hover:gap-2.5 sm:self-center"
                  >
                    View all {group.count}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.tools.map((tool) => {
                    const Icon = tool.icon;

                    return (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        className="group flex min-w-0 items-start gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 transition hover:border-[var(--accent)]/50 hover:bg-slate-50 dark:border-[#29292f] dark:bg-[#101012] dark:hover:bg-[#171719]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/[0.08] text-[var(--accent-text)]">
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-[#09090B] group-hover:text-[var(--accent-text)] dark:text-white">
                            {tool.title}
                          </h4>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {tool.description}
                          </p>
                        </div>

                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)]" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURE CTA */}
      <section className="mx-auto mt-24 w-full max-w-7xl px-5 sm:mt-32 sm:px-8 lg:px-10">
        <div className="relative isolate overflow-hidden rounded-3xl bg-[var(--accent)] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          />

          <div className="grid items-center gap-4 p-6 sm:p-9 md:grid-cols-2 md:gap-6 md:p-12 lg:p-14">
            <div className="relative z-10 py-3 md:py-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/90 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Made for your workflow
              </span>

              <h2 className="mt-5 max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Better images.
                <br />
                Less waiting.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
                Fine-tune image quality, compare the results, and convert
                multiple files in one workflow.
              </p>

              <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
                <Link
                  to="/image-tools/compress"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[var(--accent-text)] shadow-lg transition hover:-translate-y-0.5 hover:bg-white/95"
                >
                  <Sliders className="h-4 w-4" />
                  Try image compressor
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/image-tools/convert"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Batch convert
                </Link>
              </div>

              <p className="mt-5 text-xs text-white/70">
                Powered by DisHenyo Digital Solutions
              </p>
            </div>

            {/* 1536 × 1024 asset: preserve its native 3:2 ratio */}
            <div className="relative mx-auto w-full max-w-[520px] md:max-w-none">
              <img
                src="/CTA-optimized.webp"
                alt="JuanTamad image optimization illustration"
                width={1536}
                height={1024}
                className="block h-auto w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      
<section className="mx-auto mt-24 w-full max-w-7xl px-5 sm:mt-32 sm:px-8 lg:px-10">
  <div className="relative overflow-hidden rounded-3xl ">
    {/* Subtle decorative accents */}
   

    {/* Section heading */}
    <div className="relative mx-auto max-w-2xl text-center">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent-text)]">
        Simple by design
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-tight text-[#09090B] dark:text-white sm:text-4xl lg:text-5xl">
        From file to <span className="text-[var(--accent-text)]">finished.</span>
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
        Three simple steps to get your files ready, right in your browser.
      </p>
    </div>

    {/* Workflow steps */}
    <div className="relative mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6 lg:mt-14">
      {[
        {
          number: '01',
          image: '/step1-optimized.webp',
          alt: 'JuanTamad using a laptop to get started',
          title: 'Choose your files',
          text: 'Pick a tool and select the images or documents you want to work with.',
          accent: 'from-sky-500/10 to-transparent',
        },
        {
          number: '02',
          image: '/step2-optimized.webp',
          alt: 'JuanTamad adjusting image settings',
          title: 'Make adjustments',
          text: 'Fine-tune the available settings and preview your output before processing.',
          accent: 'from-[var(--accent)]/10 to-transparent',
        },
        {
          number: '03',
          image: '/step3-optimized.webp',
          alt: 'JuanTamad celebrating a completed file',
          title: 'Save your result',
          text: 'Download your finished file or batch results when the tool supports it.',
          accent: 'from-emerald-500/10 to-transparent',
        },
      ].map((step) => (
        <article
          key={step.number}
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-5 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:shadow-xl hover:shadow-slate-900/[0.04] dark:border-[#29292f] dark:bg-[#151518]/80 dark:hover:shadow-black/20 sm:p-6 lg:p-7"
        >
          {/* Mascot illustration area */}
          <div className={`relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b ${step.accent} sm:h-64 lg:h-60`}>
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]/[0.07] blur-2xl transition-transform duration-500 group-hover:scale-125"
            />

            <img
              src={step.image}
              alt={step.alt}
              width={512}
              height={512}
              loading="lazy"
              decoding="async"
              className="relative z-10 h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />

           
          </div>

          {/* Step details */}
          <div className="flex flex-1 flex-col pt-6 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--accent-text)]">
              Step {step.number}
            </p>

            <h3 className="mt-2 text-xl font-extrabold tracking-tight text-[#09090B] dark:text-white sm:text-2xl">
              {step.title}
            </h3>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              {step.text}
            </p>
          </div>
        </article>
      ))}
    </div>

    {/* Privacy note */}
    <div className="relative mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400 sm:mt-10 sm:text-sm">
      <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--accent-text)]" />
      <span>Simple tools. Straightforward workflow. No unnecessary steps.</span>
    </div>
  </div>
</section>


      {/* FORMATS */}
      <section className="mx-auto mt-24 w-full max-w-7xl px-5 sm:mt-32 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent-text)]">
              Compatibility
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#09090B] dark:text-white sm:text-4xl">
              Files of many formats.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Available formats vary by tool and browser support.
            </p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { ext: 'WebP', desc: 'Web images' },
            { ext: 'JPEG', desc: 'Photographs' },
            { ext: 'PNG', desc: 'Transparency' },
            { ext: 'AVIF', desc: 'Modern images' },
            { ext: 'PDF', desc: 'Documents' },
            { ext: 'DOCX', desc: 'Word files' },
            { ext: 'XLSX', desc: 'Spreadsheets' },
            { ext: 'CSV', desc: 'Tabular data' },
            { ext: 'TXT', desc: 'Plain text' },
            { ext: 'HTML', desc: 'Web documents' },
            { ext: 'GIF', desc: 'Animated images' },
            { ext: 'ZIP', desc: 'Batch downloads' },
          ].map((format) => (
            <div
              key={format.ext}
              className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[var(--accent)]/50 dark:border-[#29292f] dark:bg-[#101012]"
            >
              <p className="text-base font-black text-[#09090B] dark:text-white">
                {format.ext}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {format.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-24 w-full max-w-4xl px-5 sm:mt-32 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent-text)]">
            Good to know
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#09090B] dark:text-white sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            A few details about using JuanTamad and its browser-based tools.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            const answerId = `homepage-faq-${index}`;

            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#29292f] dark:bg-[#101012]"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-[#09090B] transition hover:text-[var(--accent-text)] dark:text-white sm:p-6 sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-[var(--accent-text)]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={answerId}
                    className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-6 text-slate-600 dark:border-[#29292f] dark:text-slate-400 sm:px-6 sm:pb-6"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto mt-20 w-full max-w-7xl px-5 sm:mt-28 sm:px-8 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#29292f] dark:bg-[#101012] sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#09090B] dark:text-white sm:text-2xl">
              Ready to make file work easier?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Pick a tool and get started in just a few clicks.
            </p>
          </div>

          <Link
            to="/image-tools"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Explore the toolkit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
