import { useState, useCallback, useRef, useEffect } from "react";

export interface ImageInfo {
  file: File;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  name: string;
  type: string;
  previewUrl: string;
}

export interface ConvertedImage {
  jpgBlob: Blob;
  pngBlob: Blob;
  jpgSize: number;
  pngSize: number;
  previewUrl: string;
}

/**
 * cropOffset: 0 to 1 value.
 * For images wider than 16:9 → controls horizontal position (0 = left, 0.5 = center, 1 = right)
 * For images taller than 16:9 → controls vertical position (0 = top, 0.5 = center, 1 = bottom)
 */
export type CropAxis = "horizontal" | "vertical" | "none";

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const TARGET_ASPECT = TARGET_WIDTH / TARGET_HEIGHT;

export function useImageConverter() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [converted, setConverted] = useState<ConvertedImage | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropOffset, setCropOffset] = useState(0.5); // 0-1, default center
  const [cropAxis, setCropAxis] = useState<CropAxis>("none");
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Determine crop axis when image loads
  const determineCropAxis = useCallback((width: number, height: number): CropAxis => {
    const sourceAspect = width / height;
    if (Math.abs(sourceAspect - TARGET_ASPECT) < 0.01) return "none";
    return sourceAspect > TARGET_ASPECT ? "horizontal" : "vertical";
  }, []);

  // Core conversion function that uses a given offset
  const convertWithOffset = useCallback(async (img: HTMLImageElement, offset: number): Promise<ConvertedImage> => {
    const canvas = document.createElement("canvas");
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;
    const ctx = canvas.getContext("2d")!;

    const sourceAspect = img.naturalWidth / img.naturalHeight;

    let sx: number, sy: number, sw: number, sh: number;

    if (sourceAspect > TARGET_ASPECT) {
      // Source is wider — crop sides, offset controls horizontal position
      sh = img.naturalHeight;
      sw = sh * TARGET_ASPECT;
      const maxSx = img.naturalWidth - sw;
      sx = maxSx * offset;
      sy = 0;
    } else if (sourceAspect < TARGET_ASPECT) {
      // Source is taller — crop top/bottom, offset controls vertical position
      sw = img.naturalWidth;
      sh = sw / TARGET_ASPECT;
      const maxSy = img.naturalHeight - sh;
      sy = maxSy * offset;
      sx = 0;
    } else {
      // Exact match
      sx = 0;
      sy = 0;
      sw = img.naturalWidth;
      sh = img.naturalHeight;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    const jpgBlob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    const pngBlob = await canvasToBlob(canvas, "image/png");
    const previewUrl = canvas.toDataURL("image/jpeg", 0.92);

    return {
      jpgBlob,
      pngBlob,
      jpgSize: jpgBlob.size,
      pngSize: pngBlob.size,
      previewUrl,
    };
  }, []);

  const processImage = useCallback(async (file: File) => {
    setError(null);
    setConverted(null);
    setIsConverting(true);
    setCropOffset(0.5); // Reset to center

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please drop an image file (JPG, PNG, GIF, WebP, BMP, SVG, etc.)");
      }

      const img = await loadImage(file);
      imgRef.current = img;

      const previewUrl = URL.createObjectURL(file);
      const axis = determineCropAxis(img.naturalWidth, img.naturalHeight);
      setCropAxis(axis);

      const info: ImageInfo = {
        file,
        originalWidth: img.naturalWidth,
        originalHeight: img.naturalHeight,
        originalSize: file.size,
        name: file.name,
        type: file.type,
        previewUrl,
      };
      setImageInfo(info);

      const result = await convertWithOffset(img, 0.5);
      setConverted(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setIsConverting(false);
    }
  }, [determineCropAxis, convertWithOffset]);

  // Re-convert when cropOffset changes (debounced via effect)
  const offsetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateCropOffset = useCallback((newOffset: number) => {
    setCropOffset(newOffset);
  }, []);

  useEffect(() => {
    if (!imgRef.current || !imageInfo) return;

    // Debounce re-conversion to avoid excessive processing while dragging
    if (offsetTimerRef.current) {
      clearTimeout(offsetTimerRef.current);
    }

    offsetTimerRef.current = setTimeout(async () => {
      try {
        const result = await convertWithOffset(imgRef.current!, cropOffset);
        setConverted(result);
      } catch {
        // Silently fail on re-conversion
      }
    }, 50);

    return () => {
      if (offsetTimerRef.current) {
        clearTimeout(offsetTimerRef.current);
      }
    };
  }, [cropOffset, convertWithOffset, imageInfo]);

  const downloadJpg = useCallback(() => {
    if (!converted || !imageInfo) return;
    const baseName = imageInfo.name.replace(/\.[^.]+$/, "");
    downloadBlob(converted.jpgBlob, `${baseName}_1920x1080.jpg`);
  }, [converted, imageInfo]);

  const downloadPng = useCallback(() => {
    if (!converted || !imageInfo) return;
    const baseName = imageInfo.name.replace(/\.[^.]+$/, "");
    downloadBlob(converted.pngBlob, `${baseName}_1920x1080.png`);
  }, [converted, imageInfo]);

  const downloadBoth = useCallback(() => {
    downloadJpg();
    setTimeout(() => downloadPng(), 300);
  }, [downloadJpg, downloadPng]);

  const reset = useCallback(() => {
    if (imageInfo?.previewUrl) {
      URL.revokeObjectURL(imageInfo.previewUrl);
    }
    imgRef.current = null;
    setImageInfo(null);
    setConverted(null);
    setError(null);
    setIsConverting(false);
    setCropOffset(0.5);
    setCropAxis("none");
  }, [imageInfo]);

  return {
    imageInfo,
    converted,
    isConverting,
    error,
    cropOffset,
    cropAxis,
    processImage,
    updateCropOffset,
    downloadJpg,
    downloadPng,
    downloadBoth,
    reset,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to convert canvas to blob"));
      },
      type,
      quality
    );
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
