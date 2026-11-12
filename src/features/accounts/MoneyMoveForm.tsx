"use client";
/**
 * The design's money-movement modal (`isFinModal`, `f*` fields) for deposits, withdrawals and
 * transfers. The unreachable `fIsAcc` branch is not ported. A withdrawal or transfer larger than
 * the source balance shows the soft `fShortText` warning and can still be saved.
 */
import { useState } from "react";
import { UZ_PAYMETHODS, recordDeposit, recordTransfer, recordWithdrawal, shortWarning, toast, useAccounts, useActiveAccountNames } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";

export type MoveKind = "deposit" | "withdrawal" | "transfer";

const TEXT: Record<MoveKind, { title: string; sub: string; amt: string; fee: string; desc: string; btn: string }> = {
  deposit: { title: "New deposit", sub: "Add money to an account.", amt: "Deposit amount (KES)", fee: "Bank or processing fee (optional)", desc: "Brief description of the deposit", btn: "Create deposit" },
  withdrawal: { title: "New withdrawal", sub: "Take money out of an account.", amt: "Withdrawal amount (KES)", fee: "Bank or processing fee (optional)", desc: "Brief description of the withdrawal", btn: "Create withdrawal" },
  transfer: { title: "New account transfer", sub: "Move money between your accounts.", amt: "Transfer amount (KES)", fee: "Transfer fee (optional)", desc: "What the transfer is for", btn: "Confirm transfer" },
};

const TEXTAREA =
  "type-body w-full resize-y rounded-md border border-border-strong bg-surface px-3 py-2 text-text outline-none focus:border-action focus:shadow-[0_0_0_3px_var(--green-100)]";

export function MoneyMoveForm({ kind, account = "", onClose }: { kind: MoveKind; account?: string; onClose: () => void }) {
  const t = TEXT[kind];
  const names = useActiveAccountNames();
  const accounts = useAccounts();
  // Design `finOpen` defaults.
  const [acc, setAcc] = useState(account);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("0");
  const [method, setMethod] = useState("Cash");
  const [ref, setRef] = useState("");
  const [purpose, setPurpose] = useState("");
  const [desc, setDesc] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const isTr = kind === "transfer";
  const amt = Number(amount) || 0;
  const feeN = Number(fee) || 0;
  const balance = accounts.find((a) => a.name === acc)?.balance ?? 0;
  const short = shortWarning(kind, { account: acc, amount: amt, fee: feeN }, balance);
  const blocked = !acc || !(amt > 0) || !desc.trim() || (isTr && (!to || to === acc));

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const input = { account: acc, amount: amt, fee: feeN, description: desc, bankRef: ref, notes };
    const r =
      kind === "deposit"
        ? await recordDeposit({ ...input, method })
        : kind === "withdrawal"
          ? await recordWithdrawal({ ...input, method, purpose })
          : await recordTransfer({ ...input, to });
    setBusy(false);
    if (r.ok) onClose();
    else toast(r.message);
  };

  const two = "grid grid-cols-2 gap-4";
  const amountFields = (
    <div className={two}>
      <Input label={t.amt} type="number" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <Input label={t.fee} type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} />
    </div>
  );

  return (
    <Modal
      open
      title={t.title}
      subtitle={t.sub}
      onClose={onClose}
      width={600}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={kind === "withdrawal" ? "danger" : "primary"} disabled={blocked || busy} onClick={save}>
            {t.btn}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {!isTr && (
          <>
            <SearchSelect label={kind === "deposit" ? "Destination account" : "Source account"} options={names} value={acc} onChange={setAcc} />
            {amountFields}
            <div className={two}>
              <SearchSelect label={kind === "deposit" ? "Deposit method" : "Withdrawal method"} options={UZ_PAYMETHODS} value={method} onChange={setMethod} />
              <Input label="Reference number (optional)" placeholder="For example, M-Pesa code or cheque number" value={ref} onChange={(e) => setRef(e.target.value)} />
            </div>
            {kind === "withdrawal" && (
              <Input label="Purpose (optional)" placeholder="For example, supplier payment or operations" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            )}
          </>
        )}
        {isTr && (
          <>
            <div className={two}>
              <SearchSelect label="From account" options={names} value={acc} onChange={setAcc} />
              <SearchSelect label="To account" options={names.filter((n) => n !== acc)} value={to} onChange={setTo} />
            </div>
            {amountFields}
          </>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-desc" className="type-label text-text">
            Description
          </label>
          <textarea id="f-desc" rows={2} placeholder={t.desc} value={desc} onChange={(e) => setDesc(e.target.value)} className={TEXTAREA} />
        </div>
        {!isTr && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-notes" className="type-label text-text">
              Internal notes (optional)
            </label>
            <textarea id="f-notes" rows={2} placeholder="Additional notes for your team" value={notes} onChange={(e) => setNotes(e.target.value)} className={TEXTAREA} />
          </div>
        )}
        {short && <div className="type-small text-danger-text">{short}</div>}
      </div>
    </Modal>
  );
}
