"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { isRoleId } from "@/config/roles";
import { readAuth, readNavClosed } from "@/lib/storage";
import { createAppStore, registerStore, type AppStore } from "./index";
import type { AppState } from "./state";

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Register the store React actually keeps. In dev Strict Mode the initializer runs twice and one
  // result is discarded, so registering inside it could leave commands writing to the dropped store.
  const [store] = useState(createAppStore);
  registerStore(store);

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

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useAppStore<T>(selector: (s: AppState) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore must be used inside <StoreProvider>.");
  return useStore(store, selector);
}
