/**
 * Image dimensions and format detection
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export function getImageDimensions(file: File | Blob): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    // Try createImageBitmap first for speed
    if (typeof createImageBitmap === 'function') {
      createImageBitmap(file)
        .then((bitmap) => {
          const dims = { width: bitmap.width, height: bitmap.height };
          bitmap.close();
          resolve(dims);
        })
        .catch(() => {
          // Fallback to Image element
          loadWithImageTag(file, resolve, reject);
        });
    } else {
      loadWithImageTag(file, resolve, reject);
    }
  });
}

function loadWithImageTag(
  file: File | Blob,
  resolve: (dims: ImageDimensions) => void,
  reject: (err: Error) => void
) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    resolve({ width: img.naturalWidth, height: img.naturalHeight });
    URL.revokeObjectURL(url);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('Failed to load image file. It may be corrupt or an unsupported format.'));
  };
  img.src = url;
}

/**
 * Checks if a specific canvas encoding format is supported in this browser
 */
const supportedMimeTypesCache = new Map<string, boolean>();

export function isCanvasFormatSupported(mimeType: string): Promise<boolean> {
  if (supportedMimeTypesCache.has(mimeType)) {
    return Promise.resolve(supportedMimeTypesCache.get(mimeType)!);
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob(
      (blob) => {
        const supported = blob !== null && blob.type === mimeType;
        supportedMimeTypesCache.set(mimeType, supported);
        resolve(supported);
      },
      mimeType,
      0.8
    );
  });
}
