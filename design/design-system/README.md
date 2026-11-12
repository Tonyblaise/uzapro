# Uzapoint Design System

Uzapoint is one ERP for small Kenyan businesses. It covers what they currently split across several tools: products, inventory, manufacturing, sales and POS, purchasing, accounting, CRM and reports. The interface is a clean seller dashboard: white surfaces on a soft grey canvas, one confident green, flat cards, Inter throughout, and status colour used only for meaning.

**Products represented:** one surface, the desktop web app (responsive down to phone width). No marketing site, mobile app or slide template was provided.

## Sources
- Brief: Claude artifact `https://claude.ai/artifact/3Aff3TC5fxsiVHV969NCA9`. It could not be read here because it renders client-side.
- Spec actually used: `uploads/README.md` ("Unified ERP" spec, uploaded by the user). It was written for a product called "Unified". The user renamed the app **Uzapoint**, so every "Unified" became "Uzapoint".
- Hex values given in the spec: green-500 #11A851, green-600 #0B8743, canvas #F6F6F6, text #111111, border-strong #D9D9D9. All other values (green tints, status hues, greys, shadows) are **derived** to satisfy the spec's contrast rules.

## Index
- `styles.css`: the entry point, made of @import lines only. It imports `tokens/fonts.css`, `colors.css`, `typography.css`, `spacing.css` and `base.css`.
- `tokens/`: CSS custom properties.
- `assets/fonts/`: self-hosted Inter variable font (latin and latin-ext, 400–700).
- `assets/icons/`: 55 Lucide SVGs (lucide-static 0.460.0).
- `guidelines/`: foundation specimen cards for Colors, Type, Spacing and Brand.
- `components/`: React primitives, each with `.jsx`, `.d.ts`, `.prompt.md` and one card per folder.
- `ui_kits/erp-web/`: click-through recreation of the web app. See its README.
- `SKILL.md`: agent-skill entry point.

## Components
- **core:** Icon, Logo, Button, IconButton
- **forms:** Input (and Field), Select, Checkbox
- **data:** Card, KpiCard, Delta, StatusPill, DataTable
- **navigation:** Sidebar, NavItem, AppHeader, UserChip, PageHeader
- **overlays:** Menu (and MenuList), Modal, Drawer

The spec defines no formal component inventory; it describes these components through its layout, logo, status and table rules. **Intentional additions:**
- Icon wraps the Lucide set.
- Checkbox handles table row selection.
- Select handles filters.
- PageHeader holds the title row with the page's one primary action.

## Content fundamentals
- **Voice:** plain, calm and operational. Say what happened and what to do next. Greet the user by first name on the home screen ("Good morning, Tony") and nowhere else.
- **Person:** address the user as "you" when needed. The product never says "I" or "we".
- **Case:** sentence case for titles, buttons and nav ("New invoice", "Sales & POS"). UPPERCASE appears in only two type styles, `eyebrow` (KPI labels) and `table-head`.
- **Money:** "KES 45,600.00" in tables and "KES 4.82M" in KPIs. When every cell in a column uses the same currency, the currency goes in the header: "Total (KES)". Figures always use tabular numerals.
- **Dates:** "12 Nov 2026". A relative second line can follow ("in 11 days", "1 day late", "settled 27 Oct").
- **IDs:** prefixed and zero-padded: `INV-0358`, `SO-0115`.
- **Deltas:** "↑ 12.4%". Colour shows whether the change is good for the business, not which way it moved. For example, rising overdue amounts are red.
- **Empty states:** one sentence, such as "No orders match that search."
- **Confirmations:** state the fact, such as "Sale recorded. KES 1,234.00 paid by M-Pesa."
- No emoji, exclamation marks or superlatives.

## Visual foundations
- **Colour:** the app background is `--canvas` #F6F6F6, and everything sits on white `--surface` cards. Green is the only brand colour:
  - `green-500` is the brand green, used for the logo tile, chart lines and card caps. White text on it is only 3.1:1, so it never carries small text.
  - `green-600` is the action green, used for primary buttons, the active nav item and links.
  - `green-50` and `green-100` are tints for soft fills, icon wells and focus halos. `green-700` is used for hover and press states.
  - Status colours: success, warning, info, danger and neutral. Each has a solid hue (for dots), a `-soft` ground and a `-text` colour. One meaning each; never decorative.
- **Type:** Inter only, at weights 400/500/600/700. The scale is display 32, h1 24, kpi 22, h2 18, card-title 16, title 15, body/label 14, small 13, caption 12, micro 11. Sizes stay small and dense; weight carries the hierarchy. Uppercase styles use +0.06em tracking.
- **Spacing:** 4px base (`space-1`…`space-12`).
  - Grids gap 16px, cards pad 20px, and main/panel areas pad 24px.
  - KPI grids use `auto-fit` with a 200px minimum, and panels a 320px minimum.
- **Backgrounds:** flat colour only. No images, gradients, textures or illustration in the product. The only tint fill is the pale green under the revenue chart line.
- **Corner radii:**
  - 6px for buttons and nav items
  - 8px for cards and inputs
  - 12px for panels and modals
  - pill shape for status pills
  - 24px for the outer app shell
- **Cards:** white, 8px radius, no border, no shadow; they separate from the grey canvas by colour alone. An optional 3px green-500 top cap marks a highlighted card. Tables sit edge to edge inside a card with padding 0.
- **Elevation:** flat by default. `shadow-sm` is for menus and table rows; `shadow-lg` is for drawers, modals and popovers.
- **Borders:** `--border` #EBEBEB for dividers and row lines, `--border-strong` #D9D9D9 for control outlines.
- **Transparency and blur:** only the 40% black overlay behind modals and drawers. No blur.
- **Hover:**
  - Primary buttons darken to green-700.
  - Secondary and ghost controls fill with grey-50 or grey-100.
  - Table rows fill with `surface-hover`.
  - Destructive menu items fill with `danger-soft`.
- **Press:** buttons nudge 1px down. No scale effects or bounce.
- **Focus:** 2px green-600 outline with 2px offset; inputs also get a 3px green-100 halo. Focus rings are an addition, since the spec had none.
- **Animation:** minimal. Transitions run 120–200ms on `cubic-bezier(.2,0,0,1)`, limited to colour, overlay fades and the drawer slide.
- **Layout:**
  - A 240px white sidebar holds the module list, with a 64px header row (search, help, bell, user chip) beside it.
  - Each page starts with a title row and its one primary action, followed by four KPIs, then chart and list panels, then tables.
  - The sidebar is sticky, and wide tables scroll inside their card.
- **Imagery:** none is defined. Product thumbnails are grey-100 tiles with a package icon.

## Iconography
- Line icons with 1.3–1.5px strokes, round caps and joins, and no fills. They are drawn in `currentColor` at 14, 16 or 18px. Icons sit 8–12px from their label.
- **Substitution:** the spec's own icon files were not provided. The closest match is **Lucide**, copied to `assets/icons/`. Its path data is also embedded in `components/core/iconData.js`, which the `Icon` component renders at a fixed 1.5px rendered stroke.
- Icon-only buttons always carry `aria-label`.
- No emoji or icon font. The only Unicode glyphs used as icons are the ↑ ↓ arrows in deltas.

## Logo
No logo file exists. The provisional lockup, taken from the spec, is a green-500 rounded tile with a white Inter Bold "U" next to the wordmark "Uzapoint" in green-600 Bold. The `Logo` component renders it. Replace it when a real mark is drawn.

## Known contrast gaps (kept from the spec)
- `border-strong` on white is 1.4:1, below the 3:1 target for control borders.
- `green-600` text on `canvas` is 4.3:1, so put links on white only.
- White on `green-500` is 3.1:1, so use it only for the logo glyph and text 24px or larger.
