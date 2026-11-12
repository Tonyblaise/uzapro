"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { isRoleId } from "@/config/roles";
import { readAuth, readNavClosed } from "@/lib/storage";
import { createAppStore, registerStore, type AppStore } from "./index";
import { exposeStore, hostStore, linkedStore } from "./link";
import type { AppState } from "./state";

const StoreContext = createContext<AppStore | null>(null);
/** True when this tab shares the main UzaPro tab's data (a till opened in its own tab). */
const LinkedContext = createContext(false);

export function useLinkedTab(): boolean {
  return useContext(LinkedContext);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Register the store React actually keeps. In dev Strict Mode the initializer runs twice and one
  // result is discarded, so registering inside it could leave commands writing to the dropped store.
  // A till tab opened from UzaPro shares the main tab's data (feature 010, store/link.ts).
  const [link] = useState(() => (typeof window === "undefined" ? null : hostStore()));
  const [store, setStore] = useState<AppStore>(() => (link ? linkedStore(link.host, link.win) : createAppStore()));
  const [linked, setLinked] = useState(!!link);
  registerStore(store);

  useEffect(() => {
    exposeStore(store);
  }, [store]);

  useEffect(() => {
    if (!link) return;
    // If the main tab closes first, keep working on a private copy ("Not linked to UzaPro").
    const unlink = () => {
      const copy = createAppStore();
      copy.setState(structuredClone(link.host.getState()), true);
      setStore(copy);
      setLinked(false);
    };
    try {
      link.win.addEventListener("pagehide", unlink);
    } catch {
      /* ignore */
    }
  }, [link]);

  // Apply browser-only UI settings after mount so server and first client render match (R1 fix).
  useEffect(() => {
    const auth = readAuth();
    const navClosed = readNavClosed();
    store.setState((s) => ({
      session: {
        ...s.session,
        authed: s.session.authed || !!(auth && isRoleId(auth.role)),
        role: s.session.authed ? s.session.role : auth && isRoleId(auth.role) ? auth.role : s.session.role,
        navClosed,
        hydrated: true,
      },
    }));
  }, [store]);

  return (
    <StoreContext.Provider value={store}>
      <LinkedContext.Provider value={linked}>{children}</LinkedContext.Provider>
    </StoreContext.Provider>
  );
}

export function useAppStore<T>(selector: (s: AppState) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore must be used inside <StoreProvider>.");
  return useStore(store, selector);
}
