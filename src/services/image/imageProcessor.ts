import { getImageDimensions, ImageDimensions, isCanvasFormatSupported } from '../../utils/fileValidation';

export type OutputFormat = 'webp' | 'jpeg' | 'png' | 'avif';

export interface ImageProcessingOptions {
  format: OutputFormat;
  quality: number; // 1 - 100
  resizeMode: 'none' | 'percent' | 'custom';
  scalePercent?: number; // e.g. 50
  targetWidth?: number;
  targetHeight?: number;
  maintainAspectRatio?: boolean;
  backgroundColor?: string; // For formats like JPEG that don't support transparency
}

export interface ImageProcessingResult {
  blob: Blob;
  format: OutputFormat;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  url: string; // Object URL
}

export const FORMAT_MIME_MAP: Record<OutputFormat, string> = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  png: 'image/png',
  avif: 'image/avif',
};

export const FORMAT_EXT_MAP: Record<OutputFormat, string> = {
  webp: 'webp',
  jpeg: 'jpg',
  png: 'png',
  avif: 'avif',
};

export async function processImage(
  file: File | Blob,
  options: ImageProcessingOptions
): Promise<ImageProcessingResult> {
  const originalDims = await getImageDimensions(file);
  
  // Calculate target dimensions
  let targetWidth = originalDims.width;
  let targetHeight = originalDims.height;
  
  if (options.resizeMode === 'percent' && options.scalePercent) {
    const factor = options.scalePercent / 100;
    targetWidth = Math.max(1, Math.round(originalDims.width * factor));
    targetHeight = Math.max(1, Math.round(originalDims.height * factor));
  } else if (options.resizeMode === 'custom') {
    if (options.maintainAspectRatio) {
      if (options.targetWidth && !options.targetHeight) {
        targetWidth = options.targetWidth;
        targetHeight = Math.max(1, Math.round((options.targetWidth / originalDims.width) * originalDims.height));
      } else if (!options.targetWidth && options.targetHeight) {
        targetHeight = options.targetHeight;
        targetWidth = Math.max(1, Math.round((options.targetHeight / originalDims.height) * originalDims.width));
      } else if (options.targetWidth && options.targetHeight) {
        targetWidth = options.targetWidth;
        targetHeight = options.targetHeight;
      }
    } else {
      if (options.targetWidth) targetWidth = options.targetWidth;
      if (options.targetHeight) targetHeight = options.targetHeight;
    }
  }

  // Draw image on canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  if (!ctx) {
    throw new Error('Canvas 2D context could not be created');
  }

  // Smooth scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill background if needed (e.g., for JPEG which does not support transparency)
  if (options.format === 'jpeg' || options.backgroundColor) {
    ctx.fillStyle = options.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Load and draw image
  const imgBitmap = await createImageElement(file);
  ctx.drawImage(imgBitmap, 0, 0, targetWidth, targetHeight);

  // Check format capability
  let targetMime = FORMAT_MIME_MAP[options.format];
  let actualFormat = options.format;
  
  const isSupported = await isCanvasFormatSupported(targetMime);
  if (!isSupported) {
    // Graceful fallback if browser lacks native AVIF encoder
    if (options.format === 'avif') {
      targetMime = 'image/webp';
      actualFormat = 'webp';
    } else {
      targetMime = 'image/jpeg';
      actualFormat = 'jpeg';
    }
  }

  // Normalize quality (0.01 - 1.0)
  const quality = Math.min(1, Math.max(0.01, options.quality / 100));

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error(`Failed to encode image to ${actualFormat}`));
        }
      },
      targetMime,
      actualFormat === 'png' ? undefined : quality
    );
  });

  const url = URL.createObjectURL(blob);

  return {
    blob,
    format: actualFormat,
    mimeType: blob.type,
    width: targetWidth,
    height: targetHeight,
    sizeBytes: blob.size,
    url,
  };
}

function createImageElement(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image into memory'));
    };
    img.src = url;
  });
}
