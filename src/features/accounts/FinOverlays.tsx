"use client";
/**
 * Mounts the overlay the URL asks for on any Accounts tab (contracts/routes.md):
 * `?action=account` (new account), `?view=<account name>` (edit account),
 * `?action=deposit|withdrawal|transfer` (with `acc` from a card's Deposit / Withdraw button) and
 * `?view=<DEP-|WDL-|TRN- ref>` (record view). The generic `?record=` drawer is mounted by Transactions.
 */
import { useAccounts } from "@/data";
import { AccountForm } from "./AccountForm";
import { MoneyMoveForm } from "./MoneyMoveForm";
import { MoveView, useMoveView } from "./MoveView";
import { useFinOverlay } from "./shared";

export function FinOverlays() {
  const { params, close } = useFinOverlay();
  const accounts = useAccounts();
  const action = params.get("action");
  const view = params.get("view") ?? "";
  const move = useMoveView(view);

  if (action === "account") return <AccountForm edit="" onClose={close} />;
  if (action === "deposit" || action === "withdrawal" || action === "transfer") {
    return <MoneyMoveForm key={params.toString()} kind={action} account={params.get("acc") ?? ""} onClose={close} />;
  }
  if (move) return <MoveView key={move.ref} view={move} onClose={close} />;
  if (view && accounts.some((a) => a.name === view)) return <AccountForm edit={view} onClose={close} />;
  return null;
}
