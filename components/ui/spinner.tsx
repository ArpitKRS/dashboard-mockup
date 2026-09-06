/**
 * Adapted from osmosis/components/ui/spinner.tsx — only the inline <Spinner>
 * is ported (PageLoader isn't used anywhere on the Dashboard).
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10",
} as const;

const TONE_CLASSES = {
  primary: "text-pod-primary",
  muted: "text-pod-muted",
  inherit: "text-current",
} as const;

export type SpinnerSize = keyof typeof SIZE_CLASSES;
export type SpinnerTone = keyof typeof TONE_CLASSES;

export interface SpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", tone = "primary", className, label }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin", SIZE_CLASSES[size], TONE_CLASSES[tone], className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
