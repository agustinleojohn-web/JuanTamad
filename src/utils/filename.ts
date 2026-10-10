/**
 * Filename utilities
 */

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()?.toLowerCase() || '';
}

export function getBaseFilename(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return filename;
  return filename.substring(0, lastDot);
}

export function sanitizeFilename(filename: string): string {
  // Replace invalid characters with underscore
  return filename.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

export function generateOutputFilename(
  originalFilename: string,
  suffix = 'optimized',
  newExtension?: string
): string {
  const base = getBaseFilename(originalFilename);
  const ext = newExtension || getFileExtension(originalFilename);
  return `${base}-${suffix}${ext ? `.${ext.replace(/^\./, '')}` : ''}`;
}
