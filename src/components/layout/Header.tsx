import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sliders,
  FileText,
  Files,
  Moon,
  Sun,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  Minimize2,
  Maximize2,
  Wand2,
  Eraser,
  Smile,
  Edit3,
  SlidersHorizontal,
  RotateCw,
  Compass,
  Info,
  Grid,
  ImagePlus,
  Stamp,
  Film,
  AppWindow,
  Palette,
  Code2,
  ChevronDown,
  ChevronRight,
  Merge,
  Split,
  FileSearch,
  Lock,
  Unlock,
  Crop,
  Layers,
  FileSignature,
  EyeOff,
  FileCheck,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  ArrowRightLeft,
  LayoutGrid,
  Type,
  Globe,
  Smartphone,
  Pipette,
  Apple,
  FolderTree,
  Binary,
  Printer,
  PenTool,
  AlignLeft,
  FileLock2,
  GitCompare,
  Wrench,
  Home
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'image' | 'pdf' | 'document' | null>(null);
  
  // Category selection states
  const [selectedImageCategory, setSelectedImageCategory] = useState('all');
  const [selectedPdfCategory, setSelectedPdfCategory] = useState('all');
  const [selectedDocCategory, setSelectedDocCategory] = useState('all');

  // Mobile submenu expansion state
  const [mobileSection, setMobileSection] = useState<'image' | 'pdf' | 'document' | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close megamenu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when full-screen mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // --- COMPLETE TOOL CATALOGS ---

  const imageCategories = [
    { id: 'all', name: 'All tools', description: 'Browse full catalog', icon: Sparkles },
    { id: 'optimize', name: 'Optimize', description: 'Compress, resize, crop', icon: Minimize2 },
    { id: 'ai', name: 'AI Suite', description: 'Background, upscale, object, blur', icon: Wand2 },
    { id: 'edit', name: 'Edit & Adjust', description: 'Colors, lighting, rotation', icon: Edit3 },
    { id: 'create', name: 'Create', description: 'Collage, meme, watermark', icon: Grid },
    { id: 'convert', name: 'Convert & GIF', description: 'Formats & animations', icon: Film },
    { id: 'icons', name: 'Icons', description: 'Favicons & app icons', icon: AppWindow },
    { id: 'color', name: 'Color Lab', description: 'Eyedropper & palettes', icon: Palette },
    { id: 'dev', name: 'Dev Assets', description: 'iOS/Android asset packs', icon: Code2 },
  ];

  const imageItems = [
    { id: 'compress', category: 'optimize', name: 'Image Compressor', description: 'Squoosh-style slider with WebP, AVIF, JPEG, PNG quality tuning', icon: Sliders, path: '/image-tools/compress' },
    { id: 'convert', category: 'convert', name: 'Image Converter', description: 'Batch convert between WebP, JPEG, PNG, AVIF formats', icon: ArrowRightLeft, path: '/image-tools/convert' },
    { id: 'resize', category: 'resize', name: 'Image Resizer', description: 'Scale images to custom pixel dimensions or percentages', icon: Maximize2, path: '/image-tools/resize' },
    { id: 'crop', category: 'optimize', name: 'Crop Image', description: 'Single or bulk crop by ratio with interactive guides', icon: Crop, path: '/image-tools/crop' },
    { id: 'upscale', category: 'ai', name: 'AI Upscaler', description: 'AI upscaler 2x or 4x with bicubic edge recovery', icon: Sparkles, path: '/image-tools/upscale' },
    { id: 'remove-bg', category: 'ai', name: 'Remove Background', description: 'Automatic client-side background removal with alpha matting', icon: Sparkles, path: '/image-tools/remove-bg' },
    { id: 'object-remover', category: 'ai', name: 'Object Remover', description: 'Erase objects and watermarks with patch inpainting', icon: Eraser, path: '/image-tools/object-remover' },
    { id: 'blur-face', category: 'ai', name: 'Blur Face & Censor', description: 'Blur faces with mosaic pixelate or gaussian blur', icon: EyeOff, path: '/image-tools/blur-face' },
    { id: 'photo-editor', category: 'edit', name: 'Photo Editor', description: 'Quick aesthetic filters and flip/rotate controls', icon: Palette, path: '/image-tools/photo-editor' },
    { id: 'adjust', category: 'edit', name: 'Adjust Colors & Lighting', description: 'Advanced light, tone curves, and contrast grading', icon: SlidersHorizontal, path: '/image-tools/adjust' },
    { id: 'rotate', category: 'edit', name: 'Rotate Image', description: 'Rotate to any angle or batch-rotate in 90° steps', icon: RotateCw, path: '/image-tools/rotate' },
    { id: 'tilt', category: 'edit', name: 'Tilt & Perspective Warp', description: 'Fix architectural keystone distortion with warp', icon: Compass, path: '/image-tools/tilt' },
    { id: 'metadata', category: 'edit', name: 'Image Metadata (EXIF)', description: 'Check camera details and 1-click strip EXIF data', icon: ShieldCheck, path: '/image-tools/metadata' },
    { id: 'collage', category: 'create', name: 'Collage Maker', description: 'Combine photos into clean grids with custom padding', icon: LayoutGrid, path: '/image-tools/collage' },
    { id: 'meme', category: 'create', name: 'Meme Generator', description: 'Add impact text or modern social caption bars', icon: Type, path: '/image-tools/meme' },
    { id: 'watermark', category: 'create', name: 'Watermark Image', description: 'Stamp custom text or diagonal tiled watermarks', icon: Stamp, path: '/image-tools/watermark' },
    { id: 'gif-maker', category: 'convert', name: 'Animated GIF Maker', description: 'Compile multiple frames into looping animated GIFs', icon: Film, path: '/image-tools/gif-maker' },
    { id: 'favicon', category: 'icons', name: 'Favicon Generator', description: 'Generate true .ico and site.webmanifest bundles', icon: Globe, path: '/image-tools/favicon' },
    { id: 'android-icons', category: 'icons', name: 'Android Icon Generator', description: 'Launcher adaptive icons and PWA icon packs', icon: Smartphone, path: '/image-tools/android-icons' },
    { id: 'color-reader', category: 'color', name: 'Color Reader & Palette', description: 'Loupe eyedropper pixel picker and dominant colors', icon: Pipette, path: '/image-tools/color-reader' },
    { id: 'ios-assets', category: 'dev', name: 'iOS Image Set (XCAssets)', description: 'Universal @1x, @2x, @3x retina scale asset catalogs', icon: Apple, path: '/image-tools/ios-assets' },
    { id: 'android-drawables', category: 'dev', name: 'Android Drawable Set', description: 'mdpi–xxxhdpi drawable folder structure for Android', icon: FolderTree, path: '/image-tools/android-drawables' },
  ];

  const pdfCategories = [
    { id: 'all', name: 'All PDF tools', description: 'Browse complete PDF suite', icon: Sparkles },
    { id: 'organize', name: 'Organize & Edit', description: 'Merge, split, rotate, crop', icon: Layers },
    { id: 'optimize', name: 'Optimize & Convert', description: 'Compress, OCR, PDF to Word', icon: Minimize2 },
    { id: 'security', name: 'Security & Sign', description: 'Unlock, sign, redact, watermark', icon: Lock },
    { id: 'advanced', name: 'Advanced Tools', description: 'Compare, repair, form filler', icon: FileSearch },
  ];

  const pdfItems = [
    { id: 'merge', category: 'organize', name: 'Merge PDF', description: 'Combine multiple PDF files into one unified document', icon: Merge, path: '/pdf-tools/merge' },
    { id: 'split', category: 'organize', name: 'Split PDF', description: 'Extract specific pages using visual thumbnail pickers', icon: Split, path: '/pdf-tools/split' },
    { id: 'organize-pdf', category: 'organize', name: 'Organize PDF', description: 'Rearrange, rotate, duplicate, and delete pages visually', icon: Layers, path: '/pdf-tools/organize' },
    { id: 'rotate-pages', category: 'organize', name: 'Rotate PDF', description: 'Rotate all or specific PDF pages by 90°, 180°, or 270°', icon: RotateCw, path: '/pdf-tools/rotate-pages' },
    { id: 'crop-pdf', category: 'organize', name: 'Crop PDF', description: 'Trim page margins with point-precision dimensions', icon: Crop, path: '/pdf-tools/crop' },
    { id: 'compress', category: 'optimize', name: 'Compress PDF', description: 'Reduce file size and optimize image streams locally', icon: Sparkles, path: '/pdf-tools/compress' },
    { id: 'optimize-pdf', category: 'optimize', name: 'Optimize PDF', description: 'Downscale raster objects and clean dictionaries', icon: Sparkles, path: '/pdf-tools/optimize' },
    { id: 'pdf-to-word', category: 'optimize', name: 'PDF to Word (.DOC)', description: 'Convert PDF files into formatted Word documents', icon: FileText, path: '/pdf-tools/pdf-to-word' },
    { id: 'ocr', category: 'optimize', name: 'Gemini 2.0 AI OCR PDF', description: 'Extract and structure text using Gemini AI', icon: Sparkles, path: '/pdf-tools/ocr' },
    { id: 'extract-text', category: 'optimize', name: 'Extract Text', description: 'Extract raw text from PDF documents instantly', icon: FileText, path: '/pdf-tools/extract-text' },
    { id: 'unlock', category: 'security', name: 'Unlock PDF', description: 'Remove password protection from encrypted PDFs', icon: Unlock, path: '/pdf-tools/unlock' },
    { id: 'sign', category: 'security', name: 'Sign PDF', description: 'Draw signatures, type cursive, and stamp approval', icon: PenTool, path: '/pdf-tools/sign' },
    { id: 'redact', category: 'security', name: 'Redact & Blackout', description: 'Draw opaque blackout redactions over sensitive text', icon: EyeOff, path: '/pdf-tools/redact' },
    { id: 'watermark', category: 'security', name: 'Watermark PDF', description: 'Stamp custom text watermarks with live preview', icon: Stamp, path: '/pdf-tools/watermark' },
    { id: 'page-numbers', category: 'advanced', name: 'Page Numbers', description: 'Add numbered pagination headers or footers', icon: Binary, path: '/pdf-tools/page-numbers' },
    { id: 'n-up', category: 'advanced', name: 'N-Up Handouts', description: 'Arrange multiple pages per sheet for print booklets', icon: Printer, path: '/pdf-tools/n-up' },
    { id: 'header-footer', category: 'advanced', name: 'Header & Footer', description: 'Insert dynamic headers and footers with macro tags', icon: AlignLeft, path: '/pdf-tools/header-footer' },
    { id: 'flatten', category: 'advanced', name: 'Flatten PDF', description: 'Fuse interactive form fields into static pages', icon: FileLock2, path: '/pdf-tools/flatten' },
    { id: 'form-filler', category: 'advanced', name: 'PDF Form Filler', description: 'Populate interactive AcroForm text fields', icon: FileSignature, path: '/pdf-tools/form-filler' },
    { id: 'properties', category: 'advanced', name: 'PDF Properties', description: 'Inspect and edit document title, author, and metadata', icon: Info, path: '/pdf-tools/properties' },
    { id: 'compare', category: 'advanced', name: 'Compare PDF', description: 'Visually highlight pixel discrepancies between versions', icon: GitCompare, path: '/pdf-tools/compare' },
    { id: 'color-filters', category: 'advanced', name: 'Grayscale & Dark Mode', description: 'Convert documents to monochrome or inverted dark mode', icon: Moon, path: '/pdf-tools/color-filters' },
    { id: 'repair', category: 'advanced', name: 'Repair PDF', description: 'Reconstruct broken byte streams and fix trailer dictionaries', icon: Wrench, path: '/pdf-tools/repair' },
  ];

  const docCategories = [
    { id: 'all', name: 'All Converters', description: 'Browse all document formats', icon: Sparkles },
    { id: 'office', name: 'Office & Text', description: 'DOCX, XLSX, TXT, CSV to PDF', icon: FileSpreadsheet },
    { id: 'media', name: 'Media & Web', description: 'Images & HTML to PDF', icon: ImageIcon },
  ];

  const docItems = [
    { id: 'image-to-pdf', category: 'media', name: 'Image to PDF', description: 'Combine multiple photos or scans into a single PDF', icon: ImageIcon, path: '/document-tools/image-to-pdf' },
    { id: 'docx-to-pdf', category: 'office', name: 'DOCX to PDF', description: 'Convert Microsoft Word documents to clean PDF locally', icon: FileText, path: '/document-tools/docx-to-pdf' },
    { id: 'txt-to-pdf', category: 'office', name: 'Text to PDF', description: 'Format raw text files into paginated PDF documents', icon: FileText, path: '/document-tools/txt-to-pdf' },
    { id: 'html-to-pdf', category: 'media', name: 'HTML to PDF', description: 'Convert HTML code or web docs into structured PDF', icon: FileCode, path: '/document-tools/html-to-pdf' },
    { id: 'csv-to-pdf', category: 'office', name: 'CSV to PDF', description: 'Transform CSV and tab-delimited sheets into reports', icon: FileSpreadsheet, path: '/document-tools/csv-to-pdf' },
    { id: 'xlsx-to-pdf', category: 'office', name: 'Spreadsheet to PDF', description: 'Parse Excel workbooks and generate tabular PDF reports', icon: FileSpreadsheet, path: '/document-tools/xlsx-to-pdf' },
    { id: 'pdf-to-images', category: 'media', name: 'PDF to Images', description: 'Render every PDF page into high-res PNG or JPEG', icon: Layers, path: '/document-tools/pdf-to-images' },
  ];

  const filteredImageItems = selectedImageCategory === 'all' ? imageItems : imageItems.filter(i => i.category === selectedImageCategory);
  const filteredPdfItems = selectedPdfCategory === 'all' ? pdfItems : pdfItems.filter(i => i.category === selectedPdfCategory);
  const filteredDocItems = selectedDocCategory === 'all' ? docItems : docItems.filter(i => i.category === selectedDocCategory);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors" ref={menuRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 overflow-hidden group-hover:scale-105 transition-transform">
                <img
                  src="/mascot.webp"
                  alt="JuanTamad Mascot"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                    JuanTamad
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#730000] dark:text-red-400 -mt-0.5 hidden sm:block">
                  JUAN click away.
                </p>
              </div>
            </Link>

            {/* Desktop Nav with Megamenus */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-[#730000]/10 text-[#730000] dark:bg-red-950/60 dark:text-red-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4 opacity-80" />
                <span>Home</span>
              </Link>

              {/* 1. Image Studio Megamenu */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'image' ? null : 'image')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    activeDropdown === 'image' || isActive('/image-tools')
                      ? 'bg-[#730000]/10 text-[#730000] dark:bg-red-950/60 dark:text-red-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Sliders className="w-4 h-4 opacity-80" />
                  <span>Image Studio</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'image' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'image' && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[980px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-12 gap-6 z-50">
                    <div className="col-span-3 border-r border-slate-200 dark:border-slate-800 pr-3 space-y-1">
                      <div className="text-xs font-bold text-slate-400 uppercase px-3 py-1 tracking-wider">Categories</div>
                      {imageCategories.map((cat) => {
                        const CatIcon = cat.icon;
                        const isSelected = selectedImageCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedImageCategory(cat.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start space-x-3 ${
                              isSelected
                                ? 'bg-[#730000]/10 text-[#730000] dark:bg-[#730000]/30 dark:text-red-300 border border-[#730000]/30 font-semibold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <CatIcon className="w-4 h-4 mt-0.5 text-[#730000] dark:text-red-400 shrink-0" />
                            <div>
                              <div className="text-sm font-semibold leading-tight">{cat.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{cat.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="col-span-9 pl-1 pr-2 space-y-4">
                      {selectedImageCategory === 'all' && (
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Popular Tools</div>
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {imageItems.slice(0, 3).map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <Link
                                  key={`pop-${item.id}`}
                                  to={item.path}
                                  onClick={() => setActiveDropdown(null)}
                                  className="p-3 rounded-xl  dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800  dark:border-slate-700/60 hover:border-[#730000]/50 transition-all flex items-start space-x-3 group"
                                >
                                  <div className="p-2 rounded-lg bg-[#730000]/10 text-[#730000] dark:bg-red-500/10 dark:text-red-400 group-hover:bg-[#730000]/20 transition-colors shrink-0">
                                    <ItemIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#730000] dark:group-hover:text-red-300 transition-colors">{item.name}</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.description}</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">
                        {selectedImageCategory === 'all' ? 'All Image Studio Tools' : imageCategories.find(c => c.id === selectedImageCategory)?.name}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {filteredImageItems.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={item.id}
                              to={item.path}
                              onClick={() => setActiveDropdown(null)}
                              className="p-3 rounded-xl  dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800  hover:border-[#730000]/50 transition-all flex items-start space-x-3 group"
                            >
                              <div className="p-2 rounded-lg bg-[#730000]/10 text-[#730000] dark:bg-red-500/10 dark:text-red-400 group-hover:bg-[#730000]/20 transition-colors shrink-0">
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#730000] dark:group-hover:text-red-300 transition-colors">{item.name}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.description}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. PDF Toolkit Megamenu */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'pdf' ? null : 'pdf')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    activeDropdown === 'pdf' || isActive('/pdf-tools')
                      ? ' text-[#730000] dark:bg-red-950/60 dark:text-red-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Files className="w-4 h-4 opacity-80" />
                  <span>PDF Toolkit</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'pdf' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'pdf' && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[980px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-12 gap-6 z-50">
                    <div className="col-span-3 border-r border-slate-200 dark:border-slate-800 pr-3 space-y-1">
                      <div className="text-xs font-bold text-slate-400 uppercase px-3 py-1 tracking-wider">Categories</div>
                      {pdfCategories.map((cat) => {
                        const CatIcon = cat.icon;
                        const isSelected = selectedPdfCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedPdfCategory(cat.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start space-x-3 ${
                              isSelected
                                ? 'bg-[#730000]/10 text-[#730000] dark:bg-[#730000]/30 dark:text-red-300 border border-[#730000]/30 font-semibold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <CatIcon className="w-4 h-4 mt-0.5 text-[#730000] dark:text-red-400 shrink-0" />
                            <div>
                              <div className="text-sm font-semibold leading-tight">{cat.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{cat.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="col-span-9 pl-1 pr-2 space-y-4">
                      {selectedPdfCategory === 'all' && (
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Popular PDF Tools</div>
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {pdfItems.slice(0, 3).map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <Link
                                  key={`pop-pdf-${item.id}`}
                                  to={item.path}
                                  onClick={() => setActiveDropdown(null)}
                                  className="p-3 rounded-xl  dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800  dark:border-slate-700/60 hover:border-[#730000]/50 transition-all flex items-start space-x-3 group"
                                >
                                  <div className="p-2 rounded-lg bg-[#730000]/10 text-[#730000] dark:bg-red-500/10 dark:text-red-400 group-hover:bg-[#730000]/20 transition-colors shrink-0">
                                    <ItemIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#730000] dark:group-hover:text-red-300 transition-colors">{item.name}</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.description}</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">
                        {selectedPdfCategory === 'all' ? 'All PDF Toolkit Tools' : pdfCategories.find(c => c.id === selectedPdfCategory)?.name}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {filteredPdfItems.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={item.id}
                              to={item.path}
                              onClick={() => setActiveDropdown(null)}
                              className="p-3 rounded-xl  dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800  dark:border-slate-800 hover:border-[#730000]/50 transition-all flex items-start space-x-3 group"
                            >
                              <div className="p-2 rounded-lg bg-[#730000]/10 text-[#730000] dark:bg-red-500/10 dark:text-red-400 group-hover:bg-[#730000]/20 transition-colors shrink-0">
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#730000] dark:group-hover:text-red-300 transition-colors">{item.name}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.description}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Document Converters Megamenu */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'document' ? null : 'document')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    activeDropdown === 'document' || isActive('/document-tools')
                      ? 'bg-[#730000]/10 text-[#730000] dark:bg-red-950/60 dark:text-red-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4 opacity-80" />
                  <span>Document Converters</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'document' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'document' && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[980px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-12 gap-6 z-50">
                    <div className="col-span-3 border-r border-slate-200 dark:border-slate-800 pr-3 space-y-1">
                      <div className="text-xs font-bold text-slate-400 uppercase px-3 py-1 tracking-wider">Categories</div>
                      {docCategories.map((cat) => {
                        const CatIcon = cat.icon;
                        const isSelected = selectedDocCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedDocCategory(cat.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start space-x-3 ${
                              isSelected
                                ? 'bg-[#730000]/10 text-[#730000] dark:bg-[#730000]/30 dark:text-red-300 border border-[#730000]/30 font-semibold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <CatIcon className="w-4 h-4 mt-0.5 text-[#730000] dark:text-red-400 shrink-0" />
                            <div>
                              <div className="text-sm font-semibold leading-tight">{cat.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{cat.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="col-span-9 pl-1 pr-2 space-y-4">
                      {selectedDocCategory === 'all' && (
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Popular Converters</div>
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {docItems.slice(0, 3).map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <Link
                                  key={`pop-doc-${item.id}`}
                                  to={item.path}
                                  onClick={() => setActiveDropdown(null)}
                                  className="p-3 rounded-xl  dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800  dark:border-slate-700/60 hover:border-[#730000]/50 transition-all flex items-start space-x-3 group"
                                >
                                  <div className="p-2 rounded-lg bg-[#730000]/10 text-[#730000] dark:bg-red-500/10 dark:text-red-400 group-hover:bg-[#730000]/20 transition-colors shrink-0">
                                    <ItemIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#730000] dark:group-hover:text-red-300 transition-colors">{item.name}</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.description}</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">
                        {selectedDocCategory === 'all' ? 'All Document Converters' : docCategories.find(c => c.id === selectedDocCategory)?.name}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {filteredDocItems.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={item.id}
                              to={item.path}
                              onClick={() => setActiveDropdown(null)}
                              className="p-3 rounded-xl  dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800  dark:border-slate-800 hover:border-[#730000]/50 transition-all flex items-start space-x-3 group"
                            >
                              <div className="p-2 rounded-lg bg-[#730000]/10 text-[#730000] dark:bg-red-500/10 dark:text-red-400 group-hover:bg-[#730000]/20 transition-colors shrink-0">
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#730000] dark:group-hover:text-red-300 transition-colors">{item.name}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.description}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/about')
                    ? 'bg-[#730000]/10 text-[#730000] dark:bg-red-950/60 dark:text-red-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 opacity-80" />
                <span>About & Privacy</span>
              </Link>
            </nav>

            {/* Right actions: Theme toggle + Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-label="Open menu"
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Menu Overlay (Moved outside header stacking context) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col overflow-y-auto">
          
          {/* Header Bar */}
          <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3">
              <div className="w-10 h-10 overflow-hidden rounded-xl">
                <img src="/mascot.webp" alt="JuanTamad" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-lg tracking-tight">JuanTamad</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#730000] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Content Body */}
          <div className="container mx-auto px-4 sm:px-6 py-6 space-y-4 max-w-2xl flex-1 pb-16">
            
            {/* All Tools Quick Link */}
            <div>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-sm hover:border-[#730000]"
              >
                <div className="flex items-center space-x-3">
                  <Home className="w-5 h-5 text-[#730000]" />
                  <span>Home</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Image Studio Accordion */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => setMobileSection(mobileSection === 'image' ? null : 'image')}
                className="w-full flex items-center justify-between p-4 font-bold text-sm"
              >
                <div className="flex items-center space-x-3">
                  <Sliders className="w-5 h-5 text-[#730000]" />
                  <span>Image Studio ({imageItems.length} tools)</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${mobileSection === 'image' ? 'rotate-90' : ''}`} />
              </button>
              {mobileSection === 'image' && (
                <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-200 dark:border-slate-800">
                  {imageItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={`mob-img-${item.id}`}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 hover:bg-[#730000]/10 border border-slate-100 dark:border-slate-800 flex items-center space-x-3 group transition-colors"
                      >
                        <ItemIcon className="w-4 h-4 text-[#730000] dark:text-red-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#730000]">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PDF Toolkit Accordion */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => setMobileSection(mobileSection === 'pdf' ? null : 'pdf')}
                className="w-full flex items-center justify-between p-4 font-bold text-sm"
              >
                <div className="flex items-center space-x-3">
                  <Files className="w-5 h-5 text-[#730000]" />
                  <span>PDF Toolkit ({pdfItems.length} tools)</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${mobileSection === 'pdf' ? 'rotate-90' : ''}`} />
              </button>
              {mobileSection === 'pdf' && (
                <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-200 dark:border-slate-800">
                  {pdfItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={`mob-pdf-${item.id}`}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 hover:bg-[#730000]/10 border border-slate-100 dark:border-slate-800 flex items-center space-x-3 group transition-colors"
                      >
                        <ItemIcon className="w-4 h-4 text-[#730000] dark:text-red-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#730000]">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Document Converters Accordion */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => setMobileSection(mobileSection === 'document' ? null : 'document')}
                className="w-full flex items-center justify-between p-4 font-bold text-sm"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-[#730000]" />
                  <span>Document Converters ({docItems.length} tools)</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${mobileSection === 'document' ? 'rotate-90' : ''}`} />
              </button>
              {mobileSection === 'document' && (
                <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-200 dark:border-slate-800">
                  {docItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={`mob-doc-${item.id}`}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 hover:bg-[#730000]/10 border border-slate-100 dark:border-slate-800 flex items-center space-x-3 group transition-colors"
                      >
                        <ItemIcon className="w-4 h-4 text-[#730000] dark:text-red-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#730000]">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* About Link */}
            <div>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-sm hover:border-[#730000]"
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-5 h-5 text-[#730000]" />
                  <span>About &amp; Privacy</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Privacy Sandbox Notice */}
            <div className="pt-2">
              <div className="flex items-center space-x-3 p-4 rounded-2xl text-xs font-medium bg-[#730000]/10 text-[#730000] dark:bg-red-950/60 dark:text-red-300 border border-[#730000]/20">
                <ShieldCheck className="w-5 h-5 shrink-0 text-[#730000]" />
                <span>All operations run locally in your browser sandbox. Zero server uploads.</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};