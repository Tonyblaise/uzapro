/**
 * Next reference in a prefixed, zero-padded sequence — the design's `expNextRef` rule:
 * highest numeric suffix among existing refs + 1.
 */
export function nextRef(existing: readonly string[], prefix: string, width: number, floor = 0): string {
  const max = existing.reduce((acc, ref) => {
    if (!ref.startsWith(prefix)) return acc;
    const n = Number(ref.slice(prefix.length).replace(/\D/g, ""));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, floor);
  return prefix + String(max + 1).padStart(width, "0");
}
