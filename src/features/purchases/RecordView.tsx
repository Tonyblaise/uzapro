"use client";
/**
 * The design's shared record view (`isCnView` with `cv`) for the purchase return (`prtView`) and
 * the rejected item (`rejView`). Opened by `?view=<PRT>` / `?view=<REJ>`.
 */
import type { ReactNode } from "react";
import {
  SUPPLIER_CREDITS,
  approvePurchaseReturn,
  downloadPurchasePdf,
  markRejected,
  printPurchaseRecord,
  toast,
  useGoodsReceipts,
  useProducts,
  usePurchaseReturn,
  useRejectedItem,
} from "@/data";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { Chip, Eyebrow, Panel, PurchaseDrawer, Row, docDate, money, splitKey } from "./shared";

export type PurchaseRecordKind = "return" | "rejected";

interface Line {
  name: string;
  sub: string;
  qty: string;
  price: string;
  disc: string;
  tax: string;
  total: string;
}
interface Step {
  done: boolean;
  title: string;
  sub: string;
}
interface Action {
  label: string;
  icon: IconName;
  variant: ButtonVariant;
  run: () => void;
}
interface CV {
  kindLabel: string;
  itemsTitle: string;
  itemsSub: string;
  totalLabel: string;
  infoA: string;
  infoB: string;
  costLabel: string;
  effectsTitle: string;
  ref: string;
  cust: string;
  status: string;
  tone: string;
  date: string;
  source: { label: string; open: () => void };
  canApprove: boolean;
  approve: () => void;
  actions: Action[];
  steps: Step[];
  count: string;
  lines: Line[];
  total: string;
  subtotal: string;
  vat: string;
  cost: string;
  reason: string;
  notes: string;
  effects: { icon: IconName; title: string; text: string }[];
}

const GRID = { gridTemplateColumns: "minmax(0,2fr) 60px 120px 90px 90px 130px" };
const count = (lines: number, units: number) => `${lines}${lines === 1 ? " line, " : " lines, "}${units}${units === 1 ? " unit" : " units"}`;
const step = (done: boolean, title: string, sub: string): Step => ({ done, title, sub });

export function PurchaseRecordView({ kind, refId, onClose, onOpenReceipt }: { kind: PurchaseRecordKind; refId: string; onClose: () => void; onOpenReceipt: (grn: string) => void }) {
  const ret = usePurchaseReturn(kind === "return" ? refId : null);
  const rej = useRejectedItem(kind === "rejected" ? refId : null);
  const receipts = useGoodsReceipts();
  const products = useProducts();

  /** Variant cost from the catalog (design `UZ_VARIANTS[prod]` cost, else the first variant). */
  const costOf = (key: string) => {
    const { name, variant } = splitKey(key);
    const vs = products.find((p) => p.name === name)?.variants ?? [];
    return (vs.find((v) => v.name === variant) ?? vs[0])?.cost ?? 0;
  };
  const source = (grn: string) => ({
    label: `Goods receipt ${grn}`,
    open: () => (receipts.some((g) => g.ref === grn) ? onOpenReceipt(grn) : toast(`${grn} is not in the list.`)),
  });

  let cv: CV | null = null;

  if (kind === "return" && ret) {
    const approved = ret.status.label === "Approved";
    let L = ret.lines.map((l) => {
      const s = splitKey(l.key);
      return { name: s.name, sub: [s.variant, l.unit].filter(Boolean).join(" · "), q: l.qty, pr: costOf(l.key) };
    });
    if (!L.length) L = [{ name: `Items returned on ${ret.grn}`, sub: "", q: ret.qty || 1, pr: ret.qty ? ret.value / ret.qty : ret.value }];
    if (ret.value && !L.reduce((a, x) => a + x.q * x.pr, 0)) {
      const u = L.reduce((a, x) => a + x.q, 0) || 1;
      L = L.map((x) => ({ ...x, pr: ret.value / u }));
    }
    const sum = L.reduce((a, x) => a + x.q * x.pr, 0);
    const tot = ret.value || sum;
    const units = L.reduce((a, x) => a + x.q, 0);
    const store = ret.lines.length ? ret.store : "Main Store";
    const credit = SUPPLIER_CREDITS.find((c) => c.text.includes(ret.ref));
    cv = {
      kindLabel: "Purchase return",
      itemsTitle: "Returned items",
      itemsSub: `Items sent back to ${ret.supplier} from ${ret.grn}.`,
      totalLabel: "Value returned",
      infoA: "Reason",
      infoB: "Purchase order",
      costLabel: "Goods receipt",
      effectsTitle: "What it does",
      ref: ret.ref,
      cust: ret.supplier,
      status: ret.status.label,
      tone: ret.status.tone,
      date: ret.date || "10 Nov 2026",
      source: source(ret.grn),
      canApprove: !approved,
      approve: () => void approvePurchaseReturn(ret.ref, "view"),
      actions: [],
      steps: [
        step(true, "Raised", ret.date || "Recorded"),
        step(approved, "Approved", approved ? ret.approvedAt || "Done" : "Waiting for approval"),
        step(approved, "Stock updated", approved ? `${units} unit(s) taken out of ${store}` : "Moves once approved"),
      ],
      count: count(L.length, units),
      lines: L.map((x) => ({ name: x.name, sub: x.sub, qty: String(x.q), price: money(x.pr), disc: "—", tax: "—", total: money(x.q * x.pr) })),
      total: money(tot),
      subtotal: money(tot),
      vat: money(0),
      cost: ret.grn,
      reason: ret.reason || "—",
      notes: ret.po || "—",
      effects: [
        { icon: "boxes", title: approved ? "Stock taken out" : "Takes stock out", text: `${units} unit(s) leave ${store}${approved ? "." : " once approved."}` },
        credit
          ? { icon: "banknote", title: `Supplier credit ${credit.ref}`, text: `${money(credit.amount)} credit from ${ret.supplier}.` }
          : { icon: "banknote", title: `Supplier owes you ${money(tot)}`, text: "Record it as a supplier credit in Payables, or take it off what you owe." },
      ],
    };
  }

  if (kind === "rejected" && rej) {
    const q = rej.qty;
    const s = splitKey(rej.item);
    const cost = costOf(rej.item);
    const st = rej.status.label;
    const done = st !== "Waiting";
    const grn = receipts.find((g) => g.ref === rej.grn);
    const mark = (outcome: "Sent back" | "Replaced" | "Written off") => () => void markRejected(rej.ref, outcome);
    const outcomeText: Record<string, string> = { "Sent back": "Returned to the supplier", Replaced: "Supplier sent a replacement", "Written off": "Not coming back" };
    const value = cost ? money(cost * q) : "—";
    cv = {
      kindLabel: "Rejected item",
      itemsTitle: "Rejected on delivery",
      itemsSub: `Delivered by ${rej.supplier} but not accepted into stock.`,
      totalLabel: "Value rejected",
      infoA: "Reason",
      infoB: "Purchase order",
      costLabel: "Goods receipt",
      effectsTitle: "What it means",
      ref: rej.ref,
      cust: rej.supplier,
      status: st,
      tone: rej.status.tone,
      date: grn?.session ? docDate(grn.date || "2026-11-10") : "On delivery",
      source: source(rej.grn),
      canApprove: false,
      approve: () => {},
      actions: done
        ? []
        : [
            { label: "Mark sent back", icon: "truck", variant: "secondary", run: mark("Sent back") },
            { label: "Mark replaced", icon: "refresh-cw", variant: "soft", run: mark("Replaced") },
            { label: "Write off", icon: "x", variant: "danger", run: mark("Written off") },
          ],
      steps: [
        step(true, "Delivered", rej.grn),
        step(true, "Rejected", rej.reason),
        step(done, done ? st : "Next step", done ? (outcomeText[st] ?? st) : "Send back, replace or write off"),
      ],
      count: `1 line, ${q}${q === 1 ? " unit" : " units"}`,
      lines: [{ name: s.name, sub: s.variant, qty: String(q), price: cost ? money(cost) : "—", disc: "—", tax: "—", total: value }],
      total: value,
      subtotal: value,
      vat: money(0),
      cost: rej.grn,
      reason: rej.reason || "—",
      notes: grn ? grn.po : "—",
      effects: [
        { icon: "boxes", title: "Not added to stock", text: `${q} unit(s) were kept out of stock when the goods arrived.` },
        { icon: "banknote", title: "Not paid for", text: `The payable for ${rej.grn} only counts what was accepted.` },
      ],
    };
  }

  const title = (kind === "return" ? "Purchase return " : "Rejected item ") + refId;
  if (!cv) {
    return (
      <PurchaseDrawer title={title} onClose={onClose}>
        <div className="type-body text-text-muted">{refId} is not in the list.</div>
      </PurchaseDrawer>
    );
  }
  const c = cv;
  return (
    <PurchaseDrawer title={title} onClose={onClose}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
        <Panel flush>
          <div className="flex flex-wrap items-center gap-4 px-5 py-4">
            <span className="grid size-12 flex-none place-items-center rounded-md bg-green-50 text-green-700">
              <Icon name="file-text" size={22} />
            </span>
            <div className="min-w-[240px] flex-1">
              <Eyebrow>{c.kindLabel}</Eyebrow>
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-card-title u-num text-text">{c.ref}</span>
                <StatusPill tone={c.tone}>{c.status}</StatusPill>
              </div>
              <div className="type-small mt-0.5 flex flex-wrap items-center gap-3 text-text-secondary">
                <span>{c.date}</span>
                <button type="button" onClick={c.source.open} className="type-label cursor-pointer border-0 bg-transparent p-0 text-green-700">
                  {c.source.label}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.actions.map((a) => (
                <Button key={a.label} variant={a.variant} icon={a.icon} onClick={a.run}>
                  {a.label}
                </Button>
              ))}
              {c.canApprove && (
                <Button icon="check" onClick={c.approve}>
                  Approve
                </Button>
              )}
              <Button variant="secondary" icon="file-text" onClick={() => printPurchaseRecord(c.ref)}>
                Print
              </Button>
              <Button variant="secondary" icon="download" onClick={() => downloadPurchasePdf(c.ref)}>
                PDF
              </Button>
            </div>
          </div>
          <div className="grid border-t border-border bg-canvas" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            {c.steps.map((s) => (
              <div key={s.title} className="flex items-center gap-3 border-r border-border px-5 py-3">
                <span className={`grid size-7 flex-none place-items-center rounded-full font-bold ${s.done ? "bg-green-100 text-green-700" : "bg-canvas text-text-muted"}`}>{s.done ? "✓" : "…"}</span>
                <span>
                  <span className="type-label block text-text">{s.title}</span>
                  <span className="type-caption block text-text-muted">{s.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[2_1_600px] flex-col gap-4">
            <Panel flush>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h3 className="type-title m-0 text-text">{c.itemsTitle}</h3>
                  <div className="type-small text-text-secondary">{c.itemsSub}</div>
                </div>
                <Chip>{c.count}</Chip>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[720px]" role="table" aria-label={c.itemsTitle}>
                  <div role="row" className="type-eyebrow grid gap-3 bg-canvas px-5 py-2 text-text-muted" style={GRID}>
                    <span role="columnheader">Product</span>
                    <span role="columnheader" className="text-right">
                      Qty
                    </span>
                    <span role="columnheader" className="text-right">
                      Unit price
                    </span>
                    <span role="columnheader" className="text-right">
                      Discount
                    </span>
                    <span role="columnheader" className="text-right">
                      Tax
                    </span>
                    <span role="columnheader" className="text-right">
                      Line total
                    </span>
                  </div>
                  {c.lines.map((l, i) => (
                    <div role="row" key={i} className="type-body grid items-center gap-3 border-t border-border px-5 py-3 text-text" style={GRID}>
                      <span role="cell" className="min-w-0">
                        <span className="block font-semibold">{l.name}</span>
                        <span className="type-caption flex gap-2 text-text-muted">{l.sub}</span>
                      </span>
                      <Cell>{l.qty}</Cell>
                      <Cell muted>{l.price}</Cell>
                      <Cell muted>{l.disc}</Cell>
                      <Cell muted>{l.tax}</Cell>
                      <span role="cell" className="u-num text-right font-semibold">
                        {l.total}
                      </span>
                    </div>
                  ))}
                  <div className="type-label flex justify-between border-t border-border bg-canvas px-5 py-3 text-text">
                    <span>{c.totalLabel}</span>
                    <span className="u-num text-green-700">{c.total}</span>
                  </div>
                </div>
              </div>
            </Panel>
            <Panel>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                <div>
                  <Eyebrow>{c.infoA}</Eyebrow>
                  <div className="type-title mt-1 text-text">{c.reason}</div>
                </div>
                <div>
                  <Eyebrow>{c.infoB}</Eyebrow>
                  <div className="type-body mt-1 text-text">{c.notes}</div>
                </div>
              </div>
            </Panel>
          </div>
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
            <Panel className="flex flex-col gap-3">
              <div>
                <Eyebrow>{c.totalLabel}</Eyebrow>
                <div className="u-num mt-1 text-[32px] font-bold leading-[1.25] text-green-700">{c.total}</div>
                <div className="type-small text-text-secondary">to {c.cust}</div>
              </div>
              <div className="flex flex-col gap-2 border-t border-border pt-3">
                <Row label="Subtotal" value={c.subtotal} />
                <Row label="VAT" value={c.vat} />
                <Row label={c.costLabel} value={c.cost} />
              </div>
            </Panel>
            <Panel className="flex flex-col gap-3">
              <h3 className="type-title m-0 text-text">{c.effectsTitle}</h3>
              {c.effects.map((e) => (
                <div key={e.title} className="flex gap-3">
                  <span className="mt-0.5 flex-none text-green-700">
                    <Icon name={e.icon} size={16} />
                  </span>
                  <span>
                    <span className="type-label block text-text">{e.title}</span>
                    <span className="type-small block text-text-secondary">{e.text}</span>
                  </span>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      </div>
    </PurchaseDrawer>
  );
}

function Cell({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <span role="cell" className={`u-num text-right ${muted ? "text-text-secondary" : ""}`}>
      {children}
    </span>
  );
}
