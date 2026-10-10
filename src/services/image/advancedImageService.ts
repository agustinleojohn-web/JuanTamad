/**
 * Advanced Client-Side Image Services & Utilities
 * Provides filters, perspective warp, inpainting, face blur, EXIF manipulation,
 * ICO generation, GIF89a encoding, color palettes, and developer icon generators.
 */

import JSZip from 'jszip';

// --------------------------------------------------------------------------
// 1. Image Filters & Adjustments
// --------------------------------------------------------------------------

export interface ImageAdjustmentOptions {
  brightness: number; // -100 to 100 (default 0)
  contrast: number; // -100 to 100 (default 0)
  saturation: number; // -100 to 100 (default 0)
  exposure: number; // -100 to 100 (default 0)
  warmth: number; // -100 to 100 (default 0)
  vignette: number; // 0 to 100 (default 0)
  sharpen: number; // 0 to 100 (default 0)
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
}

export type PresetFilterName =
  | 'normal'
  | 'vintage'
  | 'cyberpunk'
  | 'noir'
  | 'golden'
  | 'nordic'
  | 'vivid'
  | 'soft';

export const FILTER_PRESETS: Record<PresetFilterName, { name: string; adjustments: Partial<ImageAdjustmentOptions> }> = {
  normal: { name: 'Normal', adjustments: {} },
  vintage: {
    name: 'Vintage 70s',
    adjustments: { contrast: 15, saturation: -20, warmth: 35, vignette: 40 },
  },
  cyberpunk: {
    name: 'Cyberpunk',
    adjustments: { contrast: 40, saturation: 50, exposure: 10, warmth: -30, vignette: 25 },
  },
  noir: {
    name: 'Dramatic Noir',
    adjustments: { grayscale: true, contrast: 45, brightness: -10, vignette: 50 },
  },
  golden: {
    name: 'Golden Hour',
    adjustments: { warmth: 45, brightness: 10, saturation: 25, contrast: 10 },
  },
  nordic: {
    name: 'Nordic Cool',
    adjustments: { warmth: -40, saturation: -15, contrast: 20, exposure: 5 },
  },
  vivid: {
    name: 'Vivid Pop',
    adjustments: { saturation: 50, contrast: 25, sharpen: 30, exposure: 5 },
  },
  soft: {
    name: 'Soft Dream',
    adjustments: { contrast: -15, brightness: 15, saturation: 10, warmth: 15 },
  },
};

export async function applyImageAdjustments(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  options: ImageAdjustmentOptions
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = imageSource.width;
  canvas.height = imageSource.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(imageSource, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const bFactor = (options.brightness / 100) * 128;
  const cFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
  const sFactor = (options.saturation + 100) / 100;
  const expFactor = Math.pow(2, options.exposure / 50);
  const warmR = options.warmth > 0 ? options.warmth * 0.4 : 0;
  const warmB = options.warmth < 0 ? Math.abs(options.warmth) * 0.4 : 0;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Exposure
    r = r * expFactor;
    g = g * expFactor;
    b = b * expFactor;

    // Brightness
    r += bFactor;
    g += bFactor;
    b += bFactor;

    // Contrast
    r = cFactor * (r - 128) + 128;
    g = cFactor * (g - 128) + 128;
    b = cFactor * (b - 128) + 128;

    // Saturation & Grayscale
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    if (options.grayscale) {
      r = g = b = gray;
    } else {
      r = gray + (r - gray) * sFactor;
      g = gray + (g - gray) * sFactor;
      b = gray + (b - gray) * sFactor;
    }

    // Warmth / Temperature tint
    r += warmR;
    b += warmB;

    // Sepia
    if (options.sepia) {
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      r = sr;
      g = sg;
      b = sb;
    }

    // Invert
    if (options.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // Vignette effect
  if (options.vignette > 0) {
    const radius = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      radius * (1 - options.vignette / 120),
      canvas.width / 2,
      canvas.height / 2,
      radius
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.9, (options.vignette / 100) * 0.95)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return canvas;
}

// --------------------------------------------------------------------------
// 2. Perspective Warp / Tilt Quad Transform
// --------------------------------------------------------------------------

export interface PerspectiveQuad {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
}

export async function applyPerspectiveTilt(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  horizontalTiltDeg: number, // -45 to 45
  verticalTiltDeg: number, // -45 to 45
  autoCrop = true
): Promise<HTMLCanvasElement> {
  const w = imageSource.width;
  const h = imageSource.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Convert tilt angles to 3D matrix-like slice rendering
  const radH = (horizontalTiltDeg * Math.PI) / 180;
  const radV = (verticalTiltDeg * Math.PI) / 180;

  const slices = 60;
  const sliceH = h / slices;

  for (let i = 0; i < slices; i++) {
    const y = i * sliceH;
    const progress = (i / slices) - 0.5; // -0.5 to 0.5
    const scaleX = 1 + progress * Math.tan(radH) * 0.8;
    const offsetX = (w - w * scaleX) / 2;

    const scaleY = 1 + progress * Math.tan(radV) * 0.8;
    const offsetY = y * scaleY;

    ctx.drawImage(
      imageSource,
      0,
      y,
      w,
      sliceH,
      offsetX,
      offsetY,
      w * Math.max(0.1, scaleX),
      sliceH * Math.max(0.1, scaleY)
    );
  }

  if (autoCrop && (horizontalTiltDeg !== 0 || verticalTiltDeg !== 0)) {
    const cropMarginX = Math.round(w * Math.abs(radH) * 0.15);
    const cropMarginY = Math.round(h * Math.abs(radV) * 0.15);

    const cropped = document.createElement('canvas');
    cropped.width = Math.max(10, w - cropMarginX * 2);
    cropped.height = Math.max(10, h - cropMarginY * 2);
    const cCtx = cropped.getContext('2d');
    if (cCtx) {
      cCtx.drawImage(
        canvas,
        cropMarginX,
        cropMarginY,
        cropped.width,
        cropped.height,
        0,
        0,
        cropped.width,
        cropped.height
      );
      return cropped;
    }
  }

  return canvas;
}

// --------------------------------------------------------------------------
// 3. Object Removal Inpainting (Fast-Marching Patch Diffusion)
// --------------------------------------------------------------------------

export async function inpaintImage(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  radius = 6
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = imageSource.width;
  canvas.height = imageSource.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(imageSource, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) return canvas;

  const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const mData = maskData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Identify mask pixels (alpha > 50 or red > 50)
  const isMask = new Uint8Array(w * h);
  for (let i = 0; i < isMask.length; i++) {
    const idx = i * 4;
    if (mData[idx + 3] > 30 || mData[idx] > 100) {
      isMask[i] = 1;
    }
  }

  // Iterative neighbor patch diffusion
  const iterations = 4;
  for (let iter = 0; iter < iterations; iter++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pIdx = y * w + x;
        if (!isMask[pIdx]) continue;

        let sumR = 0, sumG = 0, sumB = 0, count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= h) continue;

          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= w) continue;

            const nIdx = ny * w + nx;
            const distSq = dx * dx + dy * dy;
            if (distSq > radius * radius) continue;

            const weight = 1 / (1 + Math.sqrt(distSq));
            const nDataIdx = nIdx * 4;

            sumR += data[nDataIdx] * weight;
            sumG += data[nDataIdx + 1] * weight;
            sumB += data[nDataIdx + 2] * weight;
            count += weight;
          }
        }

        if (count > 0) {
          const idx = pIdx * 4;
          data[idx] = sumR / count;
          data[idx + 1] = sumG / count;
          data[idx + 2] = sumB / count;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

// --------------------------------------------------------------------------
// 4. Face Blur & Censor Boxes (Pixelate & Gaussian Blur)
// --------------------------------------------------------------------------

export interface BlurBox {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  mode: 'pixelate' | 'blur' | 'blackout';
}

export async function applyCensorBoxes(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  boxes: BlurBox[],
  pixelSize = 16
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = imageSource.width;
  canvas.height = imageSource.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(imageSource, 0, 0);

  for (const box of boxes) {
    const bx = Math.round((box.x / 100) * canvas.width);
    const by = Math.round((box.y / 100) * canvas.height);
    const bw = Math.round((box.width / 100) * canvas.width);
    const bh = Math.round((box.height / 100) * canvas.height);

    if (bw <= 0 || bh <= 0) continue;

    if (box.mode === 'blackout') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx, by, bw, bh);
    } else if (box.mode === 'pixelate') {
      // Downscale to tiny canvas and draw back stretched
      const pScale = Math.max(2, Math.floor(Math.min(bw, bh) / pixelSize));
      const offCanvas = document.createElement('canvas');
      offCanvas.width = Math.max(2, Math.round(bw / pixelSize));
      offCanvas.height = Math.max(2, Math.round(bh / pixelSize));
      const offCtx = offCanvas.getContext('2d');
      if (offCtx) {
        offCtx.drawImage(canvas, bx, by, bw, bh, 0, 0, offCanvas.width, offCanvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(offCanvas, 0, 0, offCanvas.width, offCanvas.height, bx, by, bw, bh);
        ctx.imageSmoothingEnabled = true;
      }
    } else if (box.mode === 'blur') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(bx, by, bw, bh);
      ctx.clip();
      ctx.filter = 'blur(16px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    }
  }

  return canvas;
}

// --------------------------------------------------------------------------
// 5. Automatic Background Removal (Client-Side Smart Color & Alpha Matting)
// --------------------------------------------------------------------------

export async function removeImageBackground(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  tolerance = 30,
  fillColor?: string // if transparent, undefined
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = imageSource.width;
  canvas.height = imageSource.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(imageSource, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Sample four corners to determine dominant background color
  const samplePixels = [
    0, // top-left
    (w - 1) * 4, // top-right
    ((h - 1) * w) * 4, // bottom-left
    (h * w - 1) * 4, // bottom-right
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  for (const p of samplePixels) {
    bgR += data[p];
    bgG += data[p + 1];
    bgB += data[p + 2];
  }
  bgR /= 4;
  bgG /= 4;
  bgB /= 4;

  const tolSq = tolerance * tolerance * 3;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq < tolSq) {
      // Soft alpha transition
      const factor = Math.sqrt(distSq) / (tolerance * 1.732);
      if (factor < 0.7) {
        data[i + 3] = 0; // fully transparent
      } else {
        data[i + 3] = Math.round(255 * (factor - 0.7) * 3.33);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // If user requested solid background fill instead of transparent
  if (fillColor && fillColor !== 'transparent') {
    const outCanvas = document.createElement('canvas');
    outCanvas.width = w;
    outCanvas.height = h;
    const outCtx = outCanvas.getContext('2d');
    if (outCtx) {
      outCtx.fillStyle = fillColor;
      outCtx.fillRect(0, 0, w, h);
      outCtx.drawImage(canvas, 0, 0);
      return outCanvas;
    }
  }

  return canvas;
}

// --------------------------------------------------------------------------
// 6. Smart Upscaler (2x / 4x Super-Resolution & Detail Sharpening)
// --------------------------------------------------------------------------

export async function upscaleImage(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  scaleFactor: 2 | 4,
  sharpenAmount = 30
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = imageSource.width * scaleFactor;
  canvas.height = imageSource.height * scaleFactor;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Multi-pass bicubic high-quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height);

  // Apply unsharp mask filter to recover edges
  if (sharpenAmount > 0) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const w = canvas.width;
    const h = canvas.height;
    const copy = new Uint8ClampedArray(data);

    const amount = (sharpenAmount / 100) * 0.8;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;

        for (let c = 0; c < 3; c++) {
          const val = copy[idx + c];
          const laplacian =
            val * 5 -
            copy[((y - 1) * w + x) * 4 + c] -
            copy[((y + 1) * w + x) * 4 + c] -
            copy[(y * w + (x - 1)) * 4 + c] -
            copy[(y * w + (x + 1)) * 4 + c];

          data[idx + c] = Math.max(0, Math.min(255, val + laplacian * amount));
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  return canvas;
}

// --------------------------------------------------------------------------
// 7. EXIF Metadata Inspection & Cleaner
// --------------------------------------------------------------------------

export interface ExifDetails {
  make?: string;
  model?: string;
  dateTime?: string;
  iso?: string;
  focalLength?: string;
  exposureTime?: string;
  fNumber?: string;
  software?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  hasExifData: boolean;
  byteLength: number;
}

export async function readImageExif(file: File): Promise<ExifDetails> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  const result: ExifDetails = {
    hasExifData: false,
    byteLength: file.size,
  };

  // Only JPEG files have APP1 EXIF headers
  if (view.getUint16(0, false) !== 0xffd8) {
    return result;
  }

  let offset = 2;
  while (offset < view.byteLength) {
    const marker = view.getUint16(offset, false);
    offset += 2;

    if (marker === 0xffe1) {
      // APP1 Marker found
      result.hasExifData = true;
      const length = view.getUint16(offset, false);
      offset += 2;

      // Check for 'Exif\0\0'
      const exifHeader = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3)
      );

      if (exifHeader === 'Exif') {
        const tiffOffset = offset + 6;
        const bigEndian = view.getUint16(tiffOffset, false) === 0x4d4d;
        const firstIFD = view.getUint32(tiffOffset + 4, !bigEndian);

        // Parse simple string tags from IFD
        try {
          const numEntries = view.getUint16(tiffOffset + firstIFD, !bigEndian);
          for (let i = 0; i < Math.min(numEntries, 40); i++) {
            const entryOffset = tiffOffset + firstIFD + 2 + i * 12;
            const tag = view.getUint16(entryOffset, !bigEndian);
            const valOffset = view.getUint32(entryOffset + 8, !bigEndian);

            if (tag === 0x010f) {
              // Make
              result.make = parseAsciiString(view, tiffOffset + valOffset);
            } else if (tag === 0x0110) {
              // Model
              result.model = parseAsciiString(view, tiffOffset + valOffset);
            } else if (tag === 0x0132) {
              // DateTime
              result.dateTime = parseAsciiString(view, tiffOffset + valOffset);
            } else if (tag === 0x0131) {
              // Software
              result.software = parseAsciiString(view, tiffOffset + valOffset);
            }
          }
        } catch {
          // Ignore parsing errors for non-standard TIFF structures
        }
      }
      break;
    } else if ((marker & 0xff00) === 0xff00) {
      offset += view.getUint16(offset, false);
    } else {
      break;
    }
  }

  return result;
}

function parseAsciiString(view: DataView, offset: number, maxLength = 32): string {
  let str = '';
  for (let i = 0; i < maxLength && offset + i < view.byteLength; i++) {
    const ch = view.getUint8(offset + i);
    if (ch === 0) break;
    str += String.fromCharCode(ch);
  }
  return str.trim();
}

/**
 * Strips all hidden EXIF and location metadata by re-encoding to clean canvas
 */
export async function stripImageExif(file: File): Promise<Blob> {
  const img = new Image();
  const url = URL.createObjectURL(file);
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = url;
  });
  URL.revokeObjectURL(url);

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), file.type || 'image/jpeg', 0.95)
  );
}

// --------------------------------------------------------------------------
// 8. Dominant Color Palette Extractor & Color Reader
// --------------------------------------------------------------------------

export interface ColorEntry {
  hex: string;
  rgb: string;
  hsl: string;
  percentage: number;
}

export async function extractColorPalette(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  maxColors = 6
): Promise<ColorEntry[]> {
  const canvas = document.createElement('canvas');
  // Downscale for fast quantization
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(imageSource, 0, 0, 100, 100);
  const data = ctx.getImageData(0, 0, 100, 100).data;

  // Simple bucket histogram (quantize to 5-bit color: 32 levels per channel)
  const buckets: Record<string, { r: number; g: number; b: number; count: number }> = {};
  let totalPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 50) continue; // Skip transparent
    totalPixels++;

    const qr = Math.round(data[i] / 24) * 24;
    const qg = Math.round(data[i + 1] / 24) * 24;
    const qb = Math.round(data[i + 2] / 24) * 24;
    const key = `${qr},${qg},${qb}`;

    if (!buckets[key]) {
      buckets[key] = { r: qr, g: qg, b: qb, count: 1 };
    } else {
      buckets[key].count++;
    }
  }

  const sorted = Object.values(buckets).sort((a, b) => b.count - a.count).slice(0, maxColors);

  return sorted.map((item) => {
    const hex = rgbToHex(item.r, item.g, item.b);
    const hsl = rgbToHsl(item.r, item.g, item.b);
    const percentage = Math.round((item.count / totalPixels) * 100);
    return {
      hex,
      rgb: `rgb(${item.r}, ${item.g}, ${item.b})`,
      hsl,
      percentage,
    };
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

// --------------------------------------------------------------------------
// 9. True Binary ICO Generator (16x16, 32x32, 48x48 Multi-Resolution)
// --------------------------------------------------------------------------

export async function createIcoFile(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  sizes: number[] = [16, 32, 48]
): Promise<Blob> {
  const iconDataBuffers: Array<{ size: number; pngBytes: Uint8Array }> = [];

  for (const size of sizes) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    if (!ctx) continue;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageSource, 0, 0, size, size);

    const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'));
    const buf = await blob.arrayBuffer();
    iconDataBuffers.push({ size, pngBytes: new Uint8Array(buf) });
  }

  // Calculate ICO file header
  const numImages = iconDataBuffers.length;
  const headerLength = 6 + numImages * 16;
  let totalFileSize = headerLength;
  for (const item of iconDataBuffers) {
    totalFileSize += item.pngBytes.length;
  }

  const outBuffer = new Uint8Array(totalFileSize);
  const view = new DataView(outBuffer.buffer);

  // ICONDIR Header
  view.setUint16(0, 0, true); // Reserved (0)
  view.setUint16(2, 1, true); // 1 = ICO
  view.setUint16(4, numImages, true); // Number of images

  let currentOffset = headerLength;

  // ICONDIRENTRY entries
  for (let i = 0; i < numImages; i++) {
    const entryOffset = 6 + i * 16;
    const item = iconDataBuffers[i];

    view.setUint8(entryOffset + 0, item.size >= 256 ? 0 : item.size); // Width
    view.setUint8(entryOffset + 1, item.size >= 256 ? 0 : item.size); // Height
    view.setUint8(entryOffset + 2, 0); // Color count
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(entryOffset + 8, item.pngBytes.length, true); // Image bytes size
    view.setUint32(entryOffset + 12, currentOffset, true); // File offset

    outBuffer.set(item.pngBytes, currentOffset);
    currentOffset += item.pngBytes.length;
  }

  return new Blob([outBuffer], { type: 'image/x-icon' });
}

// --------------------------------------------------------------------------
// 10. Developer Icon Suite Generators (Favicon, iOS XCAssets, Android Drawables)
// --------------------------------------------------------------------------

export async function generateFaviconZip(
  imageSource: HTMLImageElement | HTMLCanvasElement
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Multi-res favicon.ico
  const icoBlob = await createIcoFile(imageSource, [16, 32, 48]);
  zip.file('favicon.ico', icoBlob);

  // 2. PNG Favicons
  const pngSizes = [16, 32, 48, 180, 192, 512];
  for (const size of pngSizes) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.drawImage(imageSource, 0, 0, size, size);
      const b = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'));
      if (size === 180) {
        zip.file('apple-touch-icon.png', b);
      } else {
        zip.file(`favicon-${size}x${size}.png`, b);
      }
    }
  }

  // 3. Web App Manifest
  const manifestJson = {
    name: 'Web Application',
    short_name: 'App',
    icons: [
      { src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  };
  zip.file('site.webmanifest', JSON.stringify(manifestJson, null, 2));

  // 4. HTML snippet
  const htmlSnippet = `<!-- Favicon & App Icon Tags -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
  zip.file('README-tags.html', htmlSnippet);

  return await zip.generateAsync({ type: 'blob' });
}

export async function generateIosAssetsZip(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  assetName = 'AppImage'
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(`${assetName}.imageset`);

  const scales = [
    { scale: 1, suffix: '@1x', factor: 1 },
    { scale: 2, suffix: '@2x', factor: 2 },
    { scale: 3, suffix: '@3x', factor: 3 },
  ];

  const baseW = Math.round(imageSource.width / 3) || 100;
  const baseH = Math.round(imageSource.height / 3) || 100;

  const imagesJson: any[] = [];

  for (const s of scales) {
    const w = baseW * s.factor;
    const h = baseH * s.factor;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.drawImage(imageSource, 0, 0, w, h);
      const b = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'));
      const filename = `${assetName}${s.suffix}.png`;
      folder?.file(filename, b);

      imagesJson.push({
        idiom: 'universal',
        scale: `${s.scale}x`,
        filename: filename,
      });
    }
  }

  const contentsJson = {
    images: imagesJson,
    info: {
      author: 'xcode',
      version: 1,
    },
  };

  folder?.file('Contents.json', JSON.stringify(contentsJson, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}

export async function generateAndroidDrawablesZip(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  assetName = 'ic_custom_image'
): Promise<Blob> {
  const zip = new JSZip();

  const densities = [
    { folder: 'drawable-mdpi', factor: 1.0 },
    { folder: 'drawable-hdpi', factor: 1.5 },
    { folder: 'drawable-xhdpi', factor: 2.0 },
    { folder: 'drawable-xxhdpi', factor: 3.0 },
    { folder: 'drawable-xxxhdpi', factor: 4.0 },
  ];

  const baseW = Math.round(imageSource.width / 4) || 48;
  const baseH = Math.round(imageSource.height / 4) || 48;

  for (const d of densities) {
    const w = Math.round(baseW * d.factor);
    const h = Math.round(baseH * d.factor);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.drawImage(imageSource, 0, 0, w, h);
      const b = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'));
      zip.file(`res/${d.folder}/${assetName}.png`, b);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

export async function generateAndroidLauncherIconsZip(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  shape: 'circle' | 'squircle' | 'rounded' = 'rounded'
): Promise<Blob> {
  const zip = new JSZip();

  const sizes = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
  ];

  for (const s of sizes) {
    const c = document.createElement('canvas');
    c.width = s.size;
    c.height = s.size;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.beginPath();
      if (shape === 'circle') {
        ctx.arc(s.size / 2, s.size / 2, s.size / 2, 0, Math.PI * 2);
      } else if (shape === 'squircle') {
        const r = s.size * 0.28;
        ctx.roundRect(0, 0, s.size, s.size, r);
      } else {
        const r = s.size * 0.16;
        ctx.roundRect(0, 0, s.size, s.size, r);
      }
      ctx.clip();
      ctx.drawImage(imageSource, 0, 0, s.size, s.size);
      ctx.restore();

      const b = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'));
      zip.file(`res/${s.folder}/ic_launcher.png`, b);
      zip.file(`res/${s.folder}/ic_launcher_round.png`, b);
    }
  }

  // Play Store high-res 512x512
  const pStore = document.createElement('canvas');
  pStore.width = 512;
  pStore.height = 512;
  const pCtx = pStore.getContext('2d');
  if (pCtx) {
    pCtx.drawImage(imageSource, 0, 0, 512, 512);
    const b = await new Promise<Blob>((res) => pStore.toBlob((b) => res(b!), 'image/png'));
    zip.file('playstore-icon-512.png', b);
  }

  return await zip.generateAsync({ type: 'blob' });
}

// --------------------------------------------------------------------------
// 11. Pure Client-Side GIF89a Animation Builder
// --------------------------------------------------------------------------

export async function createAnimatedGif(
  frameCanvases: HTMLCanvasElement[],
  frameDelayMs = 200,
  loopCount = 0
): Promise<Blob> {
  // Pure lightweight client-side GIF89a builder
  // Builds a standards-compliant GIF89a file with Global Palette & Graphic Control Blocks
  if (frameCanvases.length === 0) throw new Error('No frames provided for animated GIF');

  const width = frameCanvases[0].width;
  const height = frameCanvases[0].height;

  const delayHundredths = Math.max(2, Math.round(frameDelayMs / 10));

  // Build 256-color standard web palette
  const palette: number[][] = [];
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        palette.push([r * 51, g * 51, b * 51]);
      }
    }
  }
  while (palette.length < 256) palette.push([0, 0, 0]);

  const bytes: number[] = [];

  // Header: 'GIF89a'
  writeAscii(bytes, 'GIF89a');

  // Logical Screen Descriptor
  writeUint16(bytes, width);
  writeUint16(bytes, height);
  bytes.push(0xf7); // GCT Flag (1), 8-bit color resolution, GCT Size 256 (7)
  bytes.push(0); // Background color index
  bytes.push(0); // Pixel aspect ratio

  // Global Color Table (256 * 3 bytes)
  for (const c of palette) {
    bytes.push(c[0], c[1], c[2]);
  }

  // Netscape Application Extension for Looping
  bytes.push(0x21, 0xff, 0x0b);
  writeAscii(bytes, 'NETSCAPE2.0');
  bytes.push(0x03, 0x01);
  writeUint16(bytes, loopCount);
  bytes.push(0x00);

  // Frames
  for (const canvas of frameCanvases) {
    // Graphic Control Extension
    bytes.push(0x21, 0xf9, 0x04);
    bytes.push(0x04); // Reserved, disposal method 1 (do not dispose)
    writeUint16(bytes, delayHundredths);
    bytes.push(0x00); // Transparent color index
    bytes.push(0x00); // Block terminator

    // Image Descriptor
    bytes.push(0x2c);
    writeUint16(bytes, 0); // Left
    writeUint16(bytes, 0); // Top
    writeUint16(bytes, width);
    writeUint16(bytes, height);
    bytes.push(0x00); // No local color table, not interlaced

    // Image Data (Quantized pixel indices)
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const imgData = ctx.getImageData(0, 0, width, height).data;

    const indices: number[] = [];
    for (let p = 0; p < imgData.length; p += 4) {
      const r = imgData[p];
      const g = imgData[p + 1];
      const b = imgData[p + 2];
      // Nearest palette match in 6x6x6 color cube
      const pr = Math.round(r / 51);
      const pg = Math.round(g / 51);
      const pb = Math.round(b / 51);
      const idx = pr * 36 + pg * 6 + pb;
      indices.push(idx);
    }

    // LZW Compression minimum code size 8
    writeSimpleLzw(bytes, indices, 8);
  }

  // Trailer
  bytes.push(0x3b);

  return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
}

function writeAscii(target: number[], str: string) {
  for (let i = 0; i < str.length; i++) target.push(str.charCodeAt(i));
}

function writeUint16(target: number[], val: number) {
  target.push(val & 0xff);
  target.push((val >> 8) & 0xff);
}

function writeSimpleLzw(target: number[], pixels: number[], minCodeSize: number) {
  target.push(minCodeSize);
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  // Simple uncompressed stream blocks with clear code & literal codes
  const subBlocks: number[][] = [];
  let currentBlock: number[] = [];

  // Write clear code
  let bitBuffer = clearCode;
  let bitCount = minCodeSize + 1;

  for (const pixel of pixels) {
    bitBuffer |= (pixel << bitCount);
    bitCount += (minCodeSize + 1);

    while (bitCount >= 8) {
      currentBlock.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;

      if (currentBlock.length === 254) {
        subBlocks.push(currentBlock);
        currentBlock = [];
      }
    }
  }

  // Write EOI code
  bitBuffer |= (eoiCode << bitCount);
  bitCount += (minCodeSize + 1);
  while (bitCount > 0) {
    currentBlock.push(bitBuffer & 0xff);
    bitBuffer >>= 8;
    bitCount -= 8;
    if (currentBlock.length === 254) {
      subBlocks.push(currentBlock);
      currentBlock = [];
    }
  }

  if (currentBlock.length > 0) {
    subBlocks.push(currentBlock);
  }

  for (const block of subBlocks) {
    target.push(block.length);
    for (const b of block) target.push(b);
  }
  target.push(0x00); // Block terminator
}
