import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Cpu, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#000000] py-12 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            {/* Logo & Brand with Mascot */}
                     <Link to="/" className="flex items-center space-x-3 group">
                       <div className="relative w-32 h-32 overflow-hidden  group-hover:scale-105 transition-transform ">
                         <img
                           src="/mascot.webp"
                           alt="JuanTamad Mascot"
                           className="w-full h-full object-cover"
                           referrerPolicy="no-referrer"
                         />
                       </div>
                       <div>
                         <div className="flex items-center space-x-1.5">
                           <span className="font-black text-lg text-[#09090B] dark:text-white tracking-tight">
                             JuanTamad
                           </span>
                           
                         </div>
                         <p className="text-xs font-semibold text-[var(--accent-text)] dark:text-[var(--accent-text)] -mt-0.5 hidden sm:block">
                           JUAN click away.
                         </p>
                       </div>
                     </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Fast, privacy-first, client-side image compression, batch conversions, and PDF toolkit directly in your browser.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-[var(--accent-text)] dark:text-[var(--accent-text)] font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero server uploads. 100% on-device.</span>
            </div>
          </div>

          {/* Image Tools */}
          <div>
            <h4 className="text-xs font-bold text-[#09090B] dark:text-white uppercase tracking-wider mb-3">
              Image Studio
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
             
              <li><Link to="/image-tools/compress" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Image Compressor</Link></li>
              <li><Link to="/image-tools/convert" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Image Converter (WebP, JPG, PNG)</Link></li>
              <li><Link to="/image-tools/resize" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Image Resizer</Link></li>
              <li><Link to="/image-tools/crop" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Crop Image</Link></li>
              <li><Link to="/image-tools/upscale" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Image Upscaler</Link></li>
              <li><Link to="/image-tools/background-remover" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Image Background Remover</Link></li>
            
             
            </ul>
          </div>

          {/* Document & PDF Tools */}
          <div>
            <h4 className="text-xs font-bold text-[#09090B] dark:text-white uppercase tracking-wider mb-3">
              Document &amp; PDF Tools
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/document-tools/image-to-pdf" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Image to PDF</Link></li>
              <li><Link to="/document-tools/docx-to-pdf" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">DOCX to PDF</Link></li>
              <li><Link to="/document-tools/csv-to-pdf" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">CSV / XLSX to PDF</Link></li>
              <li><Link to="/pdf-tools/optimize" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Optimize PDF</Link></li>
              <li><Link to="/pdf-tools/unlock" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Unlock PDF</Link></li>
              <li><Link to="/pdf-tools/merge" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Merge PDF</Link></li>
            </ul>
          </div>

          {/* Information & Privacy */}
          <div>
            <h4 className="text-xs font-bold text-[#09090B] dark:text-white uppercase tracking-wider mb-3">
              Trust &amp; Architecture
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/about" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">About the Project</Link></li>
              <li><Link to="/privacy" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Privacy Policy (Local Sandbox)</Link></li>
              <li><Link to="/terms" className="hover:text-[var(--accent-text)] dark:hover:text-[var(--accent-text)]">Terms of Use</Link></li>
            </ul>
           
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-[#27272A] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} JuanTamad. Free, open, and private for everyone.</p>
          <div className="flex items-center space-x-1.5 font-bold text-[#27272A] dark:text-slate-200">
            <span className="text-slate-500 font-normal">Powered by:</span>
            <span className="text-[var(--accent-text)] dark:text-[var(--accent-text)]"><a href="https://www.dishenyo.com/" target="_blank" rel="noopener noreferrer">DisHenyo Digital Solutions</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
