/**
 * Design: Industrial Utility — dashed border drop zone with animated dash-offset on hover.
 * Dark background, amber accent on drag-over, monospaced instruction text.
 */
import { useState, useCallback, useRef } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  disabled?: boolean;
}

export default function DropZone({ onFileDrop, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileDrop(files[0]);
      }
    },
    [onFileDrop, disabled]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileDrop(files[0]);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [onFileDrop]
  );

  return (
    <motion.div
      className={`
        relative w-full h-full min-h-[300px] rounded-lg
        flex flex-col items-center justify-center gap-4
        transition-colors duration-200 cursor-pointer
        ${
          isDragging
            ? "bg-[oklch(0.82_0.17_80_/_8%)] border-2 border-dashed border-[oklch(0.82_0.17_80)]"
            : "bg-[oklch(0.14_0.005_250)] border-2 border-dashed border-[oklch(0.3_0.005_250)] hover:border-[oklch(0.45_0.01_250)]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      whileHover={!disabled ? { scale: 1.005 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <AnimatePresence mode="wait">
        {isDragging ? (
          <motion.div
            key="dragging"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-full bg-[oklch(0.82_0.17_80_/_15%)] flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-[oklch(0.82_0.17_80)]" />
            </div>
            <p className="font-mono text-sm text-[oklch(0.82_0.17_80)] tracking-wide">
              RELEASE TO CONVERT
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-[oklch(0.2_0.005_250)] flex items-center justify-center border border-[oklch(0.3_0.005_250)]">
              <Upload className="w-7 h-7 text-[oklch(0.5_0.01_250)]" />
            </div>
            <div className="text-center">
              <p className="text-[oklch(0.75_0.01_80)] text-base font-medium mb-1">
                Drop an image here
              </p>
              <p className="font-mono text-xs text-[oklch(0.5_0.01_250)] tracking-wide">
                OR CLICK TO BROWSE
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {["JPG", "PNG", "GIF", "WebP", "BMP", "SVG"].map((fmt) => (
                <span
                  key={fmt}
                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-[oklch(0.2_0.005_250)] text-[oklch(0.5_0.01_250)] border border-[oklch(0.25_0.005_250)]"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
