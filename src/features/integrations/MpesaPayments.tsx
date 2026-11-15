"use client";
/**
 * Integrations › M-Pesa (Daraja) › Payments received (design `im.showTx`, feature 026): payments on
 * the business-wide account, newest first. A payment that came in without a sale can be matched to
 * an open invoice, which records the customer's payment.
 */
import { useMemo, useState } from "react";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { date as fmtDate, kes } from "@/lib/format";
import { matchMpesaPayment, useCan, useMpesaPayments, useReceivables, type DarajaConfig, type MpesaPayment } from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Overlay";

type Filter = "all" | "un" | "ok";

export function MpesaPayments({ config }: { config: DarajaConfig }) {
  const payments = useMpesaPayments();
  // Matching records a customer payment: it needs Write here and on Receivables.
  const canIntegrate = useCan("write");
  const canReceive = useCan("write", "rcv");
  const canWrite = canIntegrate && canReceive;
  const [filter, setFilter] = useState<Filter>("all");
  const [matching, setMatching] = useState<MpesaPayment | null>(null);
  const unmatched = payments.filter((p) => !p.match).length;
  const rows = payments.filter((p) => filter === "all" || (filter === "un" ? !p.match : !!p.match));
  const account = config.accountType === "paybill" ? `Paybill ${config.paybill}` : `Till ${config.tillNumber}`;
  const filters: [Filter, string, number][] = [
    ["all", "All", payments.length],
    ["un", "Not matched", unmatched],
    ["ok", "Matched", payments.length - unmatched],
  ];

  return (
    <section aria-labelledby="mpesa-payments" className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-5">
        <div className="min-w-0 flex-1">
          <h3 id="mpesa-payments" className="type-title m-0 text-text">
            Payments received
          </h3>
          <p className="type-small m-0 mt-0.5 text-text-muted">From {account}, newest first. Matched payments are recorded against the sale or invoice.</p>
        </div>
        <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
          {filters.map(([k, label, n]) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
              className={`type-small inline-flex h-[32px] items-center gap-1.5 rounded-pill border px-3 font-semibold ${filter === k ? "border-green-700 bg-green-700 text-white" : "border-border bg-surface text-text"}`}
            >
              {label} <span className="u-num opacity-80">{n}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Payments received">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="type-table-head text-text-muted">
              <th className="px-5 py-2 text-left">Received</th>
              <th className="px-5 py-2 text-left">From</th>
              <th className="px-5 py-2 text-left">How</th>
              <th className="px-5 py-2 text-right">Amount</th>
              <th className="px-5 py-2 text-left">Matched to</th>
              <th className="px-5 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.code} className="type-body border-t border-border">
                <td className="px-5 py-3">
                  <div className="text-text">
                    {p.date === DEMO_TODAY ? "Today" : fmtDate(p.date)}, {p.time}
                  </div>
                  <div className="type-small text-text-muted">{p.code}</div>
                </td>
                <td className="px-5 py-3">
                  <div className="text-text">{p.name}</div>
                  <div className="type-small text-text-muted">{p.phone}</div>
                </td>
                <td className="px-5 py-3 text-text-secondary">{p.via}</td>
                <td className="u-num px-5 py-3 text-right text-text">{kes(p.amount)}</td>
                <td className="px-5 py-3">
                  <span className={`type-small inline-flex items-center gap-1.5 ${p.match ? "text-green-700" : "text-warning-text"}`}>
                    <Icon name={p.match ? "circle-check" : "circle-alert"} size={14} />
                    {p.match || "Not matched yet"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {!p.match && canWrite && (
                    <Button size="sm" onClick={() => setMatching(p)}>
                      Match
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {matching && <MatchDialog payment={matching} onClose={() => setMatching(null)} />}
    </section>
  );
}

/** "Match payment": which invoice is this for? Closest balance first. */
function MatchDialog({ payment, onClose }: { payment: MpesaPayment; onClose: () => void }) {
  const receivables = useReceivables();
  const [pick, setPick] = useState("");
  const [error, setError] = useState("");
  const open = useMemo(
    () => receivables.filter((r) => r.balance > 0 && !r.voided).sort((a, b) => Math.abs(a.balance - payment.amount) - Math.abs(b.balance - payment.amount)),
    [receivables, payment.amount],
  );
  const save = async () => {
    const r = await matchMpesaPayment(payment.code, pick);
    if (r.ok) onClose();
    else setError(r.message);
  };
  return (
    <Modal
      open
      title="Match payment"
      subtitle={`${payment.code} · ${payment.time}${payment.date === DEMO_TODAY ? " today" : ""}`}
      onClose={onClose}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" onClick={() => void save()}>
            Record payment
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="type-label flex justify-between gap-3 rounded-md bg-canvas p-3 text-text">
          <span>
            {payment.name} · {payment.phone}
          </span>
          <span className="u-num">{kes(payment.amount)}</span>
        </div>
        <div className="type-label text-text">Which invoice is this for?</div>
        <div role="radiogroup" aria-label="Invoice" className="flex max-h-[320px] flex-col gap-2 overflow-y-auto">
          {open.map((r) => (
            <button
              key={r.ref}
              type="button"
              role="radio"
              aria-checked={pick === r.ref}
              onClick={() => (setPick(r.ref), setError(""))}
              className={`flex items-center gap-3 rounded-md border-2 p-3 text-left ${pick === r.ref ? "border-green-600 bg-green-50" : "border-border bg-surface"}`}
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="type-label text-text">
                  {r.party} · {r.doc && r.doc !== "—" ? r.doc : r.ref}
                </span>
                <span className="type-small text-text-muted">
                  Due {fmtDate(r.due)}
                  {Math.abs(r.balance - payment.amount) < 1 ? " · amount matches" : ""}
                </span>
              </span>
              <span className="type-label u-num text-text">{kes(r.balance)}</span>
            </button>
          ))}
        </div>
        {error && (
          <div role="alert" className="type-small text-danger-text">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
