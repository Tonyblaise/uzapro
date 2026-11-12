"use client";
/**
 * Void expense (design `isExpVoid` with `ev`): the warning, what is being voided and its amount,
 * "Reason for voiding", Cancel / "Void expense". Opens with `?view=<EXP>&step=void`.
 */
import { useState } from "react";
import { toast, useExpenses, voidExpense } from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Overlay";
import { TextArea, fmt } from "./shared";

export function VoidExpenseForm({ refId, onClose }: { refId: string; onClose: () => void }) {
  const r = useExpenses().find((x) => x.ref === refId);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  if (!r) {
    return (
      <Modal open title={`Void expense ${refId}`} onClose={onClose} width={560}>
        <div className="type-body text-text-muted">{refId} is not in the list.</div>
      </Modal>
    );
  }
  const paid = r.status === "Paid";
  const warn = "The expense moves to Voided and can't be brought back." + (paid ? ` KES ${fmt(r.amount)} goes back into ${r.account}.` : "");
  const blocked = !reason.trim();
  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const res = await voidExpense(refId, reason);
    setBusy(false);
    if (res.ok) onClose();
    else toast(res.message);
  };
  return (
    <Modal
      open
      title={`Void expense ${r.ref}`}
      subtitle="Say why this expense is being voided."
      onClose={onClose}
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" disabled={blocked || busy} onClick={save}>
            Void expense
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 rounded-md border border-warning bg-warning-soft px-4 py-3 text-warning-text">
          <Icon name="info" size={18} />
          <div>
            <div className="type-label">This can&apos;t be undone</div>
            <div className="type-small mt-0.5">{warn}</div>
          </div>
        </div>
        <div className="type-body flex justify-between text-text-secondary">
          <span>{r.category + (r.payee !== "—" ? ` · ${r.payee}` : "")}</span>
          <span className="type-label u-num text-text">KES {fmt(r.amount)}</span>
        </div>
        <TextArea id="ev-reason" label="Reason for voiding" rows={3} placeholder="For example, recorded twice or wrong amount" value={reason} onChange={setReason} />
      </div>
    </Modal>
  );
}
