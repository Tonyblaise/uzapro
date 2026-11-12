"use client";
/**
 * Record expenses (design `isExpForm` with `ex.cards`): one card per expense, each one-off or
 * recurring and, for one-off expenses, paid now or added to Payables as a bill. Cards carry the
 * design's notes and warnings; "+ Add another expense" copies the last card's account, method,
 * date and branch; the summary bar shows the totals and "Save {n} expense(s)".
 * Opens with `?action=new` on Overview and Expenses (contracts/routes.md).
 */
import { useState } from "react";
import {
  RECURRING_FREQS,
  UZ_PAYMETHODS,
  quickAddCategory,
  recordExpenses,
  toast,
  useActiveAccountNames,
  useBranchNames,
  useExpenseCategoryList,
  type NewExpenseRow,
  type RecurringFreq,
} from "@/data";
import { addDays, DEMO_TODAY } from "@/lib/demo-clock";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { CRUMB, CheckRow, Grid, Segmented, TextArea, n } from "./shared";

/** One card, as the design's `expBlank()` holds it (inputs as strings). */
interface Row {
  id: number;
  kind: "one" | "rec";
  later: boolean;
  due: string;
  fee: string;
  name: string;
  cat: string;
  acc: string;
  branch: string;
  gross: string;
  tax: string;
  method: string;
  date: string;
  freq: RecurringFreq;
  interval: string;
  end: string;
  auto: boolean;
  payee: string;
  ref: string;
  reason: string;
}

let nextId = 1;
const blank = (): Row => ({
  id: nextId++,
  kind: "one",
  later: false,
  due: "",
  fee: "0",
  name: "",
  cat: "",
  acc: "",
  branch: "",
  gross: "",
  tax: "0",
  method: "Cash",
  date: DEMO_TODAY,
  freq: "Monthly",
  interval: "1",
  end: "",
  auto: false,
  payee: "",
  ref: "",
  reason: "",
});

/** The design's `okRow`. */
const okRow = (r: Row) =>
  !!r.cat && (!!r.acc || (r.kind === "one" && r.later)) && n(r.gross) > 0 && !!r.date && (r.kind === "one" ? !r.later || (!!r.payee.trim() && r.due >= r.date) : !!r.name.trim() && n(r.interval) >= 1);

const toInput = (r: Row): NewExpenseRow => ({
  kind: r.kind,
  later: r.kind === "one" && r.later,
  due: r.due,
  fee: n(r.fee),
  name: r.name,
  category: r.cat,
  account: r.acc,
  branch: r.branch,
  amount: n(r.gross),
  tax: n(r.tax),
  method: r.method,
  date: r.date,
  freq: r.freq,
  interval: n(r.interval),
  end: r.end,
  auto: r.auto,
  payee: r.payee,
  payRef: r.ref,
  reason: r.reason,
});

const grouped = (x: number) => x.toLocaleString("en-US");

export function ExpenseForm({ onClose }: { onClose: () => void }) {
  const cats = useExpenseCategoryList();
  const accounts = useActiveAccountNames();
  const branches = useBranchNames();
  const [rows, setRows] = useState<Row[]>(() => [blank()]);
  const [busy, setBusy] = useState(false);

  const activeCats = cats.filter((c) => c.active).map((c) => c.name);
  const setR = (id: number, patch: Partial<Row>) => setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const ones = rows.filter((r) => r.kind === "one");
  const recs = rows.filter((r) => r.kind === "rec");
  const total = ones.reduce((a, r) => a + n(r.gross), 0);
  const fees = ones.reduce((a, r) => a + n(r.fee), 0);
  const summary =
    (ones.length ? `${ones.length} one-off ${ones.length === 1 ? "expense" : "expenses"} · KES ${grouped(total)}${fees ? ` + KES ${grouped(fees)} transaction costs` : ""}` : "") +
    (ones.length && recs.length ? " · " : "") +
    (recs.length ? `${recs.length} recurring ${recs.length === 1 ? "schedule" : "schedules"}` : "");
  const blocked = !rows.every(okRow) || rows.some((r) => n(r.tax) > n(r.gross));

  const add = () =>
    setRows((list) => {
      const last = list[list.length - 1];
      return [...list, { ...blank(), acc: last?.acc ?? "", method: last?.method || "Cash", date: last?.date || DEMO_TODAY, branch: last?.branch ?? "" }];
    });

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const res = await recordExpenses(rows.map(toInput));
    setBusy(false);
    if (res.ok) onClose();
    else toast(res.message);
  };

  return (
    <Drawer open title="Record expenses" subtitle={CRUMB} onClose={onClose} width={9999}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
        <div className="type-body text-text-secondary">Record one-off or repeat expenses. Add as many as you need, then save them together.</div>
        {rows.map((r, i) => {
          const c = cats.find((x) => x.name === r.cat);
          const isRec = r.kind === "rec";
          const later = r.kind === "one" && r.later;
          const taxOver = n(r.tax) > n(r.gross) && n(r.gross) > 0;
          const hasNote = (r.kind === "one" && (!!c?.approval || r.later)) || taxOver;
          const note = taxOver
            ? "Tax is more than the gross amount. Check the figures."
            : r.later
              ? `This goes to Payables as a bill${c?.approval ? " waiting for approval" : ""}. Pay it from there when it is due.`
              : `${r.cat} expenses wait for approval before they are paid.`;
          const on = (k: keyof Row) => (v: string) => setR(r.id, { [k]: v } as Partial<Row>);
          const ev = (k: keyof Row) => (e: React.ChangeEvent<HTMLInputElement>) => setR(r.id, { [k]: e.target.value } as Partial<Row>);
          return (
            <section key={r.id} aria-label={`Expense ${i + 1}`} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex flex-wrap items-center gap-3 border-b border-border bg-canvas px-5 py-3">
                <span className="type-caption grid size-[26px] place-items-center rounded-full bg-green-100 font-semibold text-green-800">{i + 1}</span>
                <Segmented
                  label="Expense type"
                  value={r.kind}
                  onChange={(kind) => setR(r.id, { kind })}
                  options={[
                    { value: "one", label: "One-off" },
                    { value: "rec", label: "Recurring" },
                  ]}
                />
                {!isRec && (
                  <Segmented
                    label="When to pay"
                    value={r.later ? "later" : "now"}
                    onChange={(v) => setR(r.id, v === "later" ? { later: true, due: r.due || addDays(r.date || DEMO_TODAY, 30) } : { later: false })}
                    options={[
                      { value: "now", label: "Pay now" },
                      { value: "later", label: "Pay later" },
                    ]}
                  />
                )}
                <span className="flex-1" />
                {rows.length > 1 && <IconButton icon="trash-2" size="sm" label="Remove this expense" onClick={() => setRows((list) => list.filter((x) => x.id !== r.id))} />}
              </div>
              <div className="flex flex-col gap-4 p-5">
                {isRec && <Input label="Recurring expense name" placeholder="For example, Monthly shop rent" value={r.name} onChange={ev("name")} />}
                <Grid min={220}>
                  <SearchSelect
                    label="Category"
                    options={activeCats}
                    value={r.cat}
                    onChange={on("cat")}
                    noun="category"
                    onCreate={(name) => {
                      void quickAddCategory(name);
                      return name;
                    }}
                  />
                  <SearchSelect label={later ? "Pay from (optional)" : "Payment account"} options={accounts} value={r.acc} onChange={on("acc")} />
                </Grid>
                <SearchSelect label="Branch (optional)" options={branches} value={r.branch} onChange={on("branch")} />
                <Grid min={180}>
                  <Input label="Amount (KES)" type="number" placeholder="0.00" min="0" value={r.gross} onChange={ev("gross")} />
                  <Input label="Tax amount (KES)" type="number" placeholder="0" min="0" value={r.tax} onChange={ev("tax")} />
                  <Input label="Transaction cost (KES)" type="number" placeholder="0" min="0" value={r.fee} onChange={ev("fee")} />
                  <SearchSelect label="Payment method" options={UZ_PAYMETHODS} value={r.method} onChange={on("method")} />
                </Grid>
                <Grid min={180}>
                  <Input label={isRec ? "Start date" : "Expense date"} type="date" value={r.date} onChange={ev("date")} />
                  {later && <Input label="Due date" type="date" value={r.due} onChange={ev("due")} />}
                  {isRec && <SearchSelect label="Repeats" options={RECURRING_FREQS} value={r.freq} onChange={(v) => setR(r.id, { freq: v as RecurringFreq })} />}
                  {isRec && <Input label="Every how many?" type="number" placeholder="1" min="1" value={r.interval} onChange={ev("interval")} />}
                </Grid>
                {isRec && (
                  <Grid min={180}>
                    <Input label="End date (optional)" type="date" value={r.end} onChange={ev("end")} />
                    <div className="self-end pb-2">
                      <CheckRow checked={r.auto} onChange={(auto) => setR(r.id, { auto })} title="Auto-approve" note="Skip approval for expenses this creates" />
                    </div>
                  </Grid>
                )}
                <Grid min={220}>
                  <Input label={later ? "Supplier or payee (required)" : "Payee name"} placeholder="For example, ABC Suppliers Ltd" value={r.payee} onChange={ev("payee")} />
                  <Input label="Payment reference" placeholder="Receipt or M-Pesa code" value={r.ref} onChange={ev("ref")} />
                </Grid>
                <TextArea id={`ex-reason-${r.id}`} label="Expense reason" rows={2} placeholder="Brief description of the expense" value={r.reason} onChange={on("reason")} />
                {hasNote && <div className="type-small text-warning-text">{note}</div>}
              </div>
            </section>
          );
        })}
        <button type="button" onClick={add} className="type-label rounded-lg border-[1.5px] border-dashed border-border-strong bg-transparent p-4 text-text-secondary">
          + Add another expense
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-5 py-4">
          <div className="type-body text-text-secondary">{summary}</div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button icon="check" disabled={blocked || busy} onClick={save}>
              {`Save ${rows.length} ${rows.length === 1 ? "expense" : "expenses"}`}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
