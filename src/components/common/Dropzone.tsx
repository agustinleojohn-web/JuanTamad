import React, { useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  description?: string;
  compact?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  accept,
  multiple = true,
  maxSizeMB = 100,
  title = 'Drop your files here',
  description = 'or browse from your device',
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndPassFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > maxSizeBytes) {
        setError(`File "${file.name}" exceeds maximum allowed size of ${maxSizeMB}MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    validateAndPassFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndPassFiles(e.target.files);
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        animate={{ scale: isDragging ? 1.015 : 1 }}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className={`relative border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center select-none ${
          compact ? 'p-6' : 'p-10 sm:p-14'
        } ${
          isDragging
            ? 'border-[var(--accent-text)] bg-[var(--accent-text)]/10 dark:bg-[var(--accent-text-tint)]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#09090B]/50 hover:bg-slate-100/70 dark:hover:bg-[#27272A]/50 hover:border-slate-400 dark:hover:border-slate-600 transition-colors'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <motion.div
          animate={{ y: isDragging ? -3 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`rounded-2xl bg-white dark:bg-[#27272A] shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[var(--accent-text)] dark:text-[var(--accent-text)] mb-3 ${
            compact ? 'w-10 h-10' : 'w-14 h-14'
          }`}
        >
          {compact ? <Plus className="w-5 h-5" /> : <UploadCloud className="w-7 h-7" />}
        </motion.div>

        <h3 className={`font-semibold text-[#09090B] dark:text-white ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
          {title}
        </h3>
        <p className={`text-slate-500 dark:text-slate-400 mt-1 max-w-sm ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
          {description}
        </p>

        <div className="mt-4 flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm transition-colors">
            Choose Files
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {multiple ? 'Multiple files supported' : 'Single file'}
          </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900 overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
