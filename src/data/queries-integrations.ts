"use client";
/** Integrations read hooks (feature 015, contracts/data-access.md). */
import { useMemo } from "react";
import { scopeOptions } from "./integrations";
import { useAppStore } from "./store/StoreProvider";
import type { BankConfig, BankId, DarajaConfig, IntegrationScope, QuickbooksConnection, ScopeOption, Terminal } from "./types";

/** The saved Daraja credentials for a scope, if any. */
export function useDarajaConfig(scope: IntegrationScope | null): DarajaConfig | undefined {
  return useAppStore((s) => s.integrations.daraja.find((c) => c.scope === scope));
}

export function useBankConfig(bank: BankId, scope: IntegrationScope | null): BankConfig | undefined {
  return useAppStore((s) => s.integrations.bank.find((c) => c.bank === bank && c.scope === scope));
}

/** "Applies to" choices for the Daraja form, or for one bank's form. */
export function useIntegrationScopes(bank?: BankId): ScopeOption[] {
  const terminals = useAppStore((s) => s.settings.terminals.list);
  const daraja = useAppStore((s) => s.integrations.daraja);
  const banks = useAppStore((s) => s.integrations.bank);
  return useMemo(() => scopeOptions(terminals, bank ? banks.filter((c) => c.bank === bank) : daraja), [terminals, daraja, banks, bank]);
}

/** Terminals a business-wide Paybill can give their own account number. */
export function useIntegrationTerminals(): Terminal[] {
  return useAppStore((s) => s.settings.terminals.list);
}

/** Every saved Daraja config (the form loads one when its scope is picked). */
export function useDarajaConfigs(): DarajaConfig[] {
  return useAppStore((s) => s.integrations.daraja);
}

/** Every saved config for one bank. */
export function useBankConfigs(bank: BankId): BankConfig[] {
  const all = useAppStore((s) => s.integrations.bank);
  return useMemo(() => all.filter((c) => c.bank === bank), [all, bank]);
}

/** The QuickBooks connection, or null when not connected. */
export function useQuickbooks(): QuickbooksConnection | null {
  return useAppStore((s) => s.integrations.quickbooks);
}
