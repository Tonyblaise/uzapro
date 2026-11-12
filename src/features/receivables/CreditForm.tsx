"use client";
/** The design's credit form (`isRcvCredit` with `cr`): "Issue customer credit" (`rcvCredit`) and "Issue supplier credit" (`payCredit`). */
import { useState } from "react";
import { WALK_IN, issueCredit, toast, useMoneyParties, type Side } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { TextArea } from "./shared";

export interface CreditFormProps {
  side: Side;
  open: boolean;
  onClose: () => void;
}

const REASONS: Record<Side, string[]> = {
  rcv: ["Overpayment", "Refund", "Manual", "Promotion", "Returned goods"],
  pay: ["Manual", "Overpayment", "Returned goods", "Audit adjustment", "Discount received"],
};
const CURRENCIES = ["KES", "USD", "EUR", "INR"];

export function CreditForm({ open, ...rest }: CreditFormProps) {
  if (!open) return null;
  return <CreditFormBody {...rest} />;
}

function CreditFormBody({ side, onClose }: Omit<CreditFormProps, "open">) {
  const rcv = side === "rcv";
  const parties = useMoneyParties(side).filter((p) => !rcv || p !== WALK_IN);
  const [party, setParty] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [extra, setExtra] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [ref, setRef] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [expiryOn, setExpiryOn] = useState(false);
  const [expires, setExpires] = useState("");
  const [why, setWhy] = useState("");
  const [busy, setBusy] = useState(false);

  const n = Number(amount) || 0;
  const blocked = rcv
    ? !party || !(n > 0) || !reason || !why.trim() || (expiryOn && (!expires || expires < DEMO_TODAY))
    : !party || !(n > 0) || !reason || (!!expires && expires < DEMO_TODAY);

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const r = rcv
      ? await issueCredit("rcv", { party, reason, why, amount: n, currency, expires: expiryOn ? expires : "", notes, payRef: ref })
      : await issueCredit("pay", { party, reason, amount: n, expires, notes });
    setBusy(false);
    if (r.ok) onClose();
    else toast(r.message);
  };

  return (
    <Modal
      open
      title={rcv ? "Issue customer credit" : "Issue supplier credit"}
      subtitle={rcv ? "Give a customer credit they can use against what they owe." : "Record credit a supplier owes you, from returns, overpayments or adjustments."}
      onClose={onClose}
      width={640}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" disabled={blocked || busy} onClick={save}>
            Issue credit
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SearchSelect label={rcv ? "Customer" : "Supplier"} options={parties} value={party} onChange={setParty} />
        {rcv && <Input label="Reference (optional)" placeholder="Payment or transaction reference" value={ref} onChange={(e) => setRef(e.target.value)} />}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          <Input label={rcv ? "Credit amount" : "Credit amount (KES)"} type="number" placeholder="0.00" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <SearchSelect
            label={rcv ? "Source type" : "Source"}
            options={[...REASONS[side], ...extra]}
            value={reason}
            onChange={setReason}
            noun="reason"
            onCreate={(x) => {
              setExtra((l) => [...l, x]);
              return x;
            }}
          />
        </div>
        {rcv && <SearchSelect label="Currency" options={CURRENCIES} value={currency} onChange={setCurrency} />}
        {rcv && (
          <div className="flex flex-col gap-3 rounded-md border border-warning/50 bg-warning-soft px-4 py-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={expiryOn} onChange={(e) => setExpiryOn(e.target.checked)} className="mt-[3px] size-4 accent-[var(--action)]" />
              <span>
                <span className="type-label text-text">Set expiry date</span>
                <span className="type-small block text-text-secondary">The credit expires on this date if it has not been used.</span>
              </span>
            </label>
            {expiryOn && <Input type="date" aria-label="Expiry date" value={expires} onChange={(e) => setExpires(e.target.value)} />}
          </div>
        )}
        {rcv && <TextArea id="credit-why" label="Reason" rows={3} placeholder="Explain why this credit is being issued" value={why} onChange={setWhy} />}
        {!rcv && <Input label="Expiry date (optional)" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />}
        <TextArea id="credit-notes" label="Notes (optional)" rows={2} placeholder="Anything your team should know" value={notes} onChange={setNotes} />
        <div className="type-small text-text-secondary">
          {rcv
            ? 'The customer can use this credit to pay what they owe. Pick "Customer credit" as the method when recording a payment.'
            : 'Use this credit when paying the supplier. Pick "Supplier credit" as the method when recording a payment.'}
        </div>
      </div>
    </Modal>
  );
}
