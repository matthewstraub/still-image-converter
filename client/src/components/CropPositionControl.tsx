/**
 * Design: Industrial Utility — amber-accented slider for adjusting crop position.
 * Shows a visual indicator of which axis is being adjusted (horizontal or vertical).
 */
import { Slider } from "@/components/ui/slider";
import { MoveHorizontal, MoveVertical, Lock } from "lucide-react";
import { motion } from "framer-motion";
import type { CropAxis } from "@/hooks/useImageConverter";

interface CropPositionControlProps {
  cropOffset: number;
  cropAxis: CropAxis;
  onOffsetChange: (value: number) => void;
}

export default function CropPositionControl({
  cropOffset,
  cropAxis,
  onOffsetChange,
}: CropPositionControlProps) {
  if (cropAxis === "none") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded-md bg-[oklch(0.14_0.005_250)] border border-[oklch(0.22_0.005_250)]"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[oklch(0.4_0.01_250)]" />
          <span className="font-mono text-[10px] tracking-wider text-[oklch(0.45_0.01_250)] uppercase">
            Crop Position
          </span>
        </div>
        <p className="font-mono text-[11px] text-[oklch(0.5_0.01_250)] mt-2">
          Image matches 16:9 — no cropping needed.
        </p>
      </motion.div>
    );
  }

  const isHorizontal = cropAxis === "horizontal";
  const Icon = isHorizontal ? MoveHorizontal : MoveVertical;
  const labelStart = isHorizontal ? "LEFT" : "TOP";
  const labelEnd = isHorizontal ? "RIGHT" : "BOTTOM";
  const axisLabel = isHorizontal ? "Horizontal" : "Vertical";

  // Compute a human-readable percentage
  const percentage = Math.round(cropOffset * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-md bg-[oklch(0.14_0.005_250)] border border-[oklch(0.22_0.005_250)]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-[oklch(0.82_0.17_80)]" />
          <span className="font-mono text-[10px] tracking-wider text-[oklch(0.45_0.01_250)] uppercase">
            Crop Position
          </span>
        </div>
        <span className="font-mono text-[10px] text-[oklch(0.82_0.17_80)]">
          {axisLabel} · {percentage}%
        </span>
      </div>

      {/* Slider */}
      <div className="px-0.5">
        <Slider
          value={[cropOffset * 100]}
          onValueChange={(values) => onOffsetChange(values[0] / 100)}
          min={0}
          max={100}
          step={1}
          className="w-full [&_[data-slot=slider-track]]:bg-[oklch(0.2_0.005_250)] [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-range]]:bg-[oklch(0.82_0.17_80)] [&_[data-slot=slider-thumb]]:bg-[oklch(0.82_0.17_80)] [&_[data-slot=slider-thumb]]:border-[oklch(0.82_0.17_80)] [&_[data-slot=slider-thumb]]:w-4 [&_[data-slot=slider-thumb]]:h-4 [&_[data-slot=slider-thumb]]:shadow-[0_0_8px_oklch(0.82_0.17_80_/_30%)]"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        <span className="font-mono text-[9px] text-[oklch(0.4_0.01_250)] tracking-wider">
          {labelStart}
        </span>
        <span className="font-mono text-[9px] text-[oklch(0.4_0.01_250)] tracking-wider">
          CENTER
        </span>
        <span className="font-mono text-[9px] text-[oklch(0.4_0.01_250)] tracking-wider">
          {labelEnd}
        </span>
      </div>
    </motion.div>
  );
}
