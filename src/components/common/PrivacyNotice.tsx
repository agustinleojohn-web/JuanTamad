import React from 'react';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyNoticeProps {
  toolName?: string;
  compact?: boolean;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ toolName, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 py-1">
        <ShieldCheck className="w-4 h-4 text-[var(--accent-text)] dark:text-[var(--accent-text)] shrink-0" />
        <span>
          <strong>100% In-Browser:</strong> Your {toolName ? `${toolName} ` : ''}files are processed strictly in your device memory and are never uploaded to any cloud server.
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl p-4 bg-[var(--accent-text)]/5 dark:bg-[var(--accent-text-tint)] border border-[var(--accent-text)]/60 dark:border-[var(--accent-text)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text)]/20 text-[var(--accent-hover)] dark:text-[var(--accent-text)] shrink-0 mt-0.5 sm:mt-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-[#09090B] dark:text-slate-100">
            Privacy Guarantee: Client-Side Sandbox
          </h4>
          <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
            All conversions, rendering, and compressions take place exclusively inside your web browser. No files, logs, or personal metadata are ever sent to a remote server.
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-[var(--accent-text)] dark:text-[var(--accent-text)] font-medium shrink-0 self-start sm:self-center bg-white dark:bg-[#09090B] px-3 py-1.5 rounded-lg border border-[var(--accent-text)]/20 dark:border-[var(--accent-text)]/40">
        <Lock className="w-3.5 h-3.5" />
        <span>No Uploads Needed</span>
      </div>
    </motion.div>
  );
};
