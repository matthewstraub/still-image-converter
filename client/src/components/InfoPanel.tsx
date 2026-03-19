/**
 * Design: Industrial Utility — right-side panel with monospaced metadata,
 * amber download buttons, and file size comparisons.
 */
import { motion } from "framer-motion";
import { Download, RotateCcw, FileImage, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImageInfo, ConvertedImage } from "@/hooks/useImageConverter";

interface InfoPanelProps {
  imageInfo: ImageInfo;
  converted: ConvertedImage | null;
  isConverting: boolean;
  onDownloadJpg: () => void;
  onDownloadPng: () => void;
  onDownloadBoth: () => void;
  onReset: () => void;
}

export default function InfoPanel({
  imageInfo,
  converted,
  isConverting,
  onDownloadJpg,
  onDownloadPng,
  onDownloadBoth,
  onReset,
}: InfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono text-xs tracking-[0.2em] text-[oklch(0.5_0.01_250)] uppercase">
          File Details
        </h2>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 font-mono text-[11px] text-[oklch(0.5_0.01_250)] hover:text-[oklch(0.82_0.17_80)] transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          NEW FILE
        </button>
      </div>

      {/* Source Info */}
      <div className="space-y-3 mb-6">
        <div className="p-3 rounded-md bg-[oklch(0.14_0.005_250)] border border-[oklch(0.22_0.005_250)]">
          <span className="font-mono text-[10px] tracking-wider text-[oklch(0.45_0.01_250)] uppercase block mb-2">
            Source
          </span>
          <p className="font-mono text-xs text-[oklch(0.75_0.01_80)] truncate mb-1" title={imageInfo.name}>
            {imageInfo.name}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <MetaRow label="Dimensions" value={`${imageInfo.originalWidth}×${imageInfo.originalHeight}`} />
            <MetaRow label="Size" value={formatBytes(imageInfo.originalSize)} />
            <MetaRow label="Format" value={imageInfo.type.split("/")[1]?.toUpperCase() || "—"} />
            <MetaRow
              label="Aspect"
              value={getAspectRatio(imageInfo.originalWidth, imageInfo.originalHeight)}
            />
          </div>
        </div>

        {/* Output Info */}
        <div className="p-3 rounded-md bg-[oklch(0.14_0.005_250)] border border-[oklch(0.22_0.005_250)]">
          <span className="font-mono text-[10px] tracking-wider text-[oklch(0.45_0.01_250)] uppercase block mb-2">
            Output
          </span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <MetaRow label="Dimensions" value="1920×1080" highlight />
            <MetaRow label="Aspect" value="16:9" />
            <MetaRow label="Fill Mode" value="Cover-Crop" />
            <MetaRow label="Quality" value="92% (JPG)" />
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="flex-1" />

      {converted ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-2"
        >
          <span className="font-mono text-[10px] tracking-wider text-[oklch(0.45_0.01_250)] uppercase block mb-3">
            Download
          </span>

          {/* JPG Button */}
          <button
            onClick={onDownloadJpg}
            className="w-full flex items-center gap-3 p-3 rounded-md bg-[oklch(0.14_0.005_250)] border border-[oklch(0.25_0.005_250)] hover:border-[oklch(0.82_0.17_80_/_50%)] hover:bg-[oklch(0.16_0.005_250)] transition-all group"
          >
            <div className="w-9 h-9 rounded bg-[oklch(0.82_0.17_80_/_10%)] flex items-center justify-center flex-shrink-0">
              <FileImage className="w-4 h-4 text-[oklch(0.82_0.17_80)]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-mono text-xs text-[oklch(0.85_0.01_80)] group-hover:text-[oklch(0.82_0.17_80)] transition-colors">
                JPG
              </p>
              <p className="font-mono text-[10px] text-[oklch(0.45_0.01_250)]">
                {formatBytes(converted.jpgSize)}
              </p>
            </div>
            <Download className="w-4 h-4 text-[oklch(0.4_0.01_250)] group-hover:text-[oklch(0.82_0.17_80)] transition-colors flex-shrink-0" />
          </button>

          {/* PNG Button */}
          <button
            onClick={onDownloadPng}
            className="w-full flex items-center gap-3 p-3 rounded-md bg-[oklch(0.14_0.005_250)] border border-[oklch(0.25_0.005_250)] hover:border-[oklch(0.82_0.17_80_/_50%)] hover:bg-[oklch(0.16_0.005_250)] transition-all group"
          >
            <div className="w-9 h-9 rounded bg-[oklch(0.82_0.17_80_/_10%)] flex items-center justify-center flex-shrink-0">
              <FileType className="w-4 h-4 text-[oklch(0.82_0.17_80)]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-mono text-xs text-[oklch(0.85_0.01_80)] group-hover:text-[oklch(0.82_0.17_80)] transition-colors">
                PNG
              </p>
              <p className="font-mono text-[10px] text-[oklch(0.45_0.01_250)]">
                {formatBytes(converted.pngSize)}
              </p>
            </div>
            <Download className="w-4 h-4 text-[oklch(0.4_0.01_250)] group-hover:text-[oklch(0.82_0.17_80)] transition-colors flex-shrink-0" />
          </button>

          {/* Download Both */}
          <Button
            onClick={onDownloadBoth}
            className="w-full mt-3 bg-[oklch(0.82_0.17_80)] text-[oklch(0.12_0.005_250)] hover:bg-[oklch(0.75_0.15_80)] font-mono text-xs tracking-wider h-11"
          >
            <Download className="w-4 h-4 mr-2" />
            DOWNLOAD BOTH
          </Button>
        </motion.div>
      ) : isConverting ? (
        <div className="space-y-2">
          <span className="font-mono text-[10px] tracking-wider text-[oklch(0.45_0.01_250)] uppercase block mb-3">
            Converting
          </span>
          <div className="w-full h-1.5 rounded-full bg-[oklch(0.2_0.005_250)] overflow-hidden">
            <motion.div
              className="h-full bg-[oklch(0.82_0.17_80)] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>
          <p className="font-mono text-[10px] text-[oklch(0.45_0.01_250)] text-center">
            Processing 1920×1080...
          </p>
        </div>
      ) : null}
    </motion.div>
  );
}

function MetaRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="font-mono text-[10px] text-[oklch(0.4_0.01_250)]">{label}</span>
      <span
        className={`font-mono text-[11px] ${
          highlight ? "text-[oklch(0.82_0.17_80)]" : "text-[oklch(0.7_0.01_80)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function getAspectRatio(w: number, h: number): string {
  const d = gcd(w, h);
  const rw = w / d;
  const rh = h / d;
  // Simplify common ratios
  if (rw === 16 && rh === 9) return "16:9";
  if (rw === 4 && rh === 3) return "4:3";
  if (rw === 3 && rh === 2) return "3:2";
  if (rw === 1 && rh === 1) return "1:1";
  if (rw > 50 || rh > 50) {
    // Approximate
    const ratio = w / h;
    if (Math.abs(ratio - 16 / 9) < 0.05) return "~16:9";
    if (Math.abs(ratio - 4 / 3) < 0.05) return "~4:3";
    if (Math.abs(ratio - 3 / 2) < 0.05) return "~3:2";
    return `${ratio.toFixed(2)}:1`;
  }
  return `${rw}:${rh}`;
}
