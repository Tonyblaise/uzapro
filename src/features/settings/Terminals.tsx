"use client";
/**
 * Settings › Terminals (design `isTerminals` with `tm`): the terminal summary; search and the
 * All / Active / Inactive filter; the terminal cards with Edit, Activate / Deactivate and Delete.
 * The dialog (design `setModal` kind 'term') opens with `?action=new` or `?view=<id>`.
 * Terminals are free: the design's paid slots are removed (user request, 2026-11-12).
 */
import { useState } from "react";
import {
  activeTerminals,
  deleteTerminal,
  saveTerminal,
  setTerminalActive,
  toast,
  useBranchNames,
  usePosStores,
  useTerminals,
  type Terminal,
  type TerminalsState,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { Cell, Note, SetModal, useSettingsOverlay } from "./shared";

type Filter = "All" | "Active" | "Inactive";
const ANY = "Any branch";

export function Terminals() {
  const T = useTerminals();
  const { params, open, close } = useSettingsOverlay();
  const [q, setQ] = useState("");
  const [flt, setFlt] = useState<Filter>("All");

  const active = activeTerminals(T);
  const inactive = T.list.length - active;
  const needle = q.toLowerCase();
  const shown = T.list.filter((t) => (flt === "All" || (flt === "Active") === t.active) && (!needle || [t.name, t.code, t.store, t.branch].join(" ").toLowerCase().includes(needle)));
  const stats: [string, number, string][] = [
    ["Active", active, "bg-green-600"],
    ["Inactive", inactive, "bg-border-strong"],
    ["All terminals", T.list.length, "bg-info"],
  ];
  const view = params.get("view");
  const editId = view ? Number(view) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
        <div>
          <div className="type-eyebrow text-text-muted">Terminals</div>
          <div className="type-body mt-0.5 text-text-secondary">Add as many terminals as you need. Each one sells from a storage location with sales (POS) turned on.</div>
        </div>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
          {stats.map(([label, value, dot]) => (
            <div key={label} className="rounded-md bg-canvas px-4 py-3">
              <div className="type-caption flex items-center gap-1.5 font-semibold text-text-secondary">
                <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />
                {label}
              </div>
              <div className="type-title mt-0.5 text-text">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-[340px] flex-[1_1_240px]">
          <Input icon="search" placeholder="Search name, code or location" aria-label="Search terminals" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["All", "Active", "Inactive"] as const).map((x) => {
            const on = flt === x;
            return (
              <button
                key={x}
                type="button"
                aria-pressed={on}
                onClick={() => setFlt(x)}
                className={`type-small cursor-pointer rounded-pill border px-3 py-1 font-semibold ${on ? "border-green-600 bg-green-50 text-green-700" : "border-border bg-surface text-text-secondary"}`}
              >
                {x} <span className="opacity-70">{x === "All" ? T.list.length : x === "Active" ? active : inactive}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!shown.length && <div className="type-body rounded-lg border border-border bg-surface p-8 text-center text-text-muted">No terminals match.</div>}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))]">
        {shown.map((t) => (
          <TerminalCard key={t.id} t={t} T={T} onEdit={() => open({ view: String(t.id) })} />
        ))}
      </div>

      {params.get("action") === "new" && <TerminalDialog key="new" onClose={close} />}
      {editId !== undefined && !Number.isNaN(editId) && <TerminalDialog key={view} edit={editId} onClose={close} />}
    </div>
  );
}

function TerminalCard({ t, T, onEdit }: { t: Terminal; T: TerminalsState; onEdit: () => void }) {
  const toggle = async () => {
    await setTerminalActive(t.id, !t.active);
  };
  return (
    <div className={`flex flex-col gap-3 rounded-lg border border-l-4 border-border bg-surface px-5 py-4 ${t.active ? "border-l-green-600" : "border-l-border-strong"}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 flex-none place-items-center rounded-md bg-green-50 text-green-700">
          <Icon name="store" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="type-title text-text">
            {t.name}
            {t.main && <span className="text-warning-text"> ★</span>}
          </div>
          <div className="type-caption u-num text-text-muted">{t.code}</div>
        </div>
        <StatusPill tone={t.active ? "success" : "neutral"}>{t.active ? "Active" : "Inactive"}</StatusPill>
      </div>
      <div className="type-small flex items-center gap-1.5 text-text-secondary">
        <Icon name="map-pin" size={14} />
        {[t.store, t.branch].filter(Boolean).join(" · ") || "No location set"}
      </div>
      <div className="type-small rounded-md bg-canvas p-3 text-text-secondary">
        <div className={`type-caption font-bold ${t.active ? "text-green-700" : "text-text-muted"}`}>{t.active ? "✓ Ready to sell" : "Turned off"}</div>
        {t.active ? "Opens from Point of sale." : "Activate it to sell from it again."}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
        <span className="type-caption text-text-muted">Added {t.added}</span>
        <div className="flex gap-1">
          <IconButton icon="pencil" size="sm" label="Edit terminal" onClick={onEdit} />
          <Button variant="ghost" size="sm" onClick={() => void toggle()}>
            {t.active ? "Deactivate" : "Activate"}
          </Button>
          <IconButton icon="trash-2" size="sm" label="Delete terminal" disabled={t.main || T.list.length < 2} onClick={() => void deleteTerminal(t.id)} />
        </div>
      </div>
    </div>
  );
}

function TerminalDialog({ edit, onClose }: { edit?: number; onClose: () => void }) {
  const T = useTerminals();
  const branches = useBranchNames();
  const editing = edit !== undefined ? T.list.find((t) => t.id === edit) : undefined;
  const [f, setF] = useState<{ name: string; branch: string; store: string }>(() =>
    editing ? { name: editing.name, branch: editing.branch || ANY, store: editing.store } : { name: "", branch: ANY, store: "" },
  );
  const stores = usePosStores(f.branch);
  if (edit !== undefined && !editing) return null;
  const set = (patch: Partial<typeof f>) => setF((s) => ({ ...s, ...patch }));
  const name = f.name.trim();
  const blocked = !name || !f.store;

  const save = async () => {
    if (blocked) return;
    const res = await saveTerminal({ name, branch: f.branch, store: f.store }, editing?.id);
    if (res.ok) onClose();
    else toast(res.message);
  };

  return (
    <SetModal
      title={editing ? "Edit terminal" : "Add terminal"}
      sub="A till or device that makes sales."
      width={600}
      btn={editing ? "Save changes" : "Add terminal"}
      blocked={blocked}
      onClose={onClose}
      onSave={() => void save()}
    >
      <Cell>
        <Input label="Terminal name" placeholder="For example, Counter 1 or Main till" value={f.name} onChange={(e) => set({ name: e.target.value })} />
      </Cell>
      <Cell half>
        <SearchSelect label="Branch (optional)" noun="option" options={[ANY, ...branches]} value={f.branch} onChange={(branch) => set({ branch, store: "" })} />
      </Cell>
      <Cell half>
        <SearchSelect label="Storage location" noun="option" options={stores} value={f.store} onChange={(store) => set({ store })} />
      </Cell>
      {!stores.length && <Note label="No POS locations here" sub="Turn on sales (POS) for a storage location in this branch first." className="text-warning-text" />}
    </SetModal>
  );
}
