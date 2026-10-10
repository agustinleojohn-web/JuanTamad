/**
 * File size formatting and savings calculations
 */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i === 0) return `${bytes} B`;
  
  return `${(bytes / Math.pow(k, i)).toFixed(i === 1 ? 1 : 2)} ${sizes[i]}`;
}

export interface SizeComparison {
  originalBytes: number;
  newBytes: number;
  differenceBytes: number; // original - new
  percentageSaved: number; // e.g. 45.2%
  isSmaller: boolean;
  isSame: boolean;
  isLarger: boolean;
}

export function calculateSizeComparison(originalBytes: number, newBytes: number): SizeComparison {
  const differenceBytes = originalBytes - newBytes;
  const isSame = originalBytes === newBytes;
  const isSmaller = newBytes < originalBytes;
  const isLarger = newBytes > originalBytes;
  
  let percentageSaved = 0;
  if (originalBytes > 0) {
    percentageSaved = ((originalBytes - newBytes) / originalBytes) * 100;
  }
  
  return {
    originalBytes,
    newBytes,
    differenceBytes,
    percentageSaved: parseFloat(percentageSaved.toFixed(1)),
    isSmaller,
    isSame,
    isLarger,
  };
}
