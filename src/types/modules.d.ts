declare module 'gifshot' {
  interface GifOptions {
    images?: Array<string | HTMLImageElement | CanvasImageSource>;
    video?: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number; // duration of each frame in seconds
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    numWorkers?: number;
  }

  interface GifResult {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image: string; // base64 data url
  }

  export function createGIF(
    options: GifOptions,
    callback: (obj: GifResult) => void
  ): void;

  export function isSupported(): boolean;
}

declare module 'heic2any' {
  interface HeicOptions {
    blob: Blob;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  }

  export default function heic2any(options: HeicOptions): Promise<Blob | Blob[]>;
}
