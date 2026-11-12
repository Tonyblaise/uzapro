"use client";

import { useMemo, useState } from "react";
import { cancelTransfer, createTransfer, isTransferOpen, useStoreQuantities, useTransfer, type Transfer, type TransferMode } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { DEFAULT_TRANSFER_DATE, ItemRow, ItemsGrid, NotesField, StockDrawer, createStore, itemKey, splitKey, useOverlayParams, useStoreNames, useUnitOptions, useVariantLookup } from "./shared";
import { TransferView } from "./TransferView";


interface Row {
  key: string;
  qty: string;
  unit: string;
}

const COLS = "minmax(0,1.3fr) 96px minmax(0,1fr) 72px 54px";

/**
 * Mounts the transfer overlays: `?action=transfer` (new), `?view=TRF-…` (edit an open transfer or
 * view a locked one) and `?view=TRF-…&cancel=1` (the cancel confirmation).
 */
export function TransferOverlay() {
  const { action, view, get, open, close } = useOverlayParams();
  const transfer = useTransfer(view);
  if (action === "transfer") return <TransferForm key="new" onClose={close} />;
  if (!view || !transfer) return null;
  if (!isTransferOpen(transfer.status)) return <TransferView transfer={transfer} onClose={close} />;
  if (get("cancel") === "1") return <TransferCancel transfer={transfer} onKeep={() => open({ view: transfer.ref })} onClose={close} />;
  return <TransferForm key={transfer.ref} edit={transfer} onClose={close} onAskCancel={() => open({ view: transfer.ref, cancel: "1" })} />;
}

/** Design `isTrCancel`: "Cancel transfer {ref}?" */
function TransferCancel({ transfer, onKeep, onClose }: { transfer: Transfer; onKeep: () => void; onClose: () => void }) {
  return (
    <StockDrawer title={`Cancel transfer ${transfer.ref}?`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="type-body text-text">This cancels the transfer. No stock has moved, so your stock levels stay the same. The transfer stays in the list as Cancelled.</div>
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={async () => {
              const res = await cancelTransfer(transfer.ref);
              if (res.ok) onClose();
            }}
          >
            Cancel transfer
          </Button>
          <Button variant="secondary" onClick={onKeep}>
            Keep transfer
          </Button>
        </div>
      </div>
    </StockDrawer>
  );
}

/** Design `isTrForm`: "New stock transfer" / "Edit transfer {ref}". */
export function TransferForm({ edit, onClose, onAskCancel }: { edit?: Transfer; onClose: () => void; onAskCancel?: () => void }) {
  const stores = useStoreNames();
  const variants = useVariantLookup();
  const units = useUnitOptions();
  const [from, setFrom] = useState(edit?.from ?? "Main Store");
  const [to, setTo] = useState(edit?.to ?? "");
  const [day, setDay] = useState(edit?.date ?? DEFAULT_TRANSFER_DATE);
  const [notes, setNotes] = useState(edit?.notes ?? "");
  const [rows, setRows] = useState<Row[]>(() => (edit?.items ?? []).map((i) => ({ key: itemKey(i.product, i.variant), qty: String(i.qty), unit: i.unit })));
  const here = useStoreQuantities(from);

  const items = useMemo(() => Array.from(here.entries()).filter(([, q]) => q > 0).flatMap(([p]) => variants.names(p).map((v) => itemKey(p, v))), [here, variants]);
  const avail = (p: string) => here.get(p) ?? 0;
  const used = (p: string) => rows.filter((r) => splitKey(r.key).product === p).reduce((a, r) => a + (Number(r.qty) || 0), 0);
  const setRow = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const blocked =
    !from || !to || from === to || !day || rows.length === 0 || rows.some((r) => !(Number(r.qty) > 0) || used(splitKey(r.key).product) > avail(splitKey(r.key).product));

  const submit = async (mode: TransferMode) => {
    const input = { from, to, date: day, notes, items: rows.map((r) => ({ ...splitKey(r.key), qty: Number(r.qty), unit: r.unit })) };
    const res = await createTransfer(input, mode, edit?.ref);
    if (res.ok) onClose();
  };

  return (
    <StockDrawer title={edit ? `Edit transfer ${edit.ref}` : "New stock transfer"} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <div className="type-title text-text">Transfer details</div>
        <div className="grid grid-cols-2 gap-4">
          <SearchSelect
            label="Source store (from)"
            noun="store"
            options={stores}
            value={from}
            onChange={(v) => {
              setFrom(v);
              setRows([]);
            }}
            onCreate={createStore}
          />
          <SearchSelect label="Destination store (to)" noun="store" options={stores} value={to} onChange={setTo} onCreate={createStore} />
          <Input label="Transfer date" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          <NotesField id="tr-notes" label="Notes or reference" rows={1} placeholder="For example, weekly resupply" value={notes} onChange={setNotes} />
        </div>
        <div className="h-px bg-border" />
        <div>
          <div className="type-title text-text">Items to transfer</div>
          <div className="type-small mt-0.5 text-text-muted">Select products to move from {from}.</div>
        </div>
        <SearchSelect
          label="Search items"
          noun="product"
          options={items}
          value=""
          onChange={(key) => setRows((rs) => (rs.some((r) => r.key === key) ? rs : [...rs, { key, qty: "1", unit: units.base }]))}
        />
        <ItemsGrid
          columns={COLS}
          head={[{ label: "Product" }, { label: "Quantity" }, { label: "Unit" }, { label: "Type" }, { label: "Action", right: true }]}
          empty={
            rows.length === 0 && (
              <div className="type-small flex flex-col items-center gap-2 px-3 py-8 text-text-muted">
                <Icon name="package" size={18} />
                <span>No items added</span>
              </div>
            )
          }
        >
          {rows.map((r) => {
            const p = splitKey(r.key).product;
            const over = used(p) > avail(p);
            return (
              <ItemRow key={r.key} columns={COLS}>
                <span className="min-w-0">
                  <span className="type-label block text-text [overflow-wrap:anywhere]">{r.key}</span>
                  <span className={`type-caption block ${over ? "text-danger-text" : "text-text-muted"}`}>
                    {avail(p)} in {from}
                  </span>
                </span>
                <Input size="sm" type="number" min={1} aria-label="Quantity to move" value={r.qty} onChange={(e) => setRow(r.key, { qty: e.target.value })} />
                <SearchSelect noun="unit" options={units.options} value={r.unit} onChange={(v) => setRow(r.key, { unit: v })} onCreate={units.create} />
                <span>
                  <StatusPill tone="neutral">{variants.names(p).length > 1 ? "Variant" : "Simple"}</StatusPill>
                </span>
                <div className="flex justify-end">
                  <IconButton icon="trash-2" size="sm" label="Remove item" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} />
                </div>
              </ItemRow>
            );
          })}
        </ItemsGrid>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
          {edit && onAskCancel && (
            <div className="mr-auto">
              <Button variant="ghost" icon="trash-2" onClick={onAskCancel}>
                Cancel transfer
              </Button>
            </div>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="soft" disabled={blocked} onClick={() => submit("confirm")}>
            Confirm transfer
          </Button>
          <Button variant="soft" disabled={blocked} onClick={() => submit("ship")}>
            Transfer and ship
          </Button>
          <Button disabled={blocked} onClick={() => submit("shipAndReceive")}>
            Transfer, ship and receive
          </Button>
        </div>
      </div>
    </StockDrawer>
  );
}
