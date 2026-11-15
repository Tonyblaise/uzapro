"use client";
/** Integrations read hooks (feature 015, contracts/data-access.md). */
import { useMemo } from "react";
import { mpesaRoute, scopeOptions } from "./integrations";
import { useAppStore } from "./store/StoreProvider";
import type { BankLink, DarajaConfig, IntegrationScope, MpesaPayment, MpesaRoute, QuickbooksConnection, ScopeOption, Terminal } from "./types";

/** The saved Daraja credentials for a scope, if any. */
export function useDarajaConfig(scope: IntegrationScope | null): DarajaConfig | undefined {
  return useAppStore((s) => s.integrations.daraja.find((c) => c.scope === scope));
}

/** "Applies to" choices for the Daraja form. */
export function useIntegrationScopes(): ScopeOption[] {
  const terminals = useAppStore((s) => s.settings.terminals.list);
  const daraja = useAppStore((s) => s.integrations.daraja);
  return useMemo(() => scopeOptions(terminals, daraja), [terminals, daraja]);
}

/** Payments received on the business-wide M-Pesa account, newest first (design "Payments received"). */
export function useMpesaPayments(): MpesaPayment[] {
  return useAppStore((s) => s.integrations.mpesaPayments);
}

/** Linked bank Paybills (design "M-Pesa bank integrations"). */
export function useBankLinks(): BankLink[] {
  return useAppStore((s) => s.integrations.bank);
}

/** Terminals a business-wide Paybill can give their own account number. */
export function useIntegrationTerminals(): Terminal[] {
  return useAppStore((s) => s.settings.terminals.list);
}

/** Every saved Daraja config (the form loads one when its scope is picked). */
export function useDarajaConfigs(): DarajaConfig[] {
  return useAppStore((s) => s.integrations.daraja);
}

/** The QuickBooks connection, or null when not connected. */
export function useQuickbooks(): QuickbooksConnection | null {
  return useAppStore((s) => s.integrations.quickbooks);
}

/** Where the open till's M-Pesa requests go, or why they can't be sent (feature 022). */
export function useTillMpesa(): MpesaRoute {
  const integrations = useAppStore((s) => s.integrations);
  const termId = useAppStore((s) => s.pos.ui.termId);
  return useMemo(() => mpesaRoute(integrations, termId), [integrations, termId]);
}
