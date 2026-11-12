"use client";
/**
 * Mounts the form the URL asks for on any Receivables or Payables tab (contracts/routes.md):
 * `?action=pay` (with `party`, `sel`, `amount`, `plan`, `method`, `ref`), `?action=bulk`,
 * `?action=plan`, `?action=credit`. Record views (`?view=`) are mounted by each list.
 */
import type { Side } from "@/data";
import { CreditForm } from "./CreditForm";
import { PaymentForm } from "./PaymentForm";
import { PlanForm } from "./PlanForm";
import { useMoneyOverlay } from "./shared";

export function MoneyOverlays({ side }: { side: Side }) {
  const { params, close } = useMoneyOverlay();
  const action = params.get("action");
  if (action === "pay" || action === "bulk") {
    const sel = params.get("sel");
    const amount = Number(params.get("amount")) || 0;
    return (
      <PaymentForm
        key={params.toString()}
        side={side}
        open
        onClose={close}
        initial={{
          party: params.get("party") ?? "",
          selected: sel ? sel.split(",") : [],
          ...(amount ? { amount } : {}),
          ...(params.get("plan") ? { plan: params.get("plan")! } : {}),
          ...(params.get("method") ? { method: params.get("method")! } : {}),
          ...(params.get("ref") ? { payRef: params.get("ref")! } : {}),
          bulk: action === "bulk",
        }}
      />
    );
  }
  if (action === "plan") return <PlanForm side={side} open onClose={close} />;
  if (action === "credit") return <CreditForm side={side} open onClose={close} />;
  return null;
}
