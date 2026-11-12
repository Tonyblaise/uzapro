/** The canvas header lockup: green-500 tile with a white "U", wordmark "Uza" (green-600) + "Pro". */
export function Logo({ size = "md", tileOnly = false }: { size?: "sm" | "md" | "lg"; tileOnly?: boolean }) {
  const [tile, glyph, word] = ({ sm: [24, 14, 15], md: [32, 18, 19], lg: [40, 22, 24] } as const)[size];
  return (
    <span className="inline-flex items-center" style={{ gap: tile * 0.3 }}>
      <span
        aria-hidden="true"
        className="grid place-items-center rounded-md bg-green-500 text-white"
        style={{ width: tile, height: tile, font: `700 ${glyph}px/1 var(--font-sans)` }}
      >
        U
      </span>
      {!tileOnly && (
        <span style={{ font: `700 ${word}px/1 var(--font-sans)`, letterSpacing: "-0.01em" }}>
          <span className="text-green-600">Uza</span>
          <span className="text-text">Pro</span>
        </span>
      )}
    </span>
  );
}
