# Design reference

Read-only reference material for the UzaPro prototype. Copied on 2026-11-12 from the Claude Design
canvas "Uzapoint ERP dashboard rebuild"
(https://claude.ai/artifact/KKMZcTUgzkopE2izUei3TS, version `1794472152-a141`).

Nothing in this folder is imported by the app at runtime. Port values from here into
`src/` (see the constitution, `.specify/memory/constitution.md`). If the canvas changes,
re-copy the affected files and update the version above.

## `design-system/`: Uzapoint design system

| Path | What it is | Use it for |
|---|---|---|
| `README.md` | Design-system guide: voice, colour, type, spacing, radii, elevation, iconography, logo, contrast gaps | Content and visual rules (Principle IV) |
| `styles.css` | Entry point; `@import`s the five token files | Order of the token layers |
| `tokens/colors.css` | Brand green, neutrals, status tones, semantic aliases | Tailwind theme / CSS variables |
| `tokens/typography.css` | Inter stack, sizes, line heights, composite `--type-*` styles | Text styles |
| `tokens/spacing.css` | Space scale, radii, shadows, layout sizes, motion | Spacing, radii, shadows, shell sizes |
| `tokens/fonts.css` + `assets/fonts/*.woff2` | Self-hosted Inter variable (400–700) | `next/font/local` source files |
| `tokens/base.css` | Body, link, focus-ring, `.u-num` defaults | Global CSS |
| `_ds_manifest.json` | Component inventory and token list | Checklist of primitives to build |
| `_ds_bundle.js` | Compiled reference React components (Button, KpiCard, DataTable, Sidebar, Modal…) | Reading component markup and behaviour, not for importing |

## `canvas/`: the prototype design

| Path | What it is | Use it for |
|---|---|---|
| `Uzapoint ERP.dc.html` | The full interactive design (every module, tab, form, modal and the login and role flows) | Source of truth for layout, copy and flows (Principle I) |
| `erp-data.js` | All demo data as `window.UZ_*` globals (`UZ_MODS`, `UZ_HOME`, `UZ_ROLES`, `UZ_PRODUCTS`, `UZ_LEDGER`…) | Port verbatim into `src/data/fixtures/` (Principle II) |
| `compat.json` | Canvas page list and source metadata | Provenance |
| `uploads/Unified ERP Prototype.html` | An earlier "Unified ERP" prototype the design was based on | Background only; the canvas wins on conflicts |
| `uploads/pasted-1793523290413-0.png` | Screenshot the design was based on | Background only |

`Uzapoint ERP.dc.html` is a Claude Design page format and does not run on its own here: its
runtime (`support.js`) was not copied. To see it rendered, open the canvas link above.
