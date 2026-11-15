import type { ReactNode } from "react";
import type { Tone } from "@/data";

const TONE: Record<Tone, { box: string; dot: string }> = {
  success: { box: "bg-success-soft text-success-text", dot: "bg-success" },
  warning: { box: "bg-warning-soft text-warning-text", dot: "bg-warning" },
  info: { box: "bg-info-soft text-info-text", dot: "bg-info" },
  danger: { box: "bg-danger-soft text-danger-text", dot: "bg-danger" },
  neutral: { box: "bg-neutral-soft text-neutral-text", dot: "bg-neutral" },
};

/** Status pill: soft ground, text colour and dot. Always carries text, never colour alone. */
export function StatusPill({ tone = "neutral", dot = true, children }: { tone?: Tone | string; dot?: boolean; children: ReactNode }) {
  const t = TONE[(tone as Tone) in TONE ? (tone as Tone) : "neutral"];
  return (
    <span className={`type-caption inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 font-semibold ${t.box}`}>
      {dot && <span aria-hidden="true" className={`size-1.5 rounded-full ${t.dot}`} />}
      {children}
    </span>
  );
}
