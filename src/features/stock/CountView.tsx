"use client";
/**
 * A stock count (feature 017, `?view=CNT-…`): enter what was counted, review the variance, submit,
 * approve. Only approval changes stock.
 */
import { useState } from "react";
import { approveCount, cancelCount, countVariance, isOpenCount, saveCount, sendBackCount, signedQty, submitCount, useCan, useCount, useMyApprovals, useProductCost } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ConfirmDialog, Drawer } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { date as fmtDate, num } from "@/lib/format";
import { signedMoney } from "./CountList";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="type-eyebrow text-text-muted">{label}</div>
      <div className="type-label mt-0.5 text-text">{value}</div>
    </div>
  );
}

export function CountView({ refId, onClose }: { refId: string; onClose: () => void }) {
  const count = useCount(refId);
  const cost = useProductCost();
  const canWrite = useCan("write");
  // Feature 018: approving needs its own right (it used Delete on Stock).
  const canApprove = useMyApprovals().counts;
  /** Edits not yet saved, by product. */
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);

  if (!count) {
    return (
      <Drawer open title={refId} subtitle="Stock" onClose={onClose} width={760}>
        <div className="type-body text-text-muted">{refId} is not in the list any more.</div>
      </Drawer>
    );
  }
  const editing = count.status === "In progress" && canWrite;
  const shown = (product: string, saved: number | null) => draft[product] ?? (saved === null ? "" : String(saved));
  const parsed = (): Record<string, number | null> | null => {
    const out: Record<string, number | null> = {};
    for (const [product, text] of Object.entries(draft)) {
      const n = text.trim() === "" ? null : Number(text);
      if (n !== null && !(Number.isInteger(n) && n >= 0)) return null;
      out[product] = n;
    }
    return out;
  };
  const save = async (): Promise<boolean> => {
    const values = parsed();
    if (!values) {
      setError("Enter whole numbers of 0 or more");
      return false;
    }
    if (Object.keys(values).length === 0) return true;
    const r = await saveCount(count.ref, values);
    if (r.ok) setDraft({});
    else setError(r.message);
    return r.ok;
  };
  const submit = async () => {
    if (!(await save())) return;
    const r = await submitCount(count.ref);
    if (!r.ok) setError(r.message);
  };
  const t = count.totals;

  return (
    <>
      <Drawer open={!confirm} title={count.ref} subtitle="Stock › Stock counts" onClose={onClose} width={760}>
        <div className="flex flex-col gap-5">
          <div>
            <StatusPill tone={count.pill.tone}>{count.pill.label}</StatusPill>
          </div>
          <div className="grid gap-4 rounded-lg border border-border bg-surface p-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
            <Fact label="Store" value={count.store} />
            <Fact label="Date" value={fmtDate(count.date)} />
            <Fact label="Type" value={count.full ? "Full" : "Partial"} />
            <Fact label="Started by" value={count.by} />
            {count.approvedBy && <Fact label="Approved by" value={`${count.approvedBy}, ${count.approvedAt ?? ""}`} />}
          </div>

          <div className="overflow-x-auto" tabIndex={0} role="group" aria-label="Count lines">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {["Product", "System", "Counted", "Variance", "Value (KES)"].map((h, i) => (
                    <th key={h} scope="col" className={`type-eyebrow whitespace-nowrap p-2 text-text-muted ${i ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {count.lines.map((l) => {
                  const text = shown(l.product, l.counted);
                  const live = text.trim() === "" || Number.isNaN(Number(text)) ? null : Number(text);
                  const v = editing ? countVariance({ system: l.system, counted: live }) : countVariance(l);
                  return (
                    <tr key={l.product} className="border-b border-border">
                      <td className="type-small p-2 font-medium text-text">{l.product}</td>
                      <td className="type-small u-num p-2 text-right text-text">{num(l.system)}</td>
                      <td className="p-2 text-right">
                        {editing ? (
                          <span className="inline-block w-[96px]">
                            <Input
                              size="sm"
                              type="number"
                              min="0"
                              step="1"
                              aria-label={`Counted: ${l.product}`}
                              value={text}
                              onChange={(e) => {
                                setDraft((d) => ({ ...d, [l.product]: e.target.value }));
                                setError("");
                              }}
                            />
                          </span>
                        ) : (
                          <span className="type-small u-num text-text">{l.counted === null ? "—" : num(l.counted)}</span>
                        )}
                      </td>
                      <td className={`type-small u-num p-2 text-right font-semibold ${v === null || v === 0 ? "text-text-muted" : v > 0 ? "text-success-text" : "text-danger-text"}`}>{signedQty(v)}</td>
                      <td className="type-small u-num p-2 text-right text-text">{v === null ? "—" : signedMoney(v * cost(l.product))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 rounded-lg border border-border bg-surface p-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
            <Fact label="Lines counted" value={`${t.counted} of ${t.lines}`} />
            <Fact label="Over" value={`${num(t.over)} ${t.over === 1 ? "unit" : "units"}`} />
            <Fact label="Short" value={`${num(t.short)} ${t.short === 1 ? "unit" : "units"}`} />
            <Fact label="Net value" value={`KES ${signedMoney(t.value)}`} />
          </div>
          {count.status === "In progress" && <p className="type-small m-0 text-text-secondary">Stock does not change until the count is approved. The totals follow what has been saved.</p>}
          {error && (
            <div role="alert" className="type-small text-danger-text">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {editing && (
              <>
                <Button onClick={() => void submit()}>Submit for approval</Button>
                <Button variant="secondary" onClick={() => void save()}>
                  Save
                </Button>
              </>
            )}
            {count.status === "Waiting approval" && canApprove && (
              <>
                <Button icon="check" onClick={() => void approveCount(count.ref)}>
                  Approve
                </Button>
                <Button variant="secondary" onClick={() => void sendBackCount(count.ref)}>
                  Send back
                </Button>
              </>
            )}
            {isOpenCount(count) && canApprove && (
              <Button variant="secondary" onClick={() => setConfirm(true)}>
                Cancel count
              </Button>
            )}
          </div>
        </div>
      </Drawer>
      <ConfirmDialog
        open={confirm}
        title={`Cancel ${count.ref}?`}
        message="The count stays in the list as Cancelled. Stock does not change."
        confirmLabel="Cancel count"
        cancelLabel="Keep count"
        danger
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          void cancelCount(count.ref);
          setConfirm(false);
        }}
      />
    </>
  );
}
