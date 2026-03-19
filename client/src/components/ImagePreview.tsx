/**
 * Design: Industrial Utility — split preview showing original and converted images
 * with a 1920x1080 crop overlay indicator.
 */
import { motion } from "framer-motion";
import type { ImageInfo, ConvertedImage } from "@/hooks/useImageConverter";

interface ImagePreviewProps {
  imageInfo: ImageInfo;
  converted: ConvertedImage | null;
  isConverting: boolean;
}

export default function ImagePreview({
  imageInfo,
  converted,
  isConverting,
}: ImagePreviewProps) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Converted preview (main) */}
      <div className="flex-1 relative rounded-lg overflow-hidden bg-[oklch(0.1_0.005_250)] border border-[oklch(0.25_0.005_250)]">
        {isConverting ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[oklch(0.82_0.17_80)] border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs text-[oklch(0.5_0.01_250)] tracking-wider">
                CONVERTING...
              </span>
            </div>
          </div>
        ) : converted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center p-3"
          >
            <img
              src={converted.previewUrl}
              alt="Converted 1920x1080"
              className="max-w-full max-h-full object-contain rounded"
              style={{ aspectRatio: "16/9" }}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={imageInfo.previewUrl}
              alt="Original"
              className="max-w-full max-h-full object-contain p-3 opacity-40"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[oklch(0.82_0.17_80)] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* 1920x1080 label */}
        {converted && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-3 right-3 font-mono text-[10px] px-2 py-1 rounded bg-[oklch(0.1_0.005_250_/_85%)] text-[oklch(0.82_0.17_80)] border border-[oklch(0.82_0.17_80_/_30%)] backdrop-blur-sm"
          >
            1920 × 1080
          </motion.div>
        )}
      </div>

      {/* Original thumbnail strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-3 flex items-center gap-3"
      >
        <div className="w-16 h-10 rounded overflow-hidden border border-[oklch(0.25_0.005_250)] flex-shrink-0">
          <img
            src={imageInfo.previewUrl}
            alt="Original thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11px] text-[oklch(0.6_0.01_250)] truncate">
            {imageInfo.name}
          </p>
          <p className="font-mono text-[10px] text-[oklch(0.4_0.01_250)]">
            {imageInfo.originalWidth} × {imageInfo.originalHeight} · {formatBytes(imageInfo.originalSize)}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
