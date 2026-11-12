"use client";
/**
 * Header actions of Accounts (design `headerActions` for `fin`): "New account" on Bank accounts,
 * "New deposit", "New withdrawal" and "New transfer" on their tabs, none on Transactions.
 */
import { Button } from "@/components/ui/Button";
import { useFinOverlay } from "./shared";

function ActionButton({ action, children }: { action: "account" | "deposit" | "withdrawal" | "transfer"; children: string }) {
  const { open } = useFinOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action })}>
      {children}
    </Button>
  );
}

export const NewAccountAction = () => <ActionButton action="account">New account</ActionButton>;
export const NewDepositAction = () => <ActionButton action="deposit">New deposit</ActionButton>;
export const NewWithdrawalAction = () => <ActionButton action="withdrawal">New withdrawal</ActionButton>;
export const NewTransferAction = () => <ActionButton action="transfer">New transfer</ActionButton>;
