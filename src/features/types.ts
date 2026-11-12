import type { ComponentType } from "react";

/**
 * A tab screen. `Body` renders under the tab strip; `Actions` (optional) renders in the page
 * header's action slot (the design's `headerActions`, e.g. the "New sale" primary button).
 * Overlays (drawers, modals) are mounted by Body and driven by `?action=` / `?view=`.
 */
export interface ScreenDef {
  Body: ComponentType;
  Actions?: ComponentType;
}

/** Tab slug → screen, per module. */
export type ScreenMap = Record<string, ScreenDef>;
