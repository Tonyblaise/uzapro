"use client";
/** Edit role › Approvals (feature 018): what the role may approve, and its largest discount. */
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Field";
import { APPROVAL_KEYS, APPROVAL_LABEL, type ApprovalKey, type RoleApprovals } from "@/data";

const HINT: Record<ApprovalKey, string> = {
  credit: "A sale, invoice or order for a customer who is over their limit, overdue or on cash terms.",
  counts: "Approving a count corrects stock. Also sending a count back or cancelling it.",
  dispatch: "Send goods against a sales order and mark a delivery note delivered. Needs Read on Sales to reach the order.",
};

export function ApprovalsSection({
  approvals,
  discount,
  locked,
  error,
  onToggle,
  onDiscount,
}: {
  approvals: RoleApprovals;
  /** The discount limit as typed. */
  discount: string;
  locked: boolean;
  error?: string;
  onToggle: (k: ApprovalKey) => void;
  onDiscount: (v: string) => void;
}) {
  return (
    <section aria-label="Approvals" className="mt-4">
      <h4 className="type-eyebrow m-0 uppercase text-text-muted">Approvals</h4>
      {APPROVAL_KEYS.map((k) => {
        const on = approvals[k];
        return (
          <div key={k} className="flex flex-col gap-2 border-b border-border py-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="type-label text-text">{APPROVAL_LABEL[k]}</div>
              <div className="type-caption text-text-muted">{HINT[k]}</div>
            </div>
            <button
              type="button"
              aria-pressed={on}
              aria-label={`${APPROVAL_LABEL[k]}: ${on ? "Allowed" : "Not allowed"}`}
              disabled={locked}
              onClick={() => onToggle(k)}
              className={`type-label inline-flex h-10 flex-none items-center justify-center gap-1.5 rounded-md bg-surface px-3 sm:min-w-[104px] ${
                on ? "border-2 border-action text-action" : "border border-border-strong text-text hover:enabled:bg-surface-hover"
              } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {on && <Icon name="check" size={16} />}
              {on ? "Allowed" : "Not allowed"}
            </button>
          </div>
        );
      })}
      <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="type-label text-text">Largest discount</div>
          <div className="type-caption text-text-muted">On a till sale, a quotation or an invoice, as a percentage of the amount before the discount.</div>
        </div>
        <div className="w-full flex-none sm:w-[150px]">
          <Input label="Discount up to (%)" type="number" min="0" max="100" step="1" disabled={locked} value={discount} error={error} onChange={(e) => onDiscount(e.target.value)} />
        </div>
      </div>
    </section>
  );
}
