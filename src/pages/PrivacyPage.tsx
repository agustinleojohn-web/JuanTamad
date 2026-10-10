import React from 'react';
import { ShieldCheck, Lock, EyeOff, ServerOff, FileCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#730000]/10 text-[#730000] dark:bg-[#580000] dark:text-[#730000]/30 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
          Last updated: October 2026. Built with a strict privacy-first architecture.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#730000]/10/70 dark:bg-[#580000]/40 border border-[#730000]/20 dark:border-[#730000] text-sm sm:text-base text-[#730000] dark:text-[#730000]/20 leading-relaxed font-medium">
        Our core promise: <strong>Your files never leave your device.</strong> Every single image compression, format conversion, PDF merge, DOCX parse, and spreadsheet export occurs strictly inside your web browser’s memory.
      </div>

      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Zero File Uploads
          </h2>
          <p>
            Unlike traditional online file converters that transmit your sensitive documents to remote cloud servers for conversion, JuanTamad executes WebAssembly and native browser APIs directly on your local hardware. There is no file storage server, database, or external processing API.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. No Account or Registration Required
          </h2>
          <p>
            We do not require users to create an account, log in, or provide an email address. You do not need to share any personal identity information to use all features.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            3. Local Storage Usage
          </h2>
          <p>
            We only use your browser's <code>localStorage</code> to store your light or dark display preference (<code>juantamad_theme</code>). No files, images, document contents, or histories are saved to disk or persistent browser databases.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. No Third-Party Trackers or Data Selling
          </h2>
          <p>
            JuanTamad does not embed third-party surveillance scripts, marketing trackers, or telemetry. We do not sell, trade, or analyze user document contents.
          </p>
        </section>
      </div>
    </div>
  );
};
