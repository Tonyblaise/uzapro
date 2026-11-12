/**
 * Point-of-sale tills open in their own browser tab (design `window.open('#pos-term-…')`) and share
 * the main UzaPro tab's in-memory store through `window.opener`, as the canvas does
 * (`window.opener.__uzApp`). Nothing is written to browser storage (Principle III).
 *
 * - The main tab exposes its store on `window.__uzStore`.
 * - A till tab opened from it gets a proxy: reads come from the host store; every write is cloned
 *   into the host window's realm first, so the data outlives this tab; subscriptions are dropped
 *   when this tab closes.
 * - If the host tab closes first, the till keeps a private copy of the data ("Not linked").
 */
import type { AppStore } from "./index";

type HostWindow = Window & { __uzStore?: AppStore; structuredClone: typeof structuredClone };

export function exposeStore(store: AppStore): void {
  try {
    (window as unknown as { __uzStore?: AppStore }).__uzStore = store;
  } catch {
    /* ignore */
  }
}

/** The opener tab's store when this tab was opened from UzaPro, else null. */
export function hostStore(): { host: AppStore; win: HostWindow } | null {
  try {
    const win = window.opener as HostWindow | null;
    if (win && win !== window && win.__uzStore) return { host: win.__uzStore, win };
  } catch {
    /* cross-origin or closed */
  }
  return null;
}

/** A store for this tab that reads and writes the host tab's store. */
export function linkedStore(host: AppStore, win: HostWindow): AppStore {
  const unsubs = new Set<() => void>();
  const clone = <T>(v: T): T => win.structuredClone(v);
  const api = {
    getState: () => host.getState(),
    getInitialState: () => host.getInitialState(),
    setState: (partial: unknown, replace?: boolean) => {
      const next = typeof partial === "function" ? (partial as (s: ReturnType<AppStore["getState"]>) => unknown)(host.getState()) : partial;
      (host.setState as (p: unknown, r?: boolean) => void)(clone(next), replace);
    },
    subscribe: (listener: Parameters<AppStore["subscribe"]>[0]) => {
      const u = host.subscribe(listener);
      unsubs.add(u);
      return () => {
        u();
        unsubs.delete(u);
      };
    },
  };
  window.addEventListener("pagehide", () => unsubs.forEach((u) => u()));
  return api as unknown as AppStore;
}
