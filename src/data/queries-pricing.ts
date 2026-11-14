"use client";
/** Pricing and credit read hooks (feature 012, contracts/data-access.md). */
import { useCallback, useMemo } from "react";
import { creditPosition } from "./credit";
import { canApproveCredit, positionOf, stopFor } from "./creditGate";
import { WALK_IN } from "./fixtures/customers";
import { RETAIL_GROUP, priceFor, priceNote, standardPrice } from "./pricing";
import { tillCreditPart } from "./commands/pos";
import { useAppStore } from "./store/StoreProvider";
import type { CreditPosition, CreditStop, CustomerGroup, LinePrice, PriceEntry } from "./types";

export interface CustomerGroupRow extends CustomerGroup {
  customers: number;
  prices: number;
}

export function useCustomerGroups(): CustomerGroupRow[] {
  const groups = useAppStore((s) => s.pricing.groups);
  const prices = useAppStore((s) => s.pricing.prices);
  const customers = useAppStore((s) => s.customers);
  return useMemo(
    () => groups.map((g) => ({ ...g, customers: customers.filter((c) => c.group === g.id).length, prices: prices.filter((e) => e.group === g.id).length })),
    [groups, prices, customers],
  );
}

export interface PriceRow extends PriceEntry {
  /** The standard price for this variant and unit (0 when the product is gone). */
  standard: number;
  /** True when the first break is above the standard price. */
  higher: boolean;
}

/** Price entries (one group's, or all), with the standard price alongside. */
export function usePriceEntries(group?: string): PriceRow[] {
  const prices = useAppStore((s) => s.pricing.prices);
  const products = useAppStore((s) => s.catalog.products);
  return useMemo(
    () =>
      prices
        .filter((e) => !group || e.group === group)
        .map((e) => {
          const v = products.find((p) => p.name === e.product)?.variants.find((x) => x.name === e.variant);
          const standard = v ? standardPrice(v, e.unit) : 0;
          return { ...e, standard, higher: standard > 0 && e.breaks.some((b) => b.price > standard) };
        }),
    [prices, products, group],
  );
}

/** The customer's group (Retail for the walk-in customer and unknown names). */
export function useGroupOf(customer: string): CustomerGroup {
  const groups = useAppStore((s) => s.pricing.groups);
  const id = useAppStore((s) => s.customers.find((c) => c.name === customer)?.group ?? RETAIL_GROUP);
  return useMemo(() => groups.find((g) => g.id === id) ?? groups.find((g) => g.id === RETAIL_GROUP) ?? { id: RETAIL_GROUP, name: "Retail", builtIn: true }, [groups, id]);
}

export interface Pricer {
  group: CustomerGroup;
  /** The price for a line, or null when the product or variant is unknown. */
  price: (product: string, variant: string, unit: string, qty: number) => LinePrice | null;
  /** "Wholesale price", "Wholesale price from 2 Tray" or "". */
  note: (p: LinePrice | null) => string;
}

/** Prices for one customer: their group's list, falling back to the standard price. */
export function usePricer(customer: string): Pricer {
  const group = useGroupOf(customer);
  const prices = useAppStore((s) => s.pricing.prices);
  const products = useAppStore((s) => s.catalog.products);
  const price = useCallback(
    (product: string, variant: string, unit: string, qty: number) => {
      const v = products.find((p) => p.name === product)?.variants.find((x) => x.name === variant);
      return v ? priceFor({ prices, group: group.id, product, variant: v, unit, qty }) : null;
    },
    [prices, products, group.id],
  );
  const note = useCallback((p: LinePrice | null) => (p ? priceNote(p, group.name) : ""), [group.name]);
  return useMemo(() => ({ group, price, note }), [group, price, note]);
}

/** null for the walk-in customer and unknown names. */
export function useCreditPosition(customer: string): CreditPosition | null {
  const customers = useAppStore((s) => s.customers);
  const receivables = useAppStore((s) => s.money.receivables);
  const orders = useAppStore((s) => s.sales.orders);
  return useMemo(() => positionOf(customers, receivables, orders, customer), [customers, receivables, orders, customer]);
}

/** Credit positions by customer name, for the Customers table (not the walk-in customer). */
export function useCreditPositions(): Record<string, CreditPosition> {
  const customers = useAppStore((s) => s.customers);
  const receivables = useAppStore((s) => s.money.receivables);
  const orders = useAppStore((s) => s.sales.orders);
  return useMemo(() => Object.fromEntries(customers.filter((c) => c.name !== WALK_IN).map((c) => [c.name, creditPosition(c, receivables, orders)])), [customers, receivables, orders]);
}

/** A checker for the sale forms: the stop for a credit amount, or null. */
export function useCreditCheck(customer: string): (creditAmount: number) => CreditStop | null {
  const customers = useAppStore((s) => s.customers);
  const receivables = useAppStore((s) => s.money.receivables);
  const orders = useAppStore((s) => s.sales.orders);
  return useCallback((amount: number) => stopFor(customers, receivables, orders, customer, amount), [customers, receivables, orders, customer]);
}

/** FR-017: Write on Receivables. */
export function useCanApproveCredit(): boolean {
  return useAppStore((s) => canApproveCredit(s));
}

/** The credit stop for the sale at the till's checkout (Pay later part), or null. */
export function useTillCreditStop(): CreditStop | null {
  const cust = useAppStore((s) => s.pos.ui.cust);
  const part = useAppStore((s) => tillCreditPart(s));
  const check = useCreditCheck(cust);
  return useMemo(() => check(part), [check, part]);
}
