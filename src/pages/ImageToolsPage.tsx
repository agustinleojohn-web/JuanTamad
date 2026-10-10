import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  ArrowRightLeft,
  Maximize2,
  Crop,
  Sparkles,
  Eraser,
  EyeOff,
  Palette,
  RotateCw,
  Compass,
  ShieldCheck,
  LayoutGrid,
  Type,
  Stamp,
  Film,
  Globe,
  Smartphone,
  Pipette,
  Apple,
  FolderTree,
  ArrowRight,
  Search,
} from 'lucide-react';
import { PrivacyNotice } from '../components/common/PrivacyNotice';

interface ToolDef {
  title: string;
  path: string;
  icon: React.ElementType;
  category: 'optimize' | 'ai' | 'edit' | 'create' | 'convert' | 'icons' | 'color' | 'dev';
  badge: string;
  description: string;
  highlights: string[];
}

const TOOLS: ToolDef[] = [
  
  {
    title: 'Compress Image',
    path: '/image-tools/compress',
    icon: Sliders,
    category: 'optimize',
    badge: 'Popular',
    description: 'Upload, drag & drop, or paste—best quality, target KB, live compare slider, bulk ZIP.',
    highlights: ['Interactive comparison slider', 'Target KB mode', 'Instant byte savings calculation'],
  },
  {
    title: 'Resize Image',
    path: '/image-tools/resize',
    icon: Maximize2,
    category: 'optimize',
    badge: 'Social Presets',
    description: 'Pixels, percent, or social presets (IG, YouTube, Twitter/X, TikTok) with aspect ratio lock and bulk ZIP.',
    highlights: ['Exact pixels & percentage', 'Social media presets', 'Aspect ratio locking'],
  },
  {
    title: 'Crop Image',
    path: '/image-tools/crop',
    icon: Crop,
    category: 'optimize',
    badge: 'Ratio Presets',
    description: 'Single or bulk crop by ratio (1:1, 4:5, 16:9, 9:16, 4:3, 3:2, Freeform) with point-precision margins.',
    highlights: ['Interactive crop overlay', 'Standard aspect ratios', 'Lossless crop export'],
  },

  // 2. AI
  {
    title: 'AI Upscaler',
    path: '/image-tools/upscale',
    icon: Sparkles,
    category: 'ai',
    badge: 'Super-Res',
    description: 'AI upscaler 2x or 4x with bicubic edge recovery, detail sharpening, and zero quality loss.',
    highlights: ['200% & 400% upscale', 'Unsharp mask detail', 'Side-by-side comparison'],
  },
  {
    title: 'Remove Background',
    path: '/image-tools/remove-bg',
    icon: Sparkles,
    category: 'ai',
    badge: 'Alpha Matting',
    description: 'Client-side auto background removal with color clustering, edge detection, and transparent PNG export.',
    highlights: ['Auto subject isolation', 'Sensitivity slider', 'Custom solid backdrops'],
  },
  {
    title: 'Object Remover',
    path: '/image-tools/object-remover',
    icon: Eraser,
    category: 'ai',
    badge: 'Inpainting Brush',
    description: 'Erase unwanted objects, watermarks, stamps, and blemishes with on-device patch inpainting.',
    highlights: ['Interactive eraser brush', 'Adjustable brush radius', 'Surrounding pixel healing'],
  },
  {
    title: 'Blur Face & Censor',
    path: '/image-tools/blur-face',
    icon: EyeOff,
    category: 'ai',
    badge: 'Privacy Censor',
    description: 'Blur faces and confidential numbers with mosaic pixelate, gaussian blur, or blackout boxes.',
    highlights: ['Multiple censor boxes', 'Pixelate & Gaussian blur', 'Blackout privacy bars'],
  },

  // 3. Edit
  {
    title: 'Photo Editor',
    path: '/image-tools/photo-editor',
    icon: Palette,
    category: 'edit',
    badge: 'Aesthetic Filters',
    description: 'Quick filters (Vintage, Cyberpunk, Noir, Golden Hour, Nordic Cool), rotate 90°, and flip H/V.',
    highlights: ['8 cinema filter presets', '90° step rotations', 'Horizontal & vertical flip'],
  },
  {
    title: 'Adjust Colors & Lighting',
    path: '/image-tools/adjust',
    icon: Sliders,
    category: 'edit',
    badge: 'Pro Grading',
    description: 'Advanced light, exposure, contrast, tone curves, saturation, warmth, and vignette controls.',
    highlights: ['Exposure & contrast', 'Temperature warmth', 'Radial vignette shading'],
  },
  {
    title: 'Rotate Image',
    path: '/image-tools/rotate',
    icon: RotateCw,
    category: 'edit',
    badge: 'Custom Angle',
    description: 'Rotate one image to any angle (-180° to +180° dial), or batch-rotate in 90° steps with auto-expand canvas.',
    highlights: ['Continuous angle dial', '90° clockwise/counter', 'Auto bounding box expansion'],
  },
  {
    title: 'Tilt & Perspective Warp',
    path: '/image-tools/tilt',
    icon: Compass,
    category: 'edit',
    badge: '3D Keystoning',
    description: 'Fix architectural keystone distortion and skewed document scans with perspective warp & auto-crop.',
    highlights: ['Horizontal & vertical tilt', '3D matrix projection', 'Optional edge auto-crop'],
  },
  {
    title: 'Image Metadata (EXIF)',
    path: '/image-tools/metadata',
    icon: ShieldCheck,
    category: 'edit',
    badge: 'Privacy Cleaner',
    description: 'Check hidden details (camera, ISO, date, focal length) and 1-click strip all EXIF metadata.',
    highlights: ['Camera model & settings', 'Creation timestamps', '1-click EXIF stripping'],
  },

  // 4. Create
  {
    title: 'Collage Maker',
    path: '/image-tools/collage',
    icon: LayoutGrid,
    category: 'create',
    badge: 'Multi-Photo',
    description: 'Combine multiple images into 2-split, 3-column, 4-grid, and 6-grid layouts with custom margins and rounding.',
    highlights: ['5 grid templates', 'Spacing & rounded corners', 'Custom background colors'],
  },
  {
    title: 'Meme Generator',
    path: '/image-tools/meme',
    icon: Type,
    category: 'create',
    badge: 'Viral Maker',
    description: 'Upload or template, add classic top/bottom Impact text or modern Twitter-style caption banners.',
    highlights: ['Classic top & bottom text', 'Modern social caption', 'Custom colors & outlines'],
  },
  {
    title: 'Watermark Image',
    path: '/image-tools/watermark',
    icon: Stamp,
    category: 'create',
    badge: 'Copyright Stamp',
    description: 'Stamp custom text watermarks with real-time opacity, color, diagonal repetition, and angle preview.',
    highlights: ['Diagonal repeat pattern', 'Custom opacity & angle', 'Corner signature placement'],
  },

  // 5. Convert
  {
    title: 'Image Converter',
    path: '/image-tools/convert',
    icon: ArrowRightLeft,
    category: 'convert',
    badge: 'Batch Supported',
    description: 'Batch convert between JPG, PNG, WebP, AVIF, and BMP with lossless/lossy tuning and ZIP download.',
    highlights: ['Bulk format conversion', 'Quality tuning', 'One-click ZIP download'],
  },
  {
    title: 'Animated GIF Maker',
    path: '/image-tools/gif-maker',
    icon: Film,
    category: 'convert',
    badge: 'Sequencer',
    description: 'Compile multiple frames and photo bursts into looping animated GIF89a sequences directly in browser.',
    highlights: ['Custom frame delay / FPS', 'Looping controls', 'In-browser player preview'],
  },

  // 6. Icons
  {
    title: 'Favicon Generator',
    path: '/image-tools/favicon',
    icon: Globe,
    category: 'icons',
    badge: 'Multi-Res .ICO',
    description: 'Generate multi-size package: 16x16, 32x32, 48x48, 180x180, true .ico, site.webmanifest, and HTML tags in ZIP.',
    highlights: ['True binary .ico format', 'Apple touch icons', 'Webmanifest & HTML tags'],
  },
  {
    title: 'Android Icon Generator',
    path: '/image-tools/android-icons',
    icon: Smartphone,
    category: 'icons',
    badge: 'Adaptive Masks',
    description: 'Compile launcher icons (mdpi–xxxhdpi) with squircle, circle, rounded square, and PWA icon packs.',
    highlights: ['Adaptive icon shapes', '5 density directories', 'Play Store 512px asset'],
  },

  // 7. Color
  {
    title: 'Color Reader & Palette',
    path: '/image-tools/color-reader',
    icon: Pipette,
    category: 'color',
    badge: 'Eyedropper Loupe',
    description: 'Sample pixel colors with a magnifying eyedropper and extract top 6 dominant brand palettes (HEX, RGB, HSL).',
    highlights: ['Pixel loupe magnifier', 'Dominant color extraction', '1-click HEX/RGB copy'],
  },

  // 8. Dev
  {
    title: 'iOS Image Set (XCAssets)',
    path: '/image-tools/ios-assets',
    icon: Apple,
    category: 'dev',
    badge: 'Xcode Ready',
    description: 'Compile @1x, @2x, and @3x retina scale assets with formatted Contents.json inside an .imageset ZIP.',
    highlights: ['Xcode asset catalogue', 'Universal @1x/@2x/@3x', 'Contents.json manifest'],
  },
  {
    title: 'Android Drawable Set',
    path: '/image-tools/android-drawables',
    icon: FolderTree,
    category: 'dev',
    badge: 'Resource Bundler',
    description: 'Generate production drawable directories (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) in a single drag-and-drop ZIP.',
    highlights: ['Android Studio structure', 'Automatic downscaling', 'Clean resource naming'],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'optimize', label: 'Optimize' },
  { id: 'ai', label: 'AI Suite' },
  { id: 'edit', label: 'Edit' },
  { id: 'create', label: 'Create' },
  { id: 'convert', label: 'Convert' },
  { id: 'icons', label: 'Icons' },
  { id: 'color', label: 'Color' },
  { id: 'dev', label: 'Developer' },
];

export const ImageToolsPage: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = TOOLS.filter((t) => {
    const matchCat = selectedCat === 'all' || t.category === selectedCat;
    const matchSearch =
      searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>100% Client-Side Image Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Image Tools &amp; Creator Studio
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
          Complete browser-based image toolkit: optimize with Squoosh Studio, upscale, remove backgrounds, erase objects, edit colors, make GIFs &amp; memes, and generate app icon sets with zero cloud uploads.
        </p>
      </div>

      <PrivacyNotice toolName="Image Studio" />

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-[#27272A]">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedCat === cat.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#27272A]/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search image tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#27272A] text-[#09090B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-text)]"
          />
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="group bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] hover:border-[var(--accent-text)] dark:hover:border-[var(--accent-text)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:text-[var(--accent-text)] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-slate-300">
                    {tool.badge}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-[#09090B] dark:text-white group-hover:text-[var(--accent-text)] dark:group-hover:text-[var(--accent-text)] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {tool.description}
                </p>

                <ul className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-[#27272A] pt-3">
                  {tool.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-slate-500 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex items-center space-x-1 text-xs font-bold text-[var(--accent-text)] dark:text-[var(--accent-text)] group-hover:translate-x-1 transition-transform">
                <span>Open tool</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
