import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Cpu, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
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
                           <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                             JuanTamad
                           </span>
                           
                         </div>
                         <p className="text-xs font-semibold text-[#730000] dark:text-red-400 -mt-0.5 hidden sm:block">
                           JUAN click away.
                         </p>
                       </div>
                     </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Fast, privacy-first, client-side image compression, batch conversions, and PDF toolkit directly in your browser.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-[#730000] dark:text-red-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero server uploads. 100% on-device.</span>
            </div>
          </div>

          {/* Image Tools */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Image Studio
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
             
              <li><Link to="/image-tools/compress" className="hover:text-[#730000] dark:hover:text-red-400">Image Compressor</Link></li>
              <li><Link to="/image-tools/convert" className="hover:text-[#730000] dark:hover:text-red-400">Image Converter (WebP, JPG, PNG)</Link></li>
              <li><Link to="/image-tools/resize" className="hover:text-[#730000] dark:hover:text-red-400">Image Resizer</Link></li>
              <li><Link to="/image-tools/crop" className="hover:text-[#730000] dark:hover:text-red-400">Crop Image</Link></li>
              <li><Link to="/image-tools/upscale" className="hover:text-[#730000] dark:hover:text-red-400">Image Upscaler</Link></li>
              <li><Link to="/image-tools/background-remover" className="hover:text-[#730000] dark:hover:text-red-400">Image Background Remover</Link></li>
            
             
            </ul>
          </div>

          {/* Document & PDF Tools */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Document &amp; PDF Tools
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/document-tools/image-to-pdf" className="hover:text-[#730000] dark:hover:text-red-400">Image to PDF</Link></li>
              <li><Link to="/document-tools/docx-to-pdf" className="hover:text-[#730000] dark:hover:text-red-400">DOCX to PDF</Link></li>
              <li><Link to="/document-tools/csv-to-pdf" className="hover:text-[#730000] dark:hover:text-red-400">CSV / XLSX to PDF</Link></li>
              <li><Link to="/pdf-tools/optimize" className="hover:text-[#730000] dark:hover:text-red-400">Optimize PDF</Link></li>
              <li><Link to="/pdf-tools/unlock" className="hover:text-[#730000] dark:hover:text-red-400">Unlock PDF</Link></li>
              <li><Link to="/pdf-tools/merge" className="hover:text-[#730000] dark:hover:text-red-400">Merge PDF</Link></li>
            </ul>
          </div>

          {/* Information & Privacy */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Trust &amp; Architecture
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/about" className="hover:text-[#730000] dark:hover:text-red-400">About the Project</Link></li>
              <li><Link to="/privacy" className="hover:text-[#730000] dark:hover:text-red-400">Privacy Policy (Local Sandbox)</Link></li>
              <li><Link to="/terms" className="hover:text-[#730000] dark:hover:text-red-400">Terms of Use</Link></li>
            </ul>
           
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} JuanTamad. Free, open, and private for everyone.</p>
          <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
            <span className="text-slate-500 font-normal">Powered by:</span>
            <span className="text-[#730000] dark:text-red-300"><a href="https://www.dishenyo.com/" target="_blank" rel="noopener noreferrer">DisHenyo Digital Solutions</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
