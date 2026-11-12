"use client";
/**
 * Expense view (design `expView` in the shared `isDepView` dialog): the total spent, the money
 * breakdown with the account balance after, Expense details, Status, History and Notes, with Void
 * (not for voided expenses or a partly paid bill) and Approve (while waiting approval).
 * Opens with `?view=<EXP>` on Expenses and Voided (contracts/routes.md).
 */
import type { ReactNode } from "react";
import { approveExpense, useAccounts, useExpenses, useLedger, useRole, useUnvoidableExpenses, useVoidedExpenses } from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { docDate, fmt2 } from "./shared";

function Eyebrow({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <div className="type-eyebrow flex items-center gap-2 text-text-muted">
      {icon && <Icon name={icon} size={14} />}
      {children}
    </div>
  );
}

function Line({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="type-body flex justify-between gap-3 text-text-secondary">
      <span>{label}</span>
      <span className="type-label text-right text-text [overflow-wrap:anywhere]">{value}</span>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-5 py-4">{children}</div>;
}

export function ExpenseView({ refId, onClose, onVoid }: { refId: string; onClose: () => void; onVoid: () => void }) {
  const expenses = useExpenses();
  const voidedList = useVoidedExpenses();
  const accounts = useAccounts();
  const ledger = useLedger();
  const unvoidable = useUnvoidableExpenses();
  const role = useRole();

  const r = expenses.find((x) => x.ref === refId);
  const vr = r ? undefined : voidedList.find((x) => x.ref === refId);
  if (!r && !vr) {
    return (
      <Modal open title="Expense details" onClose={onClose} width={560}>
        <div className="type-body text-text-muted">{refId} is not in the list.</div>
      </Modal>
    );
  }

  const voided = !r;
  const fee = r ? r.fee : vr!.fee;
  const det = r ?? vr!;
  const cat = r ? r.category : vr!.category;
  const payee = r ? r.payee : vr!.payee;
  const acc = r ? r.account : vr!.voidAccount;
  const reason = r ? r.reason : "—";
  const amt = r ? r.amount : vr!.amount;
  const tax = r ? r.tax : 0;
  const out = amt + fee;
  const pill = r ? r.status : "Voided";
  const paid = pill === "Paid";
  const waiting = pill === "Waiting approval";
  const bill = pill === "Unpaid bill";

  // "Account balance after": today's balance less everything posted to the account after this expense.
  const accRow = accounts.find((a) => a.name === acc);
  const first = ledger.findIndex((e) => e.ref === refId && e.account === acc && (e.kind === "Expense" || e.kind === "Fee"));
  const newer = first < 0 ? 0 : ledger.slice(0, first).filter((e) => e.account === acc).reduce((a, e) => a + e.amt, 0);
  const after = accRow ? accRow.balance - newer : 0;
  const blocked = bill && unvoidable.includes(refId);

  const when = docDate(r ? r.date : vr!.date);
  const afterText =
    paid && accRow ? `KES ${fmt2(after)}` : voided ? "Money returned to the account" : bill ? "Not taken out yet. Tracked in Payables." : "Not taken out until approved";
  const tone = paid ? "success" : voided ? "danger" : "warning";
  const statusText = paid ? "Money paid out" : voided ? "Voided" : waiting ? "Waiting approval" : "Unpaid bill";
  const statusIcon: IconName = paid ? "circle-check" : voided ? "trash-2" : "clock";
  const statusColor = paid ? "text-green-700" : voided ? "text-danger-text" : "text-warning-text";
  const statusNote = paid
    ? `This money has left ${acc}.`
    : voided
      ? `Voided on ${docDate(vr!.voidedOn)}. Reason: ${vr!.reason}.`
      : waiting
        ? `Approve it to pay KES ${fmt2(out)} from ${acc}.`
        : "This bill is in Payables until it is paid.";
  const canReverse = !voided && !blocked;

  return (
    <Modal
      open
      title="Expense details"
      subtitle={
        <span className="flex flex-wrap items-center gap-3">
          <span className="u-num">{refId}</span>
          <StatusPill tone={tone}>{pill}</StatusPill>
        </span>
      }
      onClose={onClose}
      width={1000}
      footer={
        <>
          {canReverse && (
            <span className="mr-auto">
              <Button variant="danger" icon="trash-2" onClick={onVoid}>
                Void
              </Button>
            </span>
          )}
          {waiting && (
            <Button icon="check" onClick={() => void approveExpense(refId)}>
              Approve
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))" }}>
          <div className="flex min-w-0 flex-col gap-4 rounded-lg border border-danger-soft bg-danger-soft p-5 md:col-span-2">
            <div>
              <div className="type-eyebrow text-danger-text">{voided ? "Total spent (voided)" : "Total spent"}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="type-title text-text-secondary">KES</span>
                <span className="type-display u-num text-text">{fmt2(out)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-5 border-t border-border pt-4">
              {[
                ["Account", acc],
                ["Method", bill ? "Pay later" : det.method || "Cash"],
                ["Date", when],
              ].map(([label, value]) => (
                <div key={label}>
                  <Eyebrow>{label}</Eyebrow>
                  <div className="type-label mt-0.5 text-text">{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <Eyebrow icon="landmark">Money breakdown</Eyebrow>
            </div>
            <div className="flex flex-1 flex-col gap-3 px-5 py-4">
              <Line label="Amount" value={fmt2(amt)} />
              <div className="type-body flex justify-between text-text-secondary">
                <span>Transaction cost</span>
                <span className="type-label u-num text-danger-text">{fee ? `+${fmt2(fee)}` : "0.00"}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <span className="type-label text-text">Total spent</span>
                <span className="type-title u-num text-danger-text">{fmt2(out)}</span>
              </div>
            </div>
            <div className="bg-canvas px-5 py-3">
              <Eyebrow>Account balance after</Eyebrow>
              <div className={`u-num text-text ${paid && accRow ? "type-title" : "type-body"}`}>{afterText}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))" }}>
          <Panel>
            <Eyebrow icon="info">Expense details</Eyebrow>
            <Line label="Category" value={cat} />
            <Line label="Payee" value={payee === "—" ? "No payee" : payee} />
            <Line label="Branch" value={det.branch || "All branches"} />
            <Line label="Tax included" value={tax ? `KES ${fmt2(tax)}` : "No tax"} />
            <Line label="Payment reference" value={det.payRef || "None"} />
            <Line label="Description" value={reason === "—" ? "No reason given" : reason} />
            <Line label="Recorded on" value={when} />
          </Panel>
          <Panel>
            <Eyebrow icon="circle-check">Status</Eyebrow>
            <div className={`type-title flex items-center gap-2 ${statusColor}`}>
              <Icon name={statusIcon} size={18} />
              {statusText}
            </div>
            <div className="type-small text-text-secondary">{statusNote}</div>
          </Panel>
          <Panel>
            <Eyebrow icon="clock">History</Eyebrow>
            <Line label="Recorded by" value={voided ? "—" : role.name} />
            <Line label="Ledger entry" value={refId} />
            {voided && <Line label="Voided by" value={vr!.voidedBy} />}
          </Panel>
        </div>

        <Panel>
          <Eyebrow icon="file-text">Notes</Eyebrow>
          <div className={`type-body rounded-md bg-canvas px-4 py-3 ${reason !== "—" ? "text-text" : "text-text-muted"}`}>{reason !== "—" ? reason : "No notes added."}</div>
        </Panel>
      </div>
    </Modal>
  );
}
