
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  LockKeyhole,
  Globe2,
  ArrowRight,
  ArrowUpRight,
  Check,
  Image as ImageIcon,
  FileText,
  Code2,
  Heart,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Your files stay yours',
    description:
      'Designed around on-device processing, so supported tools can work with your files directly in your browser.',
    label: 'Privacy first',
  },
  {
    icon: Zap,
    title: 'Simple by design',
    description:
      'Compress images, convert formats, and handle PDF tasks without complicated workflows or unnecessary steps.',
    label: 'Less hassle',
  },
  {
    icon: Globe2,
    title: 'Ready when you are',
    description:
      'Open the tools in your browser without creating an account or installing a desktop application.',
    label: 'Browser based',
  },
  {
    icon: LockKeyhole,
    title: 'No account required',
    description:
      'Get straight to your task without registration forms, subscriptions, or account setup.',
    label: 'Easy access',
  },
];

const technologies = [
  {
    name: 'Canvas & ImageBitmap',
    description: 'Browser-native image processing',
    category: 'IMAGES',
  },
  {
    name: 'WebAssembly',
    description: 'High-performance processing where supported',
    category: 'PERFORMANCE',
  },
  {
    name: 'pdf-lib',
    description: 'PDF creation and document manipulation',
    category: 'PDF',
  },
  {
    name: 'PDF.js',
    description: 'PDF rendering and previews',
    category: 'PDF',
  },
  {
    name: 'Mammoth.js',
    description: 'DOCX document content extraction',
    category: 'DOCUMENTS',
  },
  {
    name: 'SheetJS',
    description: 'Spreadsheet parsing and data handling',
    category: 'DOCUMENTS',
  },
  {
    name: 'JSZip',
    description: 'ZIP packaging for batch downloads',
    category: 'FILES',
  },
];

export const AboutPage: React.FC = () => {
  return (
    <main className="relative isolate overflow-hidden bg-white text-[#09090B] transition-colors dark:bg-[#000000] dark:text-white">

      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[360px] w-[min(900px,120vw)] -translate-x-1/2 rounded-full bg-[var(--accent-text)]/[0.06] blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

        {/* Intro */}
        <section className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2  text-xs font-bold text-[var(--accent-text)]">
            
            <span>MEET JUANTAMAD</span>
          </div>

          <h1 className="text-balance text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Less hassle.
            <br />
            <span className="text-[var(--accent-text)]">
              More done.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
            Your everyday toolkit for images, documents, and PDFs.
            Get things done with simple browser-based tools designed
            to make file tasks feel effortless.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/image-tools/compress"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--accent-text)]/15 transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-text)] focus-visible:ring-offset-2"
            >
              Try Image Tools
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/pdf-tools"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition-colors hover:border-[var(--accent-text)] dark:border-[#27272A] dark:bg-[#09090B] dark:text-slate-200"
            >
              Explore PDF Tools
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick facts */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--accent-text)]" />
              No account required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--accent-text)]" />
              Works in your browser
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--accent-text)]" />
              Simple workflows
            </span>
          </div>
        </section>

        {/* What we're about */}
        <section className="mt-16 sm:mt-20 lg:mt-24">
          <div className="mb-7 max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-text)]">
              WHY JUANTAMAD
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Useful tools. No unnecessary fuss.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              File tasks shouldn't feel like a project of their own.
              JuanTamad brings everyday utilities together in one
              straightforward place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-text)]/40 hover:shadow-lg hover:shadow-black/[0.03] dark:border-[#27272A] dark:bg-[#09090B] dark:hover:shadow-black/20 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-text)]/10 text-[var(--accent-text)] transition-transform duration-200 group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                      {feature.label}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Brand story */}
      
<section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
  <div className="relative isolate [container-type:inline-size]">
    {/* CTA panel */}
    <div className="relative z-0 flex min-h-[260px] items-center overflow-hidden rounded-2xl bg-[var(--accent)] px-5 py-7 sm:min-h-[290px] sm:px-8 lg:min-h-[310px] lg:px-10">
      <div className="relative z-10 w-[72%] sm:w-[68%] lg:w-[65%]">
        <p className="mb-3 text-[clamp(9px,1.05cqw,12px)] font-bold uppercase tracking-[0.16em] text-white/80">
          LESS HASSLE. MORE DONE.
        </p>

        <h2 className="text-[clamp(22px,3.4cqw,44px)] font-black leading-[1.12] tracking-tight text-white">
          Your files.<br />Juan click away.
        </h2>

        <p className="mt-3 max-w-md text-[clamp(11px,1.3cqw,16px)] leading-relaxed text-white/90 sm:mt-4">
          Compress images, convert files, and handle PDFs without the unnecessary hassle.
        </p>

        <Link
          to="/image-tools/compress"
          className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#09090B] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:mt-6 sm:min-h-12 sm:px-5 sm:text-sm"
        >
          Try JuanTamad <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>

    {/* Oversized mascot — no background, border, or wrapper */}
    <img
      src="/Mascot-full.webp"
      alt="JuanTamad mascot"
      className="
        pointer-events-none absolute z-10
        right-[2%] bottom-0
        h-auto w-[27%] max-w-none object-contain
        translate-y-[3%]
        sm:right-[3%] sm:w-[25%]
        lg:right-[3%] lg:w-[23%]
        lg:translate-y-[4%]
      "
      loading="lazy"
      decoding="async"
    />
  </div>
</section>


        {/* Technology */}
        <section className="mt-16 sm:mt-20 lg:mt-24">
          <div className="mb-7 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-text)]/10 text-[var(--accent-text)]">
              <Code2 className="h-5 w-5" />
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-text)]">
                UNDER THE HOOD
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Built with web technologies
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Modern browser APIs and specialized libraries help power
                the tools behind the interface.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((technology) => (
              <div
                key={technology.name}
                className="rounded-xl border border-slate-200/80 bg-white p-4 transition-colors hover:border-[var(--accent-text)]/40 dark:border-[#27272A] dark:bg-[#09090B]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold">
                    {technology.name}
                  </h3>

                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold tracking-wide text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                    {technology.category}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {technology.description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-500">
            Technologies listed here describe the intended implementation.
            Actual browser support and processing capabilities may vary by tool.
          </p>
        </section>

        {/* Closing CTA */}
        <section className="mt-16 border-t border-slate-200/80 pt-10 text-center dark:border-[#27272A] sm:mt-20 sm:pt-12">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-text)]/10 text-[var(--accent-text)]">
            <ImageIcon className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Ready to get things done?
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
            Pick a tool, bring your files, and get started. It's that simple.
          </p>

          <Link
            to="/image-tools/compress"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--accent-text)]/15 transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-text)] focus-visible:ring-offset-2"
          >
            Explore JuanTamad
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

      </div>
    </main>
  );
};
