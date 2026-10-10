import React from 'react';
import { ShieldCheck, Cpu, Zap, Lock, Globe, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-3">
          <Globe className="w-3.5 h-3.5" />
          <span>About JuanTamad</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Effortless File Utilities, Built for Privacy
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
          Inspired by Google Chrome Labs’ Squoosh, JuanTamad provides a complete suite of image compression, format conversion, and document/PDF tools without uploading your files anywhere.
        </p>
      </div>

      {/* Why JuanTamad? */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#730000]/10 dark:bg-[#580000] text-[#730000] dark:text-[#730000]/40 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            100% Client-Side Sandbox
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every conversion and compression algorithm executes in your web browser using HTML5 Canvas, WebAssembly, and modern Web APIs. No processing servers exist.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#730000]/10 dark:bg-[#580000] text-[#730000] dark:text-[#730000]/40 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Zero Limits &amp; No Accounts
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            No registration, subscriptions, credit systems, or daily quotas. Process as many images and documents as your device memory can handle.
          </p>
        </div>
      </div>

      {/* The Story Behind the Name */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          The Meaning of "JuanTamad"
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          In Filipino folklore, <em>Juan Tamad</em> ("Lazy Juan") is known for seeking maximum ease and convenience. In engineering, we take pride in that philosophy: complicated tasks like converting spreadsheets to PDF, compressing giant graphics, or extracting PDF pages should be effortless. No waiting for uploads, no paywalls, and no annoying email confirmations.
        </p>
      </div>

      {/* Open Source Tech Stack */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Powered by Open-Source Web Technologies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { name: 'Canvas & ImageBitmap API', desc: 'Hardware-accelerated image decoding and encoding' },
            { name: 'pdf-lib', desc: 'Creation, merge, split, rotation, and modification of PDF files' },
            { name: 'pdfjs-dist (Mozilla PDF.js)', desc: 'High-fidelity PDF page rasterization and preview rendering' },
            { name: 'Mammoth.js', desc: 'Local DOCX document structure extraction' },
            { name: 'SheetJS / xlsx', desc: 'In-browser spreadsheet parsing and table extraction' },
            { name: 'JSZip', desc: 'Client-side ZIP archive packaging for bulk batch downloads' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start space-x-3"
            >
              <CheckCircle2 className="w-4 h-4 text-[#730000]/50 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">{item.name}</span>
                <span className="text-xs text-slate-500">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
