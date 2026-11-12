"use client";
/**
 * The design's payment form (`isRcvPay` with `rp`), shared by customer payments (`rcvPay`) and
 * supplier payments (`payPay`). Single, bulk (`bulk`) and instalment (`plan`) payments.
 */
import { useState } from "react";
import { MONEY_ACCOUNTS, UZ_PAYMETHODS, WALK_IN, recordPayment, toast, useMoneyParties, useOpenItems, usePayables, useUsableCredit, type Side } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { docDate, fmt } from "./shared";

export interface PaymentInitial {
  party?: string;
  selected?: string[];
  amount?: number;
  plan?: string;
  method?: string;
  /** "Reference (optional)" (the design fills it with the credit ref on "Use to pay"). */
  payRef?: string;
  bulk?: boolean;
}

export interface PaymentFormProps {
  side: Side;
  open: boolean;
  onClose: () => void;
  initial?: PaymentInitial;
}

const CREDIT: Record<Side, string> = { rcv: "Customer credit", pay: "Supplier credit" };

const GRID = { gridTemplateColumns: "28px minmax(0,1.4fr) minmax(0,1fr) 110px 110px" };

export function PaymentForm({ open, ...rest }: PaymentFormProps) {
  if (!open) return null;
  return <PaymentFormBody {...rest} />;
}

function PaymentFormBody({ side, onClose, initial = {} }: Omit<PaymentFormProps, "open">) {
  const rcv = side === "rcv";
  const credit = CREDIT[side];
  // Design `rcvPayOpen` / `payOpen` defaults.
  const method0 = initial.method || (rcv ? "M-Pesa" : "Bank transfer");
  const [party, setParty] = useState(initial.party ?? "");
  const [sel, setSel] = useState<Record<string, boolean>>(() => Object.fromEntries((initial.selected ?? []).map((r) => [r, true])));
  const [amount, setAmount] = useState(initial.amount ? String(initial.amount) : "");
  const [method, setMethod] = useState(method0);
  const [account, setAccount] = useState(method0 === credit ? "" : rcv ? "M-Pesa Till" : "Equity Bank — Main");
  const [date, setDate] = useState(DEMO_TODAY);
  const [ref, setRef] = useState(initial.payRef ?? "");
  const [busy, setBusy] = useState(false);

  const parties = useMoneyParties(side).filter((p) => !rcv || p !== WALK_IN);
  const open = useOpenItems(side, party);
  const usable = useUsableCredit(side, party);
  const avail = party ? usable : 0;
  const payables = usePayables();
  const waiting = rcv || !party ? 0 : payables.filter((p) => p.party === party && p.balance > 0 && p.approval === "Waiting approval").length;

  const isCredit = method === credit;
  const chosen = open.filter((r) => sel[r.ref]);
  const selTotal = chosen.reduce((a, r) => a + r.balance, 0);
  const amt = Number(amount) || 0;
  let left = amt;
  const alloc: Record<string, number> = {};
  for (const r of chosen) {
    const take = Math.min(left, r.balance);
    if (take > 0) alloc[r.ref] = take;
    left -= take;
  }
  const warn =
    amt > selTotal && chosen.length
      ? `That is more than the ${fmt(selTotal)} KES selected. Lower the amount or tick more ${rcv ? "receivables" : "payables"}.`
      : isCredit && amt > avail
        ? rcv
          ? `This customer only has KES ${fmt(avail)} credit to use.`
          : `This supplier only owes you KES ${fmt(avail)} in credit.`
        : "";
  const blocked = !party || !chosen.length || !(amt > 0) || !!warn || (!isCredit && !account) || !date;

  const title = initial.bulk ? "New bulk payment" : rcv ? "Record payment" : "Pay supplier";
  const sub = initial.plan
    ? `Instalment for ${initial.plan}.`
    : initial.bulk
      ? rcv
        ? "One payment that clears several receivables for a customer."
        : "One payment that clears several payables for a supplier."
      : rcv
        ? "Money received from a customer against what they owe."
        : "Money paid to a supplier against what you owe.";
  const listTitle = party ? `${rcv ? "Open receivables" : "Approved payables"} for ${party} (oldest first)` : rcv ? "Open receivables" : "Approved payables";
  const emptyText = rcv
    ? party
      ? `${party} has nothing outstanding.`
      : "Pick a customer to load what they owe."
    : !party
      ? "Pick a supplier to load what you owe them."
      : waiting
        ? `Nothing approved to pay yet. ${waiting} waiting for approval.`
        : `You owe ${party} nothing right now.`;
  const creditText = party ? (rcv ? `Available credit: KES ${fmt(avail)}` : `Credit from this supplier: KES ${fmt(avail)}`) : rcv ? "Pick a customer to see their credit." : "Pick a supplier to see their credit.";

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const r = await recordPayment(side, {
      party,
      selected: chosen.map((x) => x.ref),
      amount: amt,
      method,
      account: isCredit ? "" : account,
      date,
      payRef: ref,
      ...(initial.plan ? { plan: initial.plan } : {}),
      ...(initial.bulk ? { bulk: true } : {}),
    });
    setBusy(false);
    if (r.ok) onClose();
    else toast(r.message);
  };

  return (
    <Modal
      open
      title={title}
      subtitle={sub}
      onClose={onClose}
      width={720}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" disabled={blocked || busy} onClick={save}>
            Save payment
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SearchSelect
          label={rcv ? "Customer" : "Supplier"}
          options={parties}
          value={party}
          onChange={(v) => {
            setParty(v);
            setSel({});
            setAmount("");
          }}
        />
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="type-eyebrow bg-canvas px-4 py-3 text-text-muted">{listTitle}</div>
          {!open.length && <div className="type-body px-4 py-5 text-center text-text-muted">{emptyText}</div>}
          {open.map((r) => {
            const late = r.due < DEMO_TODAY;
            return (
              <label key={r.ref} className="grid cursor-pointer items-center gap-3 border-t border-border px-4 py-3" style={GRID}>
                <input
                  type="checkbox"
                  aria-label="Pay this item"
                  checked={!!sel[r.ref]}
                  onChange={(e) => setSel((s) => ({ ...s, [r.ref]: e.target.checked }))}
                  className="size-4 accent-[var(--action)]"
                />
                <span className="type-label text-text">
                  {r.ref}
                  <span className="type-caption block font-normal text-text-muted">{r.type + (r.doc && r.doc !== "—" ? ` · ${r.doc}` : "")}</span>
                </span>
                <span className={`type-small ${late ? "text-danger-text" : "text-text-secondary"}`}>Due {docDate(r.due)}</span>
                <span className="type-label u-num text-right text-text">{fmt(r.balance)}</span>
                <span className="type-label u-num text-right text-green-700">{alloc[r.ref] ? fmt(alloc[r.ref]!) : "—"}</span>
              </label>
            );
          })}
          {open.length > 0 && (
            <div className="type-eyebrow grid gap-3 border-t border-border px-4 py-2 text-text-muted" style={GRID}>
              <span />
              <span />
              <span />
              <span className="text-right">Balance</span>
              <span className="text-right">This payment</span>
            </div>
          )}
        </div>
        <div className="grid items-end gap-3" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
          <Input label={rcv ? "Amount received (KES)" : "Amount paid (KES)"} type="number" placeholder="0.00" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button variant="soft" disabled={!chosen.length} onClick={() => setAmount(String(isCredit ? Math.min(selTotal, avail) : selTotal))}>
            Pay full balance
          </Button>
        </div>
        {warn && (
          <div role="alert" className="type-small text-warning-text">
            {warn}
          </div>
        )}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          <SearchSelect label="Payment method" options={[...UZ_PAYMETHODS, credit]} value={method} onChange={setMethod} />
          {!isCredit && <SearchSelect label={rcv ? "Paid into" : "Paid from"} options={MONEY_ACCOUNTS} value={account} onChange={setAccount} />}
          {isCredit && <div className="type-small self-end rounded-md bg-canvas px-3 py-2 text-text-secondary">{creditText}</div>}
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          <Input label="Payment date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Reference (optional)" placeholder="Receipt or M-Pesa code" value={ref} onChange={(e) => setRef(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
