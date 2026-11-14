"use client";
/**
 * A visit (feature 021): sell from the van to the customer at their prices, or record that
 * nothing was sold. The sale is a normal sale that leaves the van, with the credit check from
 * feature 012 when it is paid later.
 */
import { useMemo, useState } from "react";
import {
  NO_SALE_REASONS,
  PAY_LATER,
  VISIT_PAY_METHODS,
  noSaleOnVisit,
  sellOnVisit,
  unitsOf,
  useCreditCheck,
  useCreditPosition,
  usePricer,
  useProducts,
  useVanStock,
  type CreditStop as Stop,
  type Visit,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { docTotals } from "@/lib/totals";
import { CreditStop } from "@/features/customers";
import { money } from "./shared";

interface Line {
  id: number;
  product: string;
  variant: string;
  unit: string;
  qty: string;
  taxable: boolean;
}

let lineId = 0;

export function VisitForm({ visit, onClose }: { visit: Visit; onClose: () => void }) {
  const products = useProducts();
  const onVan = useVanStock(visit.van);
  const pricer = usePricer(visit.customer);
  const position = useCreditPosition(visit.customer);
  const creditCheck = useCreditCheck(visit.customer);
  const [lines, setLines] = useState<Line[]>([]);
  const [pay, setPay] = useState("Cash");
  const [payRef, setPayRef] = useState("");
  const [stop, setStop] = useState<Stop | null>(null);
  const [error, setError] = useState("");
  const [noSale, setNoSale] = useState(false);
  const [reason, setReason] = useState("");

  // Only what is on the van can be sold on a visit.
  const items = useMemo(
    () => products.filter((p) => onVan.some((s) => s.product === p.name)).flatMap((p) => p.variants.map((v) => ({ key: `${p.name} · ${v.name}`, product: p.name, variant: v, taxable: p.taxable }))),
    [products, onVan],
  );
  const priced = lines.map((l) => {
    const p = pricer.price(l.product, l.variant, l.unit, Number(l.qty) > 0 ? Number(l.qty) : 1);
    return { ...l, price: p?.price ?? 0, note: pricer.note(p) };
  });
  const t = docTotals(priced.map((l) => ({ qty: Number(l.qty) || 0, price: l.price, taxable: l.taxable })));
  const credit = pay === PAY_LATER;
  const blocked = !priced.length || priced.some((l) => !(Number(l.qty) > 0));

  const addItem = (key: string) => {
    const i = items.find((x) => x.key === key);
    if (i) setLines((ls) => [...ls, { id: ++lineId, product: i.product, variant: i.variant.name, unit: unitsOf(i.variant)[0]!, qty: "1", taxable: i.taxable }]);
    setError("");
  };
  const setLine = (id: number, patch: Partial<Line>) => {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setError("");
  };

  const send = async (approval?: { reason: string }) => {
    const r = await sellOnVisit(visit.id, {
      lines: priced.map((l) => ({ product: l.product, variant: l.variant, unit: l.unit, qty: Number(l.qty), price: l.price, taxable: l.taxable })),
      payMethod: pay,
      payRef,
      ...(approval ? { approval } : {}),
    });
    if (r.ok) onClose();
    else if (r.stop) setStop(r.stop);
    else setError(r.message);
  };
  const complete = () => {
    const hit = credit ? creditCheck(t.total) : null;
    if (hit) setStop(hit);
    else void send();
  };
  const closeNoSale = async () => {
    const r = await noSaleOnVisit(visit.id, reason);
    if (r.ok) onClose();
    else setError(r.message);
  };

  return (
    <>
      <Drawer open={!stop} title={visit.customer} subtitle={`Visit · ${visit.van}`} onClose={onClose} width={560}>
        <div className="flex flex-col gap-4">
          {position && (
            <div className="type-small flex flex-wrap gap-x-6 gap-y-1 rounded-md bg-canvas p-3 text-text-secondary">
              <span>
                Available credit: <span className="u-num font-semibold text-text">{position.available === null ? "No limit" : money(position.available)}</span>
              </span>
              <span>
                Overdue: <span className={`u-num font-semibold ${position.overdue ? "text-danger-text" : "text-text"}`}>{position.overdue ? money(position.overdue) : "None"}</span>
              </span>
            </div>
          )}

          {noSale ? (
            <div className="flex flex-col gap-3">
              <SearchSelect
                label="Why was there no sale?"
                noun="reason"
                options={NO_SALE_REASONS}
                value={reason}
                onChange={(r) => {
                  setReason(r);
                  setError("");
                }}
              />
              {error && (
                <div role="alert" className="type-small text-danger-text">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => void closeNoSale()}>Record no sale</Button>
                <Button variant="secondary" onClick={() => setNoSale(false)}>
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <>
              <SearchSelect label="Add item" noun="product" options={items.map((i) => i.key)} value="" onChange={addItem} />
              {priced.length === 0 && <p className="type-small m-0 text-text-muted">No items yet. Only what is on the van is listed.</p>}
              <ul className="m-0 flex list-none flex-col gap-3 p-0" aria-label="Items">
                {priced.map((l) => {
                  const v = items.find((i) => i.product === l.product && i.variant.name === l.variant)?.variant;
                  const name = `${l.product} · ${l.variant}`;
                  return (
                    <li key={l.id} className="flex flex-col gap-2 rounded-md border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="type-label min-w-0 break-words text-text">
                          {name}
                          <span className="type-caption block font-normal text-text-muted">
                            {money(l.price)} each{l.note ? ` · ${l.note}` : ""}
                          </span>
                        </div>
                        <IconButton icon="trash-2" size="sm" label={`Remove ${name}`} onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} />
                      </div>
                      <div className="grid items-end gap-2" style={{ gridTemplateColumns: "96px minmax(0,1fr) auto" }}>
                        <Input size="sm" type="number" min="1" aria-label={`Quantity: ${name}`} value={l.qty} onChange={(e) => setLine(l.id, { qty: e.target.value })} />
                        <SearchSelect noun="unit" ariaLabel={`Unit: ${name}`} options={v ? unitsOf(v) : [l.unit]} value={l.unit} onChange={(u) => setLine(l.id, { unit: u })} />
                        <span className="type-label u-num text-right text-text">{money((Number(l.qty) || 0) * l.price)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-col">
                <div className="type-small flex justify-between py-1 text-text-muted">
                  <span>VAT 16%</span>
                  <span className="u-num">{money(t.vat)}</span>
                </div>
                <div className="type-title flex justify-between py-1 text-text">
                  <span>Total</span>
                  <span className="u-num">{money(t.total)}</span>
                </div>
              </div>
              <SearchSelect label="Paid by" noun="payment method" options={[...VISIT_PAY_METHODS, PAY_LATER]} value={pay} onChange={setPay} />
              {!credit && <Input label="Payment reference (optional)" placeholder="For example, M-Pesa code" value={payRef} onChange={(e) => setPayRef(e.target.value)} />}
              {error && (
                <div role="alert" className="type-small text-danger-text">
                  {error}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button icon="check" disabled={blocked} onClick={complete}>
                  Complete sale
                </Button>
                <Button variant="secondary" onClick={() => setNoSale(true)}>
                  No sale
                </Button>
              </div>
            </>
          )}
        </div>
      </Drawer>
      <CreditStop
        stop={stop}
        onClose={() => setStop(null)}
        onApprove={(r) => {
          setStop(null);
          void send({ reason: r });
        }}
      />
    </>
  );
}
