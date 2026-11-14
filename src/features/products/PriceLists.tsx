"use client";
/**
 * Products › Price lists (feature 012): one price list per customer group other than Retail.
 * "Add price" → `?action=new`; a row opens "Edit price" (`?edit=<product>|<variant>|<unit>`).
 */
import { useState } from "react";
import { removePrice, useCan, useCustomerGroups, usePriceEntries, type PriceRow } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { ConfirmDialog } from "@/components/ui/Overlay";
import { StatusPill } from "@/components/ui/StatusPill";
import { money } from "@/lib/format";
import { PriceEntryForm } from "./PriceEntryForm";
import { useOverlayParams } from "./shared";

const keyOf = (e: { product: string; variant: string; unit: string }) => `${e.product}|${e.variant}|${e.unit}`;
const breaksText = (e: PriceRow) =>
  e.breaks.length > 1
    ? e.breaks
        .slice(1)
        .map((b) => `${b.from}+ ${money(b.price)}`)
        .join(" · ")
    : "—";
const firstText = (e: PriceRow) => {
  const b = e.breaks[0];
  if (!b) return "—";
  return b.from > 1 ? `${money(b.price)} from ${b.from}` : money(b.price);
};

export function PriceLists() {
  const groups = useCustomerGroups().filter((g) => !g.builtIn);
  const { action, get, open } = useOverlayParams();
  const picked = get("list");
  const group = groups.find((g) => g.id === picked) ?? groups[0];
  const rows = usePriceEntries(group?.id ?? "none");
  const canWrite = useCan("write");
  const canDelete = useCan("delete");
  const [confirm, setConfirm] = useState<PriceRow | null>(null);
  const withList = (p: Record<string, string>) => open({ ...(group ? { list: group.id } : {}), ...p });
  const editing = rows.find((r) => keyOf(r) === get("edit"));

  const columns: DataColumn<PriceRow>[] = [
    { key: "product", title: "Product", render: (r) => <span className="font-medium text-text">{r.product}</span> },
    { key: "variant", title: "Variant" },
    { key: "unit", title: "Unit" },
    { key: "standard", title: "Standard price (KES)", numeric: true, text: (r) => (r.standard ? money(r.standard) : "—") },
    {
      key: "price",
      title: "Group price (KES)",
      numeric: true,
      text: firstText,
      render: (r) => (
        <span className="inline-flex flex-wrap items-center justify-end gap-2">
          {r.higher && <StatusPill tone="warning">Higher than the standard price</StatusPill>}
          <span>{firstText(r)}</span>
        </span>
      ),
    },
    { key: "breaks", title: "Quantity breaks", text: breaksText },
    {
      key: "_act",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[
            { label: "Edit", onClick: () => withList({ edit: keyOf(r) }) },
            ...(canDelete ? [{ label: "Remove", danger: true, onClick: () => setConfirm(r) }] : []),
          ]}
        />
      ),
    },
  ];

  if (!group) return <div className="type-body rounded-lg border border-border bg-surface p-6 text-text-secondary">Add a customer group under Customers to start a price list.</div>;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Price list">
        {groups.map((g) => {
          const on = g.id === group.id;
          return (
            <button
              key={g.id}
              type="button"
              aria-pressed={on}
              onClick={() => open({ list: g.id })}
              className={`flex cursor-pointer flex-col items-start rounded-md border bg-surface px-4 py-2 text-left ${on ? "border-2 border-action" : "border-border-strong"}`}
            >
              <span className={`type-label ${on ? "text-green-700" : "text-text"}`}>{g.name}</span>
              <span className="type-caption text-text-muted">
                {g.prices} {g.prices === 1 ? "price" : "prices"} · {g.customers} {g.customers === 1 ? "customer" : "customers"}
              </span>
            </button>
          );
        })}
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={keyOf}
        onRowClick={canWrite ? (r) => withList({ edit: keyOf(r) }) : undefined}
        empty="No prices in this list yet."
        noun="price"
        minWidth={860}
      />
      <PriceEntryForm open={action === "new"} group={group} onClose={() => open({ list: group.id })} />
      <PriceEntryForm open={!!editing} group={group} edit={editing} onClose={() => open({ list: group.id })} />
      <ConfirmDialog
        open={!!confirm}
        title="Remove this price?"
        message={confirm ? `${group.name} customers will pay the standard price for ${confirm.product} (${confirm.variant}, ${confirm.unit}).` : ""}
        confirmLabel="Remove"
        danger
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) void removePrice(confirm);
          setConfirm(null);
        }}
      />
    </>
  );
}

export function PriceListActions() {
  const { get, open } = useOverlayParams();
  const list = get("list");
  return (
    <Button icon="plus" onClick={() => open({ ...(list ? { list } : {}), action: "new" })}>
      Add price
    </Button>
  );
}
