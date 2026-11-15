"use client";
/**
 * Purchases › Purchase returns: Ref, Supplier, Purchase order, Goods receipt, Reason, Qty, Value (KES),
 * Status. Row actions View and Approve (disabled once Approved). Header action "New purchase return".
 * Supplier credits are listed here too: a return's credit shows its balance on the return's line,
 * and credits given directly (overpayment, discount …) are their own lines. Credit columns and
 * actions need Payables access.
 */
import { useMemo } from "react";
import { approvePurchaseReturn, useCredits, usePurchaseReturns, type CreditRow, type PurchaseReturn } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions, type MenuItem } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { CreditOverlays, IssueCreditButton, creditLeftOf, creditStatusOf, useCreditAccess, useCreditActions } from "@/features/receivables";
import { PurchaseOverlays } from "./PurchaseOverlays";
import { amount, usePurchaseOverlay } from "./shared";

export function NewPurchaseReturnAction() {
  const { open } = usePurchaseOverlay();
  return (
    <span className="inline-flex flex-wrap gap-2">
      <IssueCreditButton side="pay" />
      <Button icon="plus" onClick={() => open({ action: "new" })}>
        New purchase return
      </Button>
    </span>
  );
}

/** A purchase return (with the supplier credit it produced) or a credit given directly. */
type ReturnLine = { key: string; ret?: PurchaseReturn; credit?: CreditRow; when: number };

/** "10 Nov 2026, 14:05" or "4 Nov 2026" → time, for newest-first order. */
const when = (display: string) => Date.parse(display.split(",")[0] ?? "") || 0;
const status = (r: ReturnLine) => (r.ret ? r.ret.status : creditStatusOf(r.credit!));

export function PurchaseReturnList() {
  const returns = usePurchaseReturns();
  const credits = useCredits("pay");
  const can = useCreditAccess("pay");
  const creditItems = useCreditActions("pay");
  const { open } = usePurchaseOverlay();
  const rows = useMemo<ReturnLine[]>(() => {
    const fromReturns = returns.map((r) => ({ key: r.ref, ret: r, credit: credits.find((c) => c.reason.includes(`(${r.ref})`)), when: when(r.date) }));
    const used = new Set(fromReturns.map((r) => r.credit?.ref).filter(Boolean));
    const direct = can.see ? credits.filter((c) => !used.has(c.ref)).map((c) => ({ key: c.ref, credit: c, when: when(c.issued) })) : [];
    return [...fromReturns, ...direct].sort((x, y) => y.when - x.when);
  }, [returns, credits, can.see]);

  const items = (r: ReturnLine): MenuItem[] => [
    ...(r.ret
      ? [
          { label: "View", onClick: () => open({ view: r.ret!.ref }) },
          { label: "Approve", disabled: r.ret.status.label === "Approved", onClick: () => void approvePurchaseReturn(r.ret!.ref, "list") },
        ]
      : []),
    ...(r.credit && can.see ? creditItems(r.credit) : []),
  ];
  const columns: DataColumn<ReturnLine>[] = [
    { key: "ref", title: "Ref", text: (r) => r.key, render: (r) => <span className="font-medium text-text">{r.key}</span> },
    { key: "supplier", title: "Supplier", text: (r) => r.ret?.supplier ?? r.credit!.party },
    { key: "po", title: "Purchase order", text: (r) => r.ret?.po ?? "Direct credit" },
    { key: "grn", title: "Goods receipt", text: (r) => r.ret?.grn ?? "—" },
    { key: "reason", title: "Reason", text: (r) => r.ret?.reason ?? r.credit!.reason },
    { key: "qty", title: "Qty", numeric: true, text: (r) => (r.ret ? String(r.ret.qty) : "—") },
    { key: "value", title: "Value (KES)", numeric: true, text: (r) => amount(r.ret?.value ?? r.credit!.amount) },
    ...(can.see ? [{ key: "left", title: "Credit left (KES)", numeric: true, text: (r: ReturnLine) => (r.credit ? amount(creditLeftOf(r.credit)) : "—") }] : []),
    { key: "status", title: "Status", text: (r) => status(r).label, render: (r) => <StatusPill tone={status(r).tone}>{status(r).label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      text: () => "",
      render: (r) => <RowActions items={items(r)} />,
    },
  ];
  return (
    <>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.key} onRowClick={(r) => r.ret && open({ view: r.ret.ref })} minWidth={can.see ? 900 : 760} />
      <PurchaseOverlays create="return" />
      <CreditOverlays side="pay" />
    </>
  );
}
