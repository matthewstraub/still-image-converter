/**
 * Design: Industrial Utility — Swiss/Industrial design, dark workspace with amber accents.
 * Split-panel layout: left = drop zone / preview, right = info panel / downloads.
 * JetBrains Mono for metadata, DM Sans for headings.
 */
import { useImageConverter } from "@/hooks/useImageConverter";
import DropZone from "@/components/DropZone";
import ImagePreview from "@/components/ImagePreview";
import InfoPanel from "@/components/InfoPanel";
import CropPositionControl from "@/components/CropPositionControl";
import { motion, AnimatePresence } from "framer-motion";
import { Crop, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663316987914/7X53Xuo4N5jjAspL2eQsQA/hero-bg-N3f6YW7SNFGzSgsGLKsHUN.webp";

export default function Home() {
  const {
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
  } = useImageConverter();

  const handleFileDrop = (file: File) => {
    processImage(file).catch(() => {
      toast.error("Failed to process image");
    });
  };

  const hasImage = !!imageInfo;

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.1_0.005_250)]">
      {/* Header */}
      <header className="relative border-b border-[oklch(0.2_0.005_250)]">
        {/* Subtle background image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.1_0.005_250_/_60%)] to-[oklch(0.1_0.005_250)]" />

        <div className="relative container py-6 lg:py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-md bg-[oklch(0.82_0.17_80_/_12%)] border border-[oklch(0.82_0.17_80_/_25%)] flex items-center justify-center">
              <Crop className="w-4.5 h-4.5 text-[oklch(0.82_0.17_80)]" />
            </div>
            <h1 className="text-xl font-semibold text-[oklch(0.92_0.01_80)] tracking-tight">
              Image Converter
            </h1>
          </div>
          <div className="flex items-center gap-2 ml-12">
            <p className="font-mono text-xs text-[oklch(0.5_0.01_250)] tracking-wide">
              DROP ANY IMAGE
            </p>
            <ArrowRight className="w-3 h-3 text-[oklch(0.35_0.01_250)]" />
            <p className="font-mono text-xs text-[oklch(0.82_0.17_80)] tracking-wide">
              1920 × 1080
            </p>
            <ArrowRight className="w-3 h-3 text-[oklch(0.35_0.01_250)]" />
            <p className="font-mono text-xs text-[oklch(0.5_0.01_250)] tracking-wide">
              JPG + PNG
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6 lg:py-8">
        {/* Error Toast */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-md bg-[oklch(0.577_0.245_27.325_/_10%)] border border-[oklch(0.577_0.245_27.325_/_30%)] font-mono text-xs text-[oklch(0.8_0.15_27.325)]"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!hasImage ? (
            /* Drop Zone State */
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
              style={{ minHeight: "calc(100vh - 220px)" }}
            >
              <DropZone onFileDrop={handleFileDrop} disabled={isConverting} />

              {/* How it works */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    step: "01",
                    title: "Drop Image",
                    desc: "Any format — JPG, PNG, GIF, WebP, BMP, SVG",
                  },
                  {
                    step: "02",
                    title: "Adjust & Crop",
                    desc: "Slide to position the crop, image fills 1920×1080",
                  },
                  {
                    step: "03",
                    title: "Download",
                    desc: "Get both JPG and PNG in one click",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="p-4 rounded-md bg-[oklch(0.13_0.005_250)] border border-[oklch(0.2_0.005_250)]"
                  >
                    <span className="font-mono text-[10px] text-[oklch(0.82_0.17_80)] tracking-wider">
                      {item.step}
                    </span>
                    <p className="text-sm font-medium text-[oklch(0.8_0.01_80)] mt-1">
                      {item.title}
                    </p>
                    <p className="font-mono text-[11px] text-[oklch(0.45_0.01_250)] mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Preview + Info State */
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col lg:flex-row gap-6"
              style={{ minHeight: "calc(100vh - 220px)" }}
            >
              {/* Left: Preview */}
              <div className="flex-[3] min-w-0">
                <ImagePreview
                  imageInfo={imageInfo}
                  converted={converted}
                  isConverting={isConverting}
                />
              </div>

              {/* Right: Info Panel + Crop Control */}
              <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
                {/* Crop Position Control — placed prominently above the info panel */}
                <CropPositionControl
                  cropOffset={cropOffset}
                  cropAxis={cropAxis}
                  onOffsetChange={updateCropOffset}
                />

                <InfoPanel
                  imageInfo={imageInfo}
                  converted={converted}
                  isConverting={isConverting}
                  onDownloadJpg={downloadJpg}
                  onDownloadPng={downloadPng}
                  onDownloadBoth={downloadBoth}
                  onReset={reset}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[oklch(0.18_0.005_250)] py-4">
        <div className="container">
          <p className="font-mono text-[10px] text-[oklch(0.35_0.01_250)] text-center tracking-wider">
            ALL PROCESSING HAPPENS IN YOUR BROWSER · NO FILES ARE UPLOADED TO ANY SERVER
          </p>
        </div>
      </footer>
    </div>
  );
}
