import React from 'react';
import { FileCheck, Shield, HelpCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-3">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Terms &amp; Conditions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Terms of Use
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
          Effective Date: October 2026.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using JuanTamad, you agree to these Terms of Use. If you do not agree, you may discontinue use at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. Permitted Use
          </h2>
          <p>
            JuanTamad is provided free of charge for personal, academic, and commercial file processing. You are responsible for ensuring that you have legal rights to the files, images, and documents you process.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            3. Disclaimer of Warranties
          </h2>
          <p>
            JuanTamad is provided "as is" without warranty of any kind. While we strive to maintain top-tier reliability and fidelity across image compression and document conversion tools, client-side processing depends on your specific browser environment and available hardware memory.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. Limitation of Liability
          </h2>
          <p>
            In no event shall the authors or maintainers be liable for any damages or data loss resulting from the use or inability to use this platform. Always maintain backups of your original documents.
          </p>
        </section>
      </div>
    </div>
  );
};
