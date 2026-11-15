"use client";
/**
 * Credit balances shown inside other lists: customer credits in Customers › Refunds (credit notes)
 * and supplier credits in Purchases › Purchase returns. Access comes from Receivables (customer
 * credits) or Payables (supplier credits), not from the page's own module: the Cashier can raise
 * refunds without seeing customer credit balances, and the Store keeper can return goods without
 * seeing supplier credits.
 */
import { useCan, voidCredit, type CreditRow, type Side } from "@/data";
import { Button } from "@/components/ui/Button";
import type { MenuItem } from "@/components/ui/Menu";
import { CreditForm } from "./CreditForm";
import { MoneyOverlays } from "./MoneyOverlays";
import { useMoneyOverlay } from "./shared";

const MODULE = { rcv: "rcv", pay: "pay" } as const;
const METHOD: Record<Side, string> = { rcv: "Customer credit", pay: "Supplier credit" };

/** What the signed-in role may do with this side's credits. */
export function useCreditAccess(side: Side) {
  return { see: useCan("read", MODULE[side]), write: useCan("write", MODULE[side]), del: useCan("delete", MODULE[side]) };
}

/** Left on a credit, with a voided credit reading 0 as in the design. */
export const creditLeftOf = (c: CreditRow) => (c.voided ? 0 : c.left);
export const creditStatusOf = (c: CreditRow) => (c.voided ? { label: "Voided", tone: "danger" as const } : c.status);

/** Row menu items for a credit: Use to pay (Write) and Void credit (Delete, only while unused). */
export function useCreditActions(side: Side): (c: CreditRow) => MenuItem[] {
  const { open } = useMoneyOverlay();
  const can = useCreditAccess(side);
  return (c) => {
    const items: MenuItem[] = [];
    if (can.write) items.push({ label: "Use to pay", need: "none", disabled: !creditLeftOf(c), onClick: () => open({ action: "pay", party: c.party, method: METHOD[side], ref: c.ref }) });
    if (can.del) items.push({ label: "Void credit", danger: true, need: "none", disabled: c.used > 0 || c.voided, onClick: () => void voidCredit(side, c.ref) });
    return items;
  };
}

/** Header button: give a credit without a credit note or return (goodwill, overpayment …). */
export function IssueCreditButton({ side }: { side: Side }) {
  const { open } = useMoneyOverlay();
  const can = useCreditAccess(side);
  if (!can.write) return null;
  return (
    <Button variant="secondary" icon="plus" onClick={() => open({ action: "issue" })}>
      Issue credit
    </Button>
  );
}

/** The payment form for "Use to pay" (`?action=pay`) and the credit form for "Issue credit" (`?action=issue`). */
export function CreditOverlays({ side }: { side: Side }) {
  const { params, close } = useMoneyOverlay();
  if (params.get("action") === "issue") return <CreditForm side={side} open onClose={close} />;
  return params.get("action") === "pay" ? <MoneyOverlays side={side} /> : null;
}
