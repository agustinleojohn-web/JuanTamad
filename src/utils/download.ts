import JSZip from 'jszip';

/**
 * Triggers a download of a Blob or File in the browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  
  // Cleanup after browser has begun download
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 1000);
}

export interface ZipFileItem {
  name: string;
  blob: Blob;
}

/**
 * Packages multiple files into a ZIP archive and triggers download
 */
export async function downloadZip(
  files: ZipFileItem[],
  zipFilename = 'juantamad-processed-files.zip'
): Promise<void> {
  if (files.length === 0) return;
  
  const zip = new JSZip();
  
  // Avoid duplicate filenames in zip
  const counts: Record<string, number> = {};
  
  for (const file of files) {
    let name = file.name;
    if (counts[name] !== undefined) {
      counts[name]++;
      const dotIndex = name.lastIndexOf('.');
      if (dotIndex !== -1) {
        name = `${name.slice(0, dotIndex)} (${counts[name]})${name.slice(dotIndex)}`;
      } else {
        name = `${name} (${counts[name]})`;
      }
    } else {
      counts[name] = 0;
    }
    
    zip.file(name, file.blob);
  }
  
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  
  downloadBlob(content, zipFilename);
}
