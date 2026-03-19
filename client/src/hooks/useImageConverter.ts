import { useState, useCallback } from "react";

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

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;

export function useImageConverter() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [converted, setConverted] = useState<ConvertedImage | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (file: File) => {
    setError(null);
    setConverted(null);
    setIsConverting(true);

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please drop an image file (JPG, PNG, GIF, WebP, BMP, SVG, etc.)");
      }

      // Load image
      const img = await loadImage(file);
      const previewUrl = URL.createObjectURL(file);

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

      // Convert using cover-fill (crop to fill 1920x1080)
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      const ctx = canvas.getContext("2d")!;

      // Calculate cover-fill dimensions
      const sourceAspect = img.naturalWidth / img.naturalHeight;
      const targetAspect = TARGET_WIDTH / TARGET_HEIGHT;

      let sx: number, sy: number, sw: number, sh: number;

      if (sourceAspect > targetAspect) {
        // Source is wider — crop sides
        sh = img.naturalHeight;
        sw = sh * targetAspect;
        sx = (img.naturalWidth - sw) / 2;
        sy = 0;
      } else {
        // Source is taller — crop top/bottom
        sw = img.naturalWidth;
        sh = sw / targetAspect;
        sx = 0;
        sy = (img.naturalHeight - sh) / 2;
      }

      // Use high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      // Generate JPG
      const jpgBlob = await canvasToBlob(canvas, "image/jpeg", 0.92);
      // Generate PNG
      const pngBlob = await canvasToBlob(canvas, "image/png");

      const convertedPreviewUrl = canvas.toDataURL("image/jpeg", 0.92);

      setConverted({
        jpgBlob,
        pngBlob,
        jpgSize: jpgBlob.size,
        pngSize: pngBlob.size,
        previewUrl: convertedPreviewUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setIsConverting(false);
    }
  }, []);

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
    setImageInfo(null);
    setConverted(null);
    setError(null);
    setIsConverting(false);
  }, [imageInfo]);

  return {
    imageInfo,
    converted,
    isConverting,
    error,
    processImage,
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
