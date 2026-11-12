import { createStore, type StoreApi } from "zustand/vanilla";
import { createSeed } from "./seed";
import type { AppState } from "./state";

export type AppStore = StoreApi<AppState>;

export function createAppStore(): AppStore {
  return createStore<AppState>()(() => createSeed());
}

/**
 * The single store for this browser tab. StoreProvider creates it once and registers it here so
 * that async commands (src/data/commands) can reach it without React context.
 */
let active: AppStore | null = null;

export function registerStore(store: AppStore): void {
  active = store;
}

export function getStore(): AppStore {
  if (!active) throw new Error("App store is not ready. Wrap the app in <StoreProvider>.");
  return active;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

/** Show a toast for 3 seconds (the design's toast). */
export function showToast(text: string): void {
  const store = getStore();
  const id = Date.now();
  store.setState((s) => ({ ui: { ...s.ui, toast: { id, text } } }));
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    store.setState((s) => (s.ui.toast?.id === id ? { ui: { ...s.ui, toast: null } } : s));
  }, 3000);
}

export type { AppState } from "./state";
