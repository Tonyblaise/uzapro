"use client";
/**
 * New / edit recurring expense (design `isRecForm` with `rc`, opened by `recOpen`): Expense details,
 * "How often" with the schedule summary, "When it runs", Auto-approve and "Schedule is active".
 * Opens with `?action=new` or `?view=<REC>` on Recurring (contracts/routes.md).
 */
import { useState } from "react";
import {
  RECURRING_FREQS,
  UZ_PAYMETHODS,
  recurringBlocked,
  recurringSummary,
  saveRecurring,
  toast,
  useActiveAccountNames,
  useExpenseCategoryList,
  useRecurring,
  type NewRecurring,
  type RecurringFreq,
  type RecurringRow,
} from "@/data";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { CRUMB, CheckRow, Grid, TextArea, n } from "./shared";

interface Form {
  name: string;
  cat: string;
  acc: string;
  gross: string;
  tax: string;
  method: string;
  payee: string;
  ref: string;
  reason: string;
  notes: string;
  freq: RecurringFreq;
  interval: string;
  day: string;
  start: string;
  end: string;
  max: string;
  auto: boolean;
  active: boolean;
}

/** The design's `recOpen` defaults. */
function initial(r?: RecurringRow): Form {
  if (!r) {
    return { name: "", cat: "", acc: "", gross: "", tax: "0", method: "Bank transfer", payee: "", ref: "", reason: "", notes: "", freq: "Monthly", interval: "1", day: "", start: DEMO_TODAY, end: "", max: "", auto: false, active: true };
  }
  return {
    name: r.name,
    cat: r.category,
    acc: r.account,
    gross: String(r.amount),
    tax: String(r.tax || 0),
    method: r.method || "Cash",
    payee: r.payee,
    ref: r.payRef,
    reason: r.reason,
    notes: r.notes,
    freq: r.freq,
    interval: String(r.interval || 1),
    day: r.day,
    start: r.start || DEMO_TODAY,
    end: r.end,
    max: r.max,
    auto: r.auto,
    active: !r.paused,
  };
}

const toInput = (f: Form): NewRecurring => ({
  name: f.name,
  category: f.cat,
  account: f.acc,
  amount: n(f.gross),
  tax: n(f.tax),
  method: f.method,
  payee: f.payee,
  payRef: f.ref,
  reason: f.reason,
  notes: f.notes,
  freq: f.freq,
  interval: n(f.interval),
  day: f.day,
  start: f.start,
  end: f.end,
  max: f.max,
  auto: f.auto,
  active: f.active,
});

export function RecurringForm({ edit, onClose }: { edit?: string; onClose: () => void }) {
  const row = useRecurring().find((r) => r.ref === edit);
  if (edit && !row) {
    return (
      <Drawer open title="Edit recurring expense" subtitle={CRUMB} onClose={onClose} width={9999}>
        <div className="type-body text-text-muted">{edit} is not in the list.</div>
      </Drawer>
    );
  }
  return <Body key={edit ?? "new"} edit={edit} row={row} onClose={onClose} />;
}

function Panel({ icon, title, children }: { icon: "refresh-cw" | "calendar"; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-canvas p-4">
      <div className="type-eyebrow flex items-center gap-2 text-green-700">
        <Icon name={icon} size={14} />
        {title}
      </div>
      {children}
    </div>
  );
}

function Body({ edit, row, onClose }: { edit?: string; row?: RecurringRow; onClose: () => void }) {
  const cats = useExpenseCategoryList();
  const accounts = useActiveAccountNames();
  const [f, setF] = useState<Form>(() => initial(row));
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Form>) => setF((s) => ({ ...s, ...patch }));
  const ev = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => set({ [k]: e.target.value } as Partial<Form>);
  const input = toInput(f);
  const blocked = recurringBlocked(input);
  const activeCats = cats.filter((c) => c.active).map((c) => c.name);

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const res = await saveRecurring(input, edit ?? "");
    setBusy(false);
    if (res.ok) onClose();
    else toast(res.message);
  };

  return (
    <Drawer open title={edit ? "Edit recurring expense" : "New recurring expense"} subtitle={CRUMB} onClose={onClose} width={9999}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
        <div className="type-body text-text-secondary">Set up an expense that repeats on a schedule.</div>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-4 rounded-lg border border-border bg-surface p-5">
            <div className="type-title text-text">Expense details</div>
            <Input label="Recurring expense name" placeholder="For example, Monthly shop rent" value={f.name} onChange={ev("name")} />
            <Grid min={220}>
              <SearchSelect label="Category" options={activeCats} value={f.cat} onChange={(cat) => set({ cat })} />
              <SearchSelect label="Payment account" options={accounts} value={f.acc} onChange={(acc) => set({ acc })} />
            </Grid>
            <Grid min={220}>
              <Input label="Amount (KES)" type="number" placeholder="0.00" min="0" value={f.gross} onChange={ev("gross")} />
              <Input label="Tax amount (optional)" type="number" placeholder="0" min="0" value={f.tax} onChange={ev("tax")} />
            </Grid>
            <Grid min={220}>
              <SearchSelect label="Payment method" options={UZ_PAYMETHODS} value={f.method} onChange={(method) => set({ method })} />
              <Input label="Payee name (optional)" placeholder="For example, landlord or internet provider" value={f.payee} onChange={ev("payee")} />
            </Grid>
            <Input label="Payment reference (optional)" placeholder="For example, account number" value={f.ref} onChange={ev("ref")} />
            <TextArea id="rc-reason" label="Expense reason" rows={2} placeholder="Description for the expenses this creates" value={f.reason} onChange={(reason) => set({ reason })} />
            <TextArea id="rc-notes" label="Internal notes (optional)" rows={2} placeholder="Private notes about this schedule" value={f.notes} onChange={(notes) => set({ notes })} />
          </div>
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-4">
            <Panel icon="refresh-cw" title="How often">
              <Grid min={220}>
                <SearchSelect label="Repeats" options={RECURRING_FREQS} value={f.freq} onChange={(v) => set({ freq: v as RecurringFreq })} />
                <Input label="Every how many?" type="number" placeholder="1" min="1" value={f.interval} onChange={ev("interval")} />
              </Grid>
              {f.freq === "Monthly" && (
                <Grid min={220}>
                  <Input label="Day of the month" type="number" placeholder="1 to 31 (31 means last day)" min="1" max="31" value={f.day} onChange={ev("day")} />
                </Grid>
              )}
              <div className="type-small text-text-secondary">{recurringSummary(input)}</div>
            </Panel>
            <Panel icon="calendar" title="When it runs">
              <Grid min={220}>
                <Input label="Start date" type="date" value={f.start} onChange={ev("start")} />
                <Input label="End date (optional)" type="date" value={f.end} onChange={ev("end")} />
              </Grid>
              <Input label="Stop after this many times (optional)" type="number" placeholder="Leave empty to keep going" min="1" value={f.max} onChange={ev("max")} />
            </Panel>
            <CheckRow checked={f.auto} onChange={(auto) => set({ auto })} title="Auto-approve expenses" note="Expenses this creates are paid straight away, without waiting for approval." />
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <CheckRow checked={f.active} onChange={(active) => set({ active })} title="Schedule is active" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button icon="check" fullWidth disabled={blocked || busy} onClick={save}>
                {edit ? "Save changes" : "Create schedule"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
