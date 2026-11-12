"use client";
/** Sales › Sales targets: KPI tiles, the targets table, and the new/edit target modal (design `setOpen('target')`). */
import { useMemo, useState } from "react";
import { SALES_STAFF, TARGET_BRANCHES, deleteTarget, saveTarget, useSales, useStores, useTargets, type SalesTarget } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Field";
import { RowActions } from "@/components/ui/Menu";
import { Modal } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { docDate, useOverlay } from "./shared";

const DAY = 864e5;
const grouped = (n: number) => Math.round(n).toLocaleString("en-US");

/** The design's `tgStatus`. */
function statusOf(t: SalesTarget, got: number) {
  const pct = t.amount ? (got / t.amount) * 100 : 0;
  if (got >= t.amount) return { label: "Achieved", tone: "success" } as const;
  if (DEMO_TODAY > t.end) return { label: "Missed", tone: "danger" } as const;
  if (DEMO_TODAY < t.start) return { label: "Not started", tone: "neutral" } as const;
  const span = (Date.parse(t.end) - Date.parse(t.start)) / DAY + 1;
  const gone = (Date.parse(DEMO_TODAY) - Date.parse(t.start)) / DAY + 1;
  return pct >= (gone / span) * 100 ? ({ label: "On track", tone: "success" } as const) : ({ label: "Behind", tone: "warning" } as const);
}

/** Achieved = the design's base figure plus sales recorded in the period that match the scope (`tgAchieved`). */
function useAchieved() {
  const sales = useSales();
  const stores = useStores();
  return useMemo(() => {
    const branchOf = (store: string) => {
      const b = stores.find((s) => s.name === store)?.branch;
      return b && b !== "—" ? b : "Nairobi HQ";
    };
    return (t: SalesTarget) =>
      (t.base || 0) +
      sales
        .filter((s) => s.session && s.date >= t.start && s.date <= t.end)
        .filter((s) => t.scope === "Whole business" || (t.scope === "Staff member" && s.by === t.who) || (t.scope === "Branch" && branchOf(s.store) === t.who))
        .reduce((a, s) => a + s.total, 0);
  }, [sales, stores]);
}

interface Row {
  t: SalesTarget;
  got: number;
  pct: number;
  status: { label: string; tone: string };
}

export function NewTargetAction() {
  const { open } = useOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New target
    </Button>
  );
}

export function TargetList() {
  const targets = useTargets();
  const achieved = useAchieved();
  const { params, open, close } = useOverlay();
  const rows: Row[] = targets.map((t) => {
    const got = achieved(t);
    return { t, got, pct: t.amount ? (got / t.amount) * 100 : 0, status: statusOf(t, got) };
  });

  const cur = targets.filter((t) => t.start <= DEMO_TODAY && t.end >= DEMO_TODAY);
  const main = cur.find((t) => t.scope === "Whole business") ?? cur[0];
  const kpis = !main
    ? [{ label: "No current target", value: "—", note: "Add one to track progress", color: "text-text-muted" }]
    : (() => {
        const got = achieved(main);
        const left = Math.max(0, main.amount - got);
        const days = Math.max(1, Math.round((Date.parse(main.end) - Date.parse(DEMO_TODAY)) / DAY) + 1);
        return [
          { label: main.name, value: `KES ${grouped(got)}`, note: `of KES ${grouped(main.amount)} (${Math.round((got / main.amount) * 100)}%)`, color: "text-green-700" },
          { label: "Still to sell", value: `KES ${grouped(left)}`, note: `${days} days left`, color: "text-warning-text" },
          { label: "Needed per day", value: `KES ${grouped(left / days)}`, note: "To hit the target on time", color: "text-info-text" },
          {
            label: "Targets on track",
            value: `${cur.filter((t) => ["On track", "Achieved"].includes(statusOf(t, achieved(t)).label)).length} of ${cur.length}`,
            note: "Running this period",
            color: "text-text-secondary",
          },
        ];
      })();

  const columns: DataColumn<Row>[] = [
    {
      key: "name",
      title: "Target",
      text: (r) => r.t.name,
      render: (r) => (
        <span className="inline-flex flex-col">
          <span className="text-text">{r.t.name}</span>
          <span className="type-caption text-text-muted">#{r.t.id}</span>
        </span>
      ),
    },
    {
      key: "scope",
      title: "Applies to",
      text: (r) => (r.t.scope === "Whole business" ? "Whole business" : r.t.who),
      render: (r) =>
        r.t.scope === "Whole business" ? (
          "Whole business"
        ) : (
          <span className="inline-flex flex-col">
            <span className="text-text">{r.t.who}</span>
            <span className="type-caption text-text-muted">{r.t.scope}</span>
          </span>
        ),
    },
    { key: "period", title: "Period", text: (r) => `${docDate(r.t.start)} – ${docDate(r.t.end)}` },
    { key: "amount", title: "Target (KES)", numeric: true, text: (r) => grouped(r.t.amount) },
    { key: "got", title: "Achieved (KES)", numeric: true, text: (r) => grouped(r.got) },
    {
      key: "progress",
      title: "Progress",
      text: (r) => `${Math.round(r.pct)}%`,
      render: (r) => (
        <span className="flex min-w-[120px] items-center gap-2">
          <span role="progressbar" aria-label={`${r.t.name} progress`} aria-valuenow={Math.round(r.pct)} aria-valuemin={0} aria-valuemax={100} className="h-2 flex-1 overflow-hidden rounded-pill bg-canvas">
            <span
              className={`block h-full rounded-pill ${r.status.tone === "success" ? "bg-green-600" : r.status.tone === "danger" ? "bg-danger-text" : "bg-warning-text"}`}
              style={{ width: `${Math.min(100, r.pct)}%` }}
            />
          </span>
          <span className="type-caption min-w-[34px] text-right font-semibold text-text-secondary">{Math.round(r.pct)}%</span>
        </span>
      ),
    },
    { key: "status", title: "Status", text: (r) => r.status.label, render: (r) => <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill> },
    {
      key: "_act",
      title: "",
      numeric: true,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[
            { label: "Edit", onClick: () => open({ edit: String(r.t.id) }) },
            { label: "Delete", danger: true, onClick: () => void deleteTarget(r.t.id) },
          ]}
        />
      ),
    },
  ];

  const editId = params.get("edit");
  const editing = editId ? targets.find((t) => t.id === Number(editId)) : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-surface px-4 py-3">
            <div className={`type-eyebrow ${k.color}`}>{k.label}</div>
            <div className="type-title u-num mt-0.5 text-text">{k.value}</div>
            <div className="type-caption text-text-muted">{k.note}</div>
          </div>
        ))}
      </div>
      <DataTable columns={columns} rows={rows} rowKey={(r) => String(r.t.id)} onRowClick={(r) => open({ edit: String(r.t.id) })} />
      {(params.get("action") === "new" || editing) && <TargetForm key={editId ?? "new"} edit={editing} onClose={close} />}
    </div>
  );
}

function TargetForm({ edit, onClose }: { edit?: SalesTarget; onClose: () => void }) {
  const [name, setName] = useState(edit?.name ?? "");
  const [scope, setScope] = useState<SalesTarget["scope"]>(edit?.scope ?? "Whole business");
  const [who, setWho] = useState(edit?.who ?? "");
  const [start, setStart] = useState(edit?.start ?? "2026-12-01");
  const [end, setEnd] = useState(edit?.end ?? "2026-12-31");
  const [amount, setAmount] = useState(edit ? String(edit.amount) : "");
  const whoOpts: readonly string[] = scope === "Branch" ? TARGET_BRANCHES : scope === "Staff member" ? SALES_STAFF : [];
  const n = Number(amount) || 0;
  const days = start && end && end >= start ? Math.round((Date.parse(end) - Date.parse(start)) / DAY) + 1 : 0;
  const blocked = !name.trim() || !(n > 0) || !start || !end || end < start || (scope !== "Whole business" && !who);
  const save = async () => {
    const r = await saveTarget({ name, scope, who, start, end, amount: n }, edit?.id);
    if (r.ok) onClose();
  };
  return (
    <Modal
      open
      title={edit ? "Edit sales target" : "New sales target"}
      subtitle="Set how much you want to sell in a period."
      onClose={onClose}
      width={600}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" disabled={blocked} onClick={save}>
            {edit ? "Save changes" : "Create target"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Target name" placeholder="For example, December store sales" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <SearchSelect
          label="Applies to"
          options={["Whole business", "Branch", "Staff member"]}
          value={scope}
          onChange={(v) => {
            setScope(v as SalesTarget["scope"]);
            setWho("");
          }}
        />
        {whoOpts.length ? <SearchSelect label={scope === "Branch" ? "Branch" : "Staff member"} options={whoOpts} value={who} onChange={setWho} /> : <div />}
        <Input label="Start date" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <Input label="End date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <div className="col-span-2">
          <Input label="Target amount (KES)" type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="col-span-2 rounded-md bg-green-50 px-4 py-3 text-green-800">
          <div className="type-label">{n && days ? `About KES ${grouped(n / days)} a day` : "Sales count towards the target"}</div>
          <div className="type-small mt-0.5">
            {n && days ? `Over ${days} days. Sales recorded in this period count towards it automatically.` : "Every sale recorded in the period counts automatically."}
          </div>
        </div>
      </div>
    </Modal>
  );
}
