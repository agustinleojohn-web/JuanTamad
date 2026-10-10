
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  LockKeyhole,
  ArrowUpRight,
  Image,
  FileText,
  Shield,
  Heart,
} from 'lucide-react';

const imageTools = [
  { label: 'Image Compressor', to: '/image-tools/compress' },
  { label: 'Image Converter', to: '/image-tools/convert' },
  { label: 'Image Resizer', to: '/image-tools/resize' },
  { label: 'Crop Image', to: '/image-tools/crop' },
  { label: 'Image Upscaler', to: '/image-tools/upscale' },
  { label: 'Background Remover', to: '/image-tools/background-remover' },
];

const documentTools = [
  { label: 'Image to PDF', to: '/document-tools/image-to-pdf' },
  { label: 'DOCX to PDF', to: '/document-tools/docx-to-pdf' },
  { label: 'CSV / XLSX to PDF', to: '/document-tools/csv-to-pdf' },
  { label: 'Optimize PDF', to: '/pdf-tools/optimize' },
  { label: 'Unlock PDF', to: '/pdf-tools/unlock' },
  { label: 'Merge PDF', to: '/pdf-tools/merge' },
];

const infoLinks = [
  { label: 'About JuanTamad', to: '/about' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use', to: '/terms' },
];

const linkClass =
  'inline-flex items-center text-[13px] leading-6 text-slate-600 transition-colors duration-200 hover:text-[var(--accent-text)] dark:text-slate-400 dark:hover:text-[var(--accent-text)] focus-visible:outline-none focus-visible:underline';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50 dark:border-white/[0.08] dark:bg-[#080808]">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">

        {/* Main footer */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">

          {/* Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-4">
            <Link
              to="/"
              aria-label="JuanTamad home"
              className="group inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-text)]"
            >
              <img
                src="/Mascot-full.webp"
                alt=""
                className="h-16 w-16 object-contain transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-[4.5rem] sm:w-[4.5rem]"
                loading="lazy"
                decoding="async"
              />

              <div>
                <span className="block text-xl font-black tracking-tight text-[#09090B] dark:text-white">
                  JuanTamad
                  <span className="text-[var(--accent-text)]">.</span>
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-[var(--accent-text)]">
                  JUAN click away.
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
              Your everyday toolkit for image compression, file conversion,
              and PDF tasks — simple, fast, and right in your browser.
            </p>

            {/* Privacy callout */}
            <div className="flex max-w-sm items-start gap-3 rounded-xl border border-[var(--accent-text)]/15 bg-[var(--accent-text)]/[0.06] p-3.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-text)]/10">
                <LockKeyhole className="h-4 w-4 text-[var(--accent-text)]" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-[#09090B] dark:text-white">
                  Your files, your device.
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  Designed for private, on-device file processing.
                </p>
              </div>
            </div>
          </div>

          {/* Image tools */}
          <nav aria-label="Image tools" className="lg:col-span-3">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#09090B] dark:text-white">
              <Image className="h-4 w-4 text-[var(--accent-text)]" />
              Image Tools
            </h2>

            <ul className="space-y-1.5">
              {imageTools.map((tool) => (
                <li key={tool.to}>
                  <Link to={tool.to} className={linkClass}>
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Document tools */}
          <nav aria-label="Document and PDF tools" className="lg:col-span-3">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#09090B] dark:text-white">
              <FileText className="h-4 w-4 text-[var(--accent-text)]" />
              PDF & Documents
            </h2>

            <ul className="space-y-1.5">
              {documentTools.map((tool) => (
                <li key={tool.to}>
                  <Link to={tool.to} className={linkClass}>
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Information */}
          <nav aria-label="About and legal" className="lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#09090B] dark:text-white">
              <Shield className="h-4 w-4 text-[var(--accent-text)]" />
              Information
            </h2>

            <ul className="space-y-1.5">
              {infoLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-5 border-t border-slate-200/80 pt-6 dark:border-white/[0.08] sm:mt-12 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex flex-col gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            <p>
              © {new Date().getFullYear()} JuanTamad. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5">
              Made to make file tasks easier.
              <Heart className="h-3.5 w-3.5 fill-[var(--accent-text)] text-[var(--accent-text)]" />
            </p>
          </div>

          <a
            href="https://www.dishenyo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex w-fit items-center gap-2 rounded-lg text-xs text-slate-500 transition-colors hover:text-[var(--accent-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-text)] dark:text-slate-400"
          >
            <span>Built by</span>
            <span className="font-bold text-[#27272A] group-hover:text-[var(--accent-text)] dark:text-slate-200">
              DisHenyo Digital Solutions
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
};
