"use client";
/**
 * The stopped-sale dialog (feature 012, contracts/ui.md › CreditStop). Shown when a credit sale,
 * invoice or till "Pay later" meets cash terms, an overdue balance or the credit limit. Roles with
 * Write on Receivables can approve it with a reason.
 */
import { useState } from "react";
import { APPROVAL_MIN, approvalReasonOk, useCanApproveCredit, type CreditStop as Stop } from "@/data";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { date as fmtDate, kes } from "@/lib/format";

function wording(stop: Stop): { title: string; lead: string } {
  const who = stop.position.customer;
  if (stop.why === "cash") return { title: `${who} is on cash terms`, lead: "Customers on cash terms pay when they buy." };
  if (stop.why === "overdue") {
    const o = stop.position.oldest;
    return { title: `${who} has ${kes(stop.position.overdue)} overdue`, lead: o ? `Oldest: ${o.doc && o.doc !== "—" ? o.doc : o.ref}, due ${fmtDate(o.due)}.` : "" };
  }
  return { title: "Over the credit limit", lead: `This sale is ${kes(stop.over)} over what ${who} can still take on credit.` };
}

export function CreditStop({ stop, onClose, onApprove, overTill }: { stop: Stop | null; onClose: () => void; onApprove: (reason: string) => void; /** Show above the full-screen till. */ overTill?: boolean }) {
  if (!stop) return null;
  return <CreditStopBody stop={stop} onClose={onClose} onApprove={onApprove} overTill={overTill} />;
}

function CreditStopBody({ stop, onClose, onApprove, overTill }: { stop: Stop; onClose: () => void; onApprove: (reason: string) => void; overTill?: boolean }) {
  const canApprove = useCanApproveCredit();
  const [reason, setReason] = useState("");
  const [tried, setTried] = useState(false);
  const { title, lead } = wording(stop);
  const p = stop.position;
  const rows: [string, string][] = [
    ["Credit limit", p.limit === null ? "No limit" : kes(p.limit)],
    ["Balance owed", kes(p.owed)],
    ["On order, not yet invoiced", kes(p.onOrder)],
    ["Available credit", p.available === null ? "No limit" : kes(p.available)],
    ["This sale on credit", kes(stop.amount)],
  ];
  const bad = tried && !approvalReasonOk(reason);
  const approve = () => {
    setTried(true);
    if (approvalReasonOk(reason)) onApprove(reason.trim());
  };
  return (
    <Modal
      open
      overTill={overTill}
      title={title}
      subtitle={lead}
      onClose={onClose}
      footer={
        canApprove ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={approve}>Approve anyway</Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <dl className="m-0 flex flex-col">
          {rows.map(([k, v]) => (
            <div key={k} className="type-body flex justify-between gap-4 border-b border-border py-2">
              <dt className="text-text-secondary">{k}</dt>
              <dd className="u-num m-0 text-right text-text">{v}</dd>
            </div>
          ))}
        </dl>
        {canApprove ? (
          <Textarea
            label="Reason for approving"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={bad ? `Give a reason of at least ${APPROVAL_MIN} characters` : undefined}
          />
        ) : (
          <p className="type-body m-0 text-text">Ask a manager to approve this, or take another payment method.</p>
        )}
      </div>
    </Modal>
  );
}
