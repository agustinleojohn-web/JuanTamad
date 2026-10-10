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
      a: 'Never. JuanTamad executes 100% inside your web browser. File processing runs using WebAssembly, HTML5 Canvas, and client-side JavaScript. Your confidential photos and documents never leave your physical device.',
    },
    {
      q: 'Is JuanTamad really free with no usage limits?',
      a: 'Yes. There are no subscriptions, credits, daily quotas, watermarks, or sign-up walls. Since computation happens on your computer rather than our servers, it costs us nothing to process unlimited files for you.',
    },
    {
      q: 'How does JuanTamad compare to Google Chrome Labs’ Squoosh?',
      a: 'Squoosh pioneered interactive in-browser image optimization. JuanTamad brings that same Squoosh-inspired live before-and-after slider experience to images, and expands the local-first philosophy to PDFs, Word docs, spreadsheets, and batch jobs.',
    },
    {
      q: 'Can I use JuanTamad offline?',
      a: 'Yes! Once loaded in your browser cache, the application scripts run locally without requiring constant internet access.',
    },
    {
      q: 'What are the limitations of client-side DOCX and Excel parsing?',
      a: 'We parse headings, paragraphs, lists, bold/italic text, and tables locally. However, highly proprietary Microsoft Word layouts (floating shapes, complex macros, SmartArt) or Excel macros cannot be processed without commercial office engines, which we transparently disclose.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section - Full Screen Height */}
      <section className="relative overflow-hidden min-h-[100vh] h-screen flex items-center px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow with #730000 accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-[#730000]/5 blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
        

          {/* Left Mascot Hero Card */}
          <div className="lg:col-span-5 flex justify-center hidden lg:block">
            <div className="relative group w-full">
              <div className="relative overflow-hidden p-3">
                <div className="relative overflow-hidden  flex items-center justify-center">
                  <img
                    src="/Mascot-full.webp"
                    alt="Juan Tamad Mascot - JUAN click away"
                    className="w-full h-full object-contain scale-80 group-hover:scale-85 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>

            {/* Right Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="uppercase inline-flex items-center space-x-2 py-1.5 rounded-full text-xs font-bold text-[#730000] dark:bg-red-950/60 dark:text-red-300  animate-fade-in">
             
              <span>Image tools . File conversion . Zero hassle.</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
              Your Files.{' '}<br></br>
              <span className="text-[#730000] dark:text-red-400">
                JUAN click away.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Relax like Juan Tamad! Batch optimize images with <strong className="text-[#730000] dark:text-red-400 font-bold">Image Compressor</strong>, convert documents, and manipulate PDFs effortlessly with zero uploads and zero setup.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/image-tools/compress"
                className="px-6 py-4 rounded-2xl font-bold text-sm bg-[#730000] hover:bg-[#580000] text-white shadow-xl shadow-[#730000]/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
              >
                <Sliders className="w-4 h-4" />
                <span>Optimize Image</span>
              </Link>
              <Link
                to="/pdf-tools"
                className="px-6 py-4 rounded-2xl font-bold text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-[#730000] shadow-sm flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
              >
                <Files className="w-4 h-4 text-[#730000]" />
                <span>Explore PDF Toolkit</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#730000]" />
                <span>100% On-Device Processing</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-[#730000]" />
                <span>Image Compressor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Discovery Section (Grouped with View All Links) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-bold text-[#730000] uppercase tracking-wider block mb-1">
            Toolkit Directory
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Instant Client-Side Tools
          </h2>
        </div>

        <div className="space-y-16">
          {/* 1. Image Studio Group */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-[#730000]" />
                  <span>Image Studio</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Compress, resize, upscale, and convert images locally.
                </p>
              </div>
              <Link
                to="/image-tools"
                className="text-xs font-bold text-[#730000] dark:text-red-400 hover:underline flex items-center space-x-1"
              >
                <span>View all ({ALL_TOOLS.filter((t) => t.category === 'image').length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ALL_TOOLS.filter((t) => t.category === 'image')
                .slice(0, 6)
                .map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-[#730000] dark:hover:border-[#730000] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#730000]/10 text-[#730000] dark:text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {tool.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#730000] dark:group-hover:text-red-400 transition-colors">
                          {tool.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-[#730000] dark:text-red-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Open Tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* 2. Document Converters Group */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#730000]" />
                  <span>Document Converters</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Convert DOCX, XLSX, CSV, TXT, and HTML files to clean PDF.
                </p>
              </div>
              <Link
                to="/document-tools"
                className="text-xs font-bold text-[#730000] dark:text-red-400 hover:underline flex items-center space-x-1"
              >
                <span>View all ({ALL_TOOLS.filter((t) => t.category === 'document').length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ALL_TOOLS.filter((t) => t.category === 'document')
                .slice(0, 6)
                .map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-[#730000] dark:hover:border-[#730000] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#730000]/10 text-[#730000] dark:text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {tool.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#730000] dark:group-hover:text-red-400 transition-colors">
                          {tool.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-[#730000] dark:text-red-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Open Tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* 3. PDF Toolkit Group */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <Files className="w-5 h-5 text-[#730000]" />
                  <span>PDF Toolkit</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Merge, split, sign, redact, compress, and organize PDF documents.
                </p>
              </div>
              <Link
                to="/pdf-tools"
                className="text-xs font-bold text-[#730000] dark:text-red-400 hover:underline flex items-center space-x-1"
              >
                <span>View all ({ALL_TOOLS.filter((t) => t.category === 'pdf').length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ALL_TOOLS.filter((t) => t.category === 'pdf')
                .slice(0, 6)
                .map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-[#730000] dark:hover:border-[#730000] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#730000]/10 text-[#730000] dark:text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {tool.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#730000] dark:group-hover:text-red-400 transition-colors">
                          {tool.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-[#730000] dark:text-red-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Open Tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* Mascot Featured CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#730000] to-[#990000] text-white p-8 sm:p-12 shadow-xl shadow-[#730000]/20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur border border-white/30">
                <span>Powered by: DisHenyo Digital Solutions</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
                Experience the New Image Compressor &amp; Batch Converter
              </h2>
              <p className="text-sm sm:text-base text-rose-100 max-w-xl leading-relaxed">
                Tune MozJPEG, WebP, AVIF, and color quantization with real-time split view, then batch convert all your images in one swift click. Zero uploads, zero waiting.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/image-tools/compress"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-[#730000] hover:bg-rose-50 shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Open Image Compressor</span>
                </Link>
                <Link
                  to="/pdf-tools"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-black/25 hover:bg-black/35 text-white border border-white/20 transition-all flex items-center space-x-2"
                >
                  <Files className="w-4 h-4" />
                  <span>PDF Toolkit</span>
                </Link>
              </div>
            </div>

            <div className="md:col-span-6 flex justify-center">
              <div className="relative w-full h-auto overflow-hidden">
                <img
                  src="/CTA-optimized.webp"
                  alt="Juan Tamad Mascot"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#730000] dark:text-red-400 uppercase tracking-wider block mb-1">
              Seamless Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              How Local Processing Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Three simple steps with guaranteed client-side data sovereignty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#730000] text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-[#730000]/20">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Drop Your Files
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                Drag any image, PDF, or document straight into your browser. Your browser reads the local binary bytes into memory.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#730000] text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-[#730000]/20">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Inspect &amp; Tune
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                Fine-tune compression with real-time before/after sliders, reorder PDF pages, or format spreadsheets instantly.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#730000] text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-[#730000]/20">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Download Instantly
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                Save your optimized images or compiled PDFs directly to your downloads folder. Download individual files or all as a ZIP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-[#730000] dark:text-red-400 uppercase tracking-wider block mb-1">
            Format Compatibility
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Supported Formats &amp; Standards
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center">
          {[
            { ext: 'WebP', desc: 'Modern high compression' },
            { ext: 'JPEG', desc: 'Universal photographic format' },
            { ext: 'PNG', desc: 'Lossless transparency' },
            { ext: 'AVIF', desc: 'Next-gen browser encoding' },
            { ext: 'PDF', desc: 'Portable Document Format' },
            { ext: 'DOCX', desc: 'Microsoft Word 2007+' },
            { ext: 'XLSX', desc: 'Microsoft Excel sheets' },
            { ext: 'CSV', desc: 'Comma-separated values' },
            { ext: 'TXT', desc: 'Plain text documents' },
            { ext: 'HTML', desc: 'Sanitized web documents' },
            { ext: 'ZIP', desc: 'Bulk batch packaging' },
            { ext: 'GIF / BMP', desc: 'Raster decoding' },
          ].map((fmt) => (
            <div
              key={fmt.ext}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center hover:border-[#730000] transition-colors"
            >
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {fmt.ext}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">{fmt.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold text-[#730000] dark:text-red-400 uppercase tracking-wider block mb-1">
            Questions &amp; Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between transition-colors hover:text-[#730000]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#730000]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};