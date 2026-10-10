import React, { useState } from 'react';
import {
  Unlock,
  Lock,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { Dropzone } from '../../components/common/Dropzone';
import { PrivacyNotice } from '../../components/common/PrivacyNotice';
import { unlockPdf, checkIfPdfIsEncrypted } from '../../services/pdf/pdfAdvancedService';
import { downloadBlob } from '../../utils/download';
import { formatFileSize } from '../../utils/fileSize';

export const PdfUnlockPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [securityStatus, setSecurityStatus] = useState<{
    isEncrypted: boolean;
    needsPassword: boolean;
    isOwnerProtectedOnly: boolean;
  } | null>(null);
  const [unlockedBlob, setUnlockedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setUnlockedBlob(null);
    setError(null);
    setProgressMsg('');
    setProgressPercent(0);

    try {
      const check = await checkIfPdfIsEncrypted(f);
      setSecurityStatus(check);
    } catch {
      setSecurityStatus({ isEncrypted: true, needsPassword: true, isOwnerProtectedOnly: false });
    }
  };

  const handleUnlock = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgressMsg('Starting unlock process...');
    setProgressPercent(5);

    try {
      const blob = await unlockPdf(
        file,
        password,
        (current, total, msg) => {
          setProgressMsg(msg);
          const percent = Math.min(100, Math.round((current / total) * 100));
          setProgressPercent(percent);
        }
      );
      setUnlockedBlob(blob);
      setProgressMsg('Document successfully unlocked!');
      setProgressPercent(100);
    } catch (err: any) {
      setError(err.message || 'Failed to unlock PDF. Please verify your password if required.');
      setProgressMsg('');
      setProgressPercent(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!unlockedBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(unlockedBlob, `${base}-unlocked.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-text)]/10 text-[var(--accent-text)] dark:bg-[var(--accent-text-tint)] dark:text-[var(--accent-text)] mb-2">
          <Unlock className="w-3.5 h-3.5" />
          <span>Security Removal Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] dark:text-white tracking-tight">
          Unlock PDF Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Remove printing, copying, and editing restrictions instantly — no password needed for those. If a PDF requires a password just to <em>open</em> it, that password is real encryption: we can only decrypt it if you tell us the password, the same way Adobe Acrobat would.
        </p>
      </div>

      <PrivacyNotice toolName="Unlock PDF" />

      {!file ? (
        <Dropzone
          onFilesSelected={handleFiles}
          accept=".pdf,application/pdf"
          multiple={false}
          title="Drop protected or restricted PDF file here"
          description="Removes printing, copying, and password restrictions 100% locally"
        />
      ) : (
        <div className="bg-white dark:bg-[#09090B] rounded-2xl p-6 border border-slate-200 dark:border-[#27272A] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
            <div>
              <span className="font-bold text-sm text-[#09090B] dark:text-white block">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                File Size: {formatFileSize(file.size)}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setUnlockedBlob(null);
                setSecurityStatus(null);
                setPassword('');
              }}
              className="text-xs text-[var(--accent-text)] hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          {/* Security status banner */}
          {securityStatus && (
            <div
              className={`p-4 rounded-xl border flex items-start space-x-3 ${
                securityStatus.needsPassword
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                  : securityStatus.isOwnerProtectedOnly
                  ? 'bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] border-[var(--accent-text)]/20 dark:border-[var(--accent-text)]/40 text-[var(--accent-text)] dark:text-[var(--accent-text)]'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200'
              }`}
            >
              <Lock className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed space-y-1">
                <span className="font-bold block text-sm">
                  {securityStatus.needsPassword
                    ? 'Password Protected (Passphrase Required)'
                    : securityStatus.isOwnerProtectedOnly
                    ? 'Owner Permissions Locked (Zero Password Needed)'
                    : 'Standard Unprotected Document'}
                </span>
                <p>
                  {securityStatus.needsPassword
                    ? 'This PDF is encrypted with an open password — the same kind Adobe Acrobat uses. There is no way to recover or bypass it without the password itself; enter it below to decrypt and save an unprotected copy.'
                    : securityStatus.isOwnerProtectedOnly
                    ? 'This PDF has printing, copying, or modification restrictions but no open password. Click "Unlock & Remove Restrictions" below to strip them instantly — no password needed.'
                    : 'This document has no open restrictions. You can re-save a sanitized, clean version.'}
                </p>
              </div>
            </div>
          )}

          {securityStatus?.needsPassword && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-4">
              Forgot the password? Genuine PDF encryption can't be removed without it — that's what makes it secure. This tool can only decrypt a file you already know the password to.
            </p>
          )}

          {/* Password Input (shown if password needed or user wants to provide) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                <span>
                  {securityStatus?.needsPassword
                    ? 'Document Open Password (Required)'
                    : 'Password (Optional - leave blank for owner restriction removal)'}
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center space-x-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={
                securityStatus?.needsPassword
                  ? 'Enter the password to open this PDF...'
                  : 'Leave blank unless document requires a password to open...'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#27272A] text-xs sm:text-sm text-[#09090B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-text)]/50"
            />
          </div>

          {/* Progress bar during unlocking */}
          {isProcessing && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A]">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="font-medium flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--accent-text)]/50" />
                  <span>{progressMsg}</span>
                </span>
                <span className="font-bold text-[var(--accent-text)]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[var(--accent-text)]/50 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {unlockedBlob && (
            <div className="p-4 rounded-xl bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)] border border-[var(--accent-text)]/20 dark:border-[var(--accent-text)]/40 text-[var(--accent-text)] dark:text-[var(--accent-text)] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-[var(--accent-text)] shrink-0" />
                <span className="text-xs font-semibold">
                  PDF successfully unlocked! All encryption &amp; restrictions permanently removed ({formatFileSize(unlockedBlob.size)}).
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUnlock}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-text)]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Decrypting...' : 'Unlock & Remove Restrictions'}</span>
            </button>

            {unlockedBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#09090B] hover:bg-[#27272A] text-white dark:bg-[var(--accent-text)]/20 dark:hover:bg-[var(--accent)] dark:text-[#000000] shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Unlocked PDF</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
