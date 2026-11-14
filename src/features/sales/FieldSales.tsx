"use client";
/**
 * Sales › Field sales (feature 021): a rep's day on the road, laid out for a phone. The van, a
 * summary, today's visits and what is on the van. "Add visit" → `?action=visit`.
 */
import { useState } from "react";
import { addVisit, useCan, useCustomers, useDaySummary, useVanStock, useVans, useVisits, WALK_IN, type Visit } from "@/data";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { num } from "@/lib/format";
import { VisitForm } from "./VisitForm";
import { Panel, money, useOverlay } from "./shared";

const TONE: Record<Visit["status"], string> = { Planned: "info", Sold: "success", "No sale": "neutral" };

export function AddVisitAction() {
  const { open } = useOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action: "visit" })}>
      Add visit
    </Button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="type-eyebrow text-text-muted">{label}</div>
      <div className="type-title u-num mt-0.5 text-text">{value}</div>
    </div>
  );
}

export function FieldSales() {
  const vans = useVans();
  const { params, open, close } = useOverlay();
  const picked = params.get("van");
  const van = vans.find((v) => v === picked) ?? vans[0] ?? "";
  const visits = useVisits(van);
  const stock = useVanStock(van);
  const sum = useDaySummary(van);
  const customers = useCustomers();
  const canWrite = useCan("write");
  const visitId = params.get("visit");
  // Selling needs Write on Sales, also when the visit is opened from a link.
  const visiting = canWrite ? visits.find((v) => v.id === visitId && v.status === "Planned") : undefined;
  const phone = (name: string) => customers.find((c) => c.name === name)?.phone ?? "—";
  /** Keeps the chosen van in the URL when it is not the first one. */
  const keep: Record<string, string> = van && van !== vans[0] ? { van } : {};

  if (!van) {
    return (
      <Panel>
        <p className="type-body m-0 text-text">There is no van yet.</p>
        <p className="type-small m-0 mt-1 text-text-secondary">Add a storage location of the type Van under Settings › Storage locations, then move stock onto it with a stock transfer.</p>
      </Panel>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="type-eyebrow text-text-muted">Van</div>
          {vans.length > 1 ? (
            <div className="w-[240px] max-w-full">
              <SearchSelect noun="van" ariaLabel="Van" options={vans} value={van} onChange={(v) => open({ van: v })} />
            </div>
          ) : (
            <div className="type-title text-text">{van}</div>
          )}
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }} aria-label="Today's summary" role="group">
        <Stat label="Visits" value={`${sum.done} of ${sum.total}`} />
        <Stat label="Sales" value={money(sum.sold)} />
        <Stat label="Cash to hand in" value={money(sum.cash)} />
        <Stat label="M-Pesa" value={money(sum.mpesa)} />
        <Stat label="On credit" value={money(sum.credit)} />
      </div>

      <section aria-label="Today's visits" className="flex flex-col gap-2">
        <h2 className="type-card-title m-0 text-text">Today&apos;s visits</h2>
        {visits.length === 0 && <p className="type-small m-0 text-text-muted">No visits planned for today.</p>}
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {visits.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
              <div className="min-w-0 flex-1">
                <div className="type-label break-words text-text">{v.customer}</div>
                <div className="type-small text-text-secondary">{phone(v.customer)}</div>
                {v.status === "Sold" && (
                  <div className="type-small text-text-secondary">
                    {v.sale} at {v.at}
                  </div>
                )}
                {v.status === "No sale" && (
                  <div className="type-small text-text-secondary">
                    {v.reason} at {v.at}
                  </div>
                )}
              </div>
              <StatusPill tone={TONE[v.status]}>{v.status}</StatusPill>
              {v.status === "Planned" && canWrite && (
                <Button size="sm" aria-label={`Start visit: ${v.customer}`} onClick={() => open({ ...keep, visit: v.id })}>
                  Start visit
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="On the van" className="flex flex-col gap-2">
        <h2 className="type-card-title m-0 text-text">On the van</h2>
        {stock.length === 0 ? (
          <p className="type-small m-0 text-text-muted">The van is empty. Move stock onto it with a stock transfer.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {stock.map((s) => (
              <li key={s.product} className="type-body flex justify-between gap-3 border-b border-border py-2 text-text">
                <span className="min-w-0 break-words">{s.product}</span>
                <span className="u-num">{num(s.quantity)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {visiting && <VisitForm key={visiting.id} visit={visiting} onClose={() => (Object.keys(keep).length ? open(keep) : close())} />}
      {params.get("action") === "visit" && <AddVisit van={van} onClose={() => (Object.keys(keep).length ? open(keep) : close())} />}
    </div>
  );
}

function AddVisit({ van, onClose }: { van: string; onClose: () => void }) {
  const customers = useCustomers();
  const [customer, setCustomer] = useState("");
  const [error, setError] = useState("");
  const save = async () => {
    const r = await addVisit(customer, van);
    if (r.ok) onClose();
    else setError(r.message);
  };
  return (
    <Drawer open title="Add visit" subtitle={van} width={440} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <SearchSelect
          label="Customer"
          noun="customer"
          options={customers.filter((c) => c.name !== WALK_IN && c.status.label !== "Inactive").map((c) => c.name)}
          value={customer}
          onChange={(c) => {
            setCustomer(c);
            setError("");
          }}
        />
        {error && (
          <div role="alert" className="type-small text-danger-text">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button disabled={!customer} onClick={save}>
            Add to route
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
