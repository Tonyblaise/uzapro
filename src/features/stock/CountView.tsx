"use client";
/**
 * A stock count (design `sc.open`), full screen, `?view=SC-…`: progress and KPIs, search and
 * filters, one line per product with − / + counters and a note (saved as you go), history, and the
 * next step: Save and close / Submit for approval while counting; Send back to recount / Approve and
 * update stock while waiting approval; Cancel count. Approving, sending back and cancelling need
 * the "Approve stock counts" right; counting needs Write on Stock.
 */
import { useState } from "react";
import {
  approveCount,
  cancelCount,
  countVariance,
  hidesSystem,
  saveCount,
  sendBackCount,
  setCountNote,
  setCounted,
  signedKes,
  submitCount,
  toggleBlind,
  useCan,
  useCount,
  useMyApprovals,
  useProductCost,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { Drawer } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { date as fmtDate } from "@/lib/format";

type Filter = "all" | "todo" | "diff";

function Kpi({ label, value, note, tone = "text-text" }: { label: string; value: string; note: string; tone?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-border bg-surface p-4">
      <div className="type-eyebrow text-text-muted">{label}</div>
      <div className={`type-title u-num ${tone}`}>{value}</div>
      <div className="type-small text-text-muted">{note}</div>
    </div>
  );
}

const valueTone = (n: number) => (n < 0 ? "text-danger-text" : n > 0 ? "text-info-text" : "text-green-700");

export function CountView({ refId, onClose }: { refId: string; onClose: () => void }) {
  const count = useCount(refId);
  const cost = useProductCost();
  const canWrite = useCan("write", "inv");
  // Feature 018: approving, sending back and cancelling need their own right.
  const canApprove = useMyApprovals().counts;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  if (!count) {
    return (
      <Drawer open title={refId} subtitle="Stock" onClose={onClose} width={760}>
        <div className="type-body text-text-muted">{refId} is not in the list any more.</div>
      </Drawer>
    );
  }
  const t = count.totals;
  const counting = count.status === "Counting";
  const editable = counting && canWrite;
  const showSystem = !hidesSystem(count);
  const left = t.lines - t.counted;
  const pct = t.lines ? (t.counted / t.lines) * 100 : 0;
  const active: Filter = !showSystem && filter === "diff" ? "all" : filter;
  const needle = q.trim().toLowerCase();
  const rows = count.lines.filter((l) => {
    if (needle && !`${l.product} ${l.variants.join(" ")} ${l.category}`.toLowerCase().includes(needle)) return false;
    const v = countVariance(l);
    return active === "all" || (active === "todo" ? l.counted === null : v !== null && v !== 0);
  });
  const set = (product: string, n: number | null) => void setCounted(count.ref, product, n);
  const submit = async () => {
    const r = await submitCount(count.ref);
    if (!r.ok && left) setFilter("todo");
    if (r.ok) setFilter(t.diffs ? "diff" : "all");
  };
  const foot = counting
    ? left === 0
      ? "Everything is counted. Submit it for approval."
      : `${left} ${left === 1 ? "line" : "lines"} left to count. Your counts save as you go.`
    : count.status === "Waiting approval"
      ? "Check the differences, then approve to update stock, or send it back."
      : count.status === "Approved"
        ? `Stock was updated on ${count.approvedAt ?? ""} by ${count.approvedBy ?? ""}.`
        : "This count was cancelled.";
  const filters: [Filter, string, number][] = [
    ["all", "All", t.lines],
    ["todo", "Not counted", left],
    ...(showSystem ? ([["diff", "Differences", t.diffs]] as [Filter, string, number][]) : []),
  ];

  return (
    <Drawer
      open
      title={`Stock count ${count.ref}`}
      subtitle={`${count.store} · ${count.scope} · counted by ${count.by} · started ${fmtDate(count.date)}`}
      onClose={onClose}
      width={9999}
      footer={
        <div className="flex w-full flex-wrap items-center gap-3">
          <span className={`type-small mr-auto ${counting && left ? "text-warning-text" : "text-text-secondary"}`}>{foot}</span>
          {editable && (
            <>
              <Button variant="secondary" onClick={() => void saveCount(count.ref).then(onClose)}>
                Save and close
              </Button>
              <Button icon="send" onClick={() => void submit()}>
                Submit for approval
              </Button>
            </>
          )}
          {count.status === "Waiting approval" && canApprove && (
            <>
              <Button variant="secondary" icon="refresh-cw" onClick={() => void sendBackCount(count.ref).then((r) => r.ok && setFilter("todo"))}>
                Send back to recount
              </Button>
              <Button icon="check" onClick={() => void approveCount(count.ref)}>
                Approve and update stock
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill tone={count.pill.tone}>{count.status}</StatusPill>
          {(counting || count.status === "Waiting approval") && canApprove && (
            <Button variant="secondary" size="sm" onClick={() => void cancelCount(count.ref)} className="ml-auto">
              Cancel count
            </Button>
          )}
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))" }}>
          <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-border bg-surface p-4">
            <div className="type-eyebrow text-text-muted">Counted</div>
            <div className="type-title u-num text-text">
              {t.counted} <span className="type-body text-text-muted">of {t.lines}</span>
            </div>
            <div role="progressbar" aria-label="Counted" aria-valuemin={0} aria-valuemax={t.lines} aria-valuenow={t.counted} className="mt-1 h-1.5 overflow-hidden rounded-pill bg-grey-100">
              <div className={`h-full rounded-pill ${left ? "bg-warning" : "bg-green-600"}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
          {showSystem ? (
            <>
              <Kpi label="Short" value={String(t.shortLines)} note={signedKes(t.shortValue)} tone="text-danger-text" />
              <Kpi label="Over" value={String(t.overLines)} note={signedKes(t.overValue)} tone="text-info-text" />
              <Kpi label="Net difference" value={signedKes(t.value)} note="At cost price" tone={valueTone(t.value)} />
            </>
          ) : (
            <>
              <Kpi label="Blind count" value="On" note="Differences show after you submit" />
              <Kpi label="Left to count" value={String(left)} note="lines" tone="text-warning-text" />
              <Kpi label="Counted by" value={count.by} note={count.store} />
            </>
          )}
        </div>

        <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="min-w-[200px] flex-[1_1_240px]">
              <Input icon="search" placeholder="Search products" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
              {filters.map(([k, label, n]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={active === k}
                  onClick={() => setFilter(k)}
                  className={`type-small inline-flex h-[32px] items-center gap-1.5 rounded-pill border px-3 font-semibold ${active === k ? "border-green-700 bg-green-700 text-white" : "border-border bg-surface text-text"}`}
                >
                  {label} <span className="u-num opacity-80">{n}</span>
                </button>
              ))}
            </div>
            {editable && (
              <label className="type-small ml-auto flex items-center gap-2 text-text">
                <input type="checkbox" role="switch" aria-checked={count.blind} checked={count.blind} onChange={() => void toggleBlind(count.ref)} className="uz-switch" />
                Blind count
              </label>
            )}
          </div>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Count lines">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="type-table-head text-text-muted">
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-right">System qty</th>
                  <th className="px-4 py-2 text-center">Counted</th>
                  <th className="px-4 py-2 text-right">Difference</th>
                  <th className="px-4 py-2 text-right">Value</th>
                  <th className="px-4 py-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const v = countVariance(l);
                  const vis = showSystem && v !== null;
                  const variants = l.variants.filter((x) => x !== "Standard");
                  return (
                    <tr key={l.product} className={`type-body border-t border-border ${vis && v !== 0 ? (v! < 0 ? "bg-danger-soft/40" : "bg-info-soft/40") : ""}`}>
                      <td className="px-4 py-2.5">
                        <div className="text-text">{l.product}</div>
                        <div className="type-small text-text-muted">{[variants.join(", "), l.category].filter(Boolean).join(" · ")}</div>
                      </td>
                      <td className={`u-num px-4 py-2.5 text-right ${showSystem ? "text-text" : "text-text-muted"}`}>{showSystem ? l.system : "Hidden"}</td>
                      <td className="px-4 py-2.5">
                        {editable ? (
                          <span className="flex items-center justify-center gap-1">
                            <IconButton icon="minus" size="sm" variant="secondary" label={`Less ${l.product}`} onClick={() => set(l.product, l.counted === null ? 0 : Math.max(0, l.counted - 1))} />
                            <input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              aria-label={`Counted quantity for ${l.product}`}
                              placeholder="—"
                              value={l.counted ?? ""}
                              onChange={(e) => set(l.product, e.target.value === "" ? null : Number(e.target.value))}
                              className={`type-body u-num h-8 w-16 rounded-sm border bg-surface text-center text-text ${l.counted === null ? "border-border-strong" : "border-green-600"}`}
                            />
                            <IconButton icon="plus" size="sm" variant="secondary" label={`More ${l.product}`} onClick={() => set(l.product, l.counted === null ? 1 : l.counted + 1)} />
                          </span>
                        ) : (
                          <span className="u-num block text-center text-text">{l.counted ?? "—"}</span>
                        )}
                      </td>
                      <td className={`u-num px-4 py-2.5 text-right ${!vis ? "text-text-muted" : v === 0 ? "text-green-700" : v! < 0 ? "text-danger-text" : "text-info-text"}`}>
                        {!vis ? "—" : v === 0 ? "Matches" : `${v! > 0 ? "+" : "−"}${Math.abs(v!)}`}
                      </td>
                      <td className="u-num px-4 py-2.5 text-right text-text-secondary">{!vis || v === 0 ? "—" : signedKes(v! * cost(l.product))}</td>
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          aria-label={`Note for ${l.product}`}
                          placeholder="Note"
                          disabled={!editable}
                          value={l.note}
                          onChange={(e) => void setCountNote(count.ref, l.product, e.target.value)}
                          className="type-small h-8 w-full min-w-[140px] rounded-sm border border-border bg-surface px-2 text-text disabled:border-transparent disabled:bg-transparent"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && <div className="type-body p-6 text-center text-text-muted">Nothing matches.</div>}
        </section>

        {count.history.length > 0 && (
          <section className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-5">
            <div className="type-title text-text">History</div>
            {count.history
              .slice()
              .reverse()
              .map((h, i) => (
                <div key={i} className="type-body text-text">
                  {h.what}{" "}
                  <span className="type-small text-text-muted">
                    · {h.when} · {h.who}
                  </span>
                </div>
              ))}
          </section>
        )}
      </div>
    </Drawer>
  );
}
