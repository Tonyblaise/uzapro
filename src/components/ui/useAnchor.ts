"use client";
/**
 * Anchor a popover to its trigger with `position: fixed`, so no `overflow` ancestor (table scroll
 * boxes, cards, drawer bodies) can clip it. Flips above the trigger when there isn't room below,
 * caps the height to the space available, and follows the trigger on scroll and resize.
 * The panel stays in place in the DOM (focus traps, outside-click checks and labels keep working).
 */
import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

export type AnchorAlign = "left" | "right" | "stretch";

const EDGE = 8;

export function useAnchor(open: boolean, trigger: RefObject<HTMLElement | null>, panel: RefObject<HTMLElement | null>, { align = "left", gap = 4 }: { align?: AnchorAlign; gap?: number } = {}): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({ position: "fixed", visibility: "hidden" });

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const t = trigger.current?.getBoundingClientRect();
      if (!t) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const natural = panel.current?.scrollHeight ?? 0;
      const below = vh - t.bottom - gap - EDGE;
      const above = t.top - gap - EDGE;
      const up = natural > below && above > below;
      const next: CSSProperties = { position: "fixed", maxHeight: Math.max(120, up ? above : below) };
      if (up) next.bottom = vh - t.top + gap;
      else next.top = t.bottom + gap;
      if (align === "stretch") {
        next.left = Math.max(EDGE, t.left);
        next.width = Math.min(t.width, vw - EDGE * 2);
      } else if (align === "right") next.right = Math.max(EDGE, vw - t.right);
      else next.left = Math.max(EDGE, Math.min(t.left, vw - EDGE - (panel.current?.offsetWidth ?? 0)));
      setStyle(next);
    };
    place();
    // A second pass once the panel has its real size (first paint measures it).
    const raf = requestAnimationFrame(place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, align, gap, trigger, panel]);

  return open ? style : { position: "fixed", visibility: "hidden" };
}
