import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Principle II: UI reaches data only through `@/data`.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/data/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/data/fixtures", "@/data/fixtures/*"], message: "Import data through @/data (Constitution Principle II)." },
            { group: ["@/data/store", "@/data/store/*"], message: "Import data through @/data (Constitution Principle II)." },
          ],
        },
      ],
    },
  },
  // Principle IV: design tokens only — no raw hex colours in UI code.
  {
    files: ["src/components/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message: "Use design tokens (var(--…)) instead of hex colours (Constitution Principle IV).",
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]",
          message: "Use design tokens (var(--…)) instead of hex colours (Constitution Principle IV).",
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "design/**", "playwright-report/**", "test-results/**"]),
]);

export default eslintConfig;
