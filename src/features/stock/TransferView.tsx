"use client";

import { receiveTransfer, useCan, type Transfer } from "@/data";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { date } from "@/lib/format";
import { StockDrawer, itemKey, transferPill } from "./shared";

/** Design `isTrLocked`: "Transfer {ref}" for In transit, Received and Cancelled transfers. */
export function TransferView({ transfer: t, onClose }: { transfer: Transfer; onClose: () => void }) {
  const pill = transferPill(t.status);
  const canWrite = useCan("write");
  const fields = [
    { label: "From", text: t.from },
    { label: "To", text: t.to },
    { label: "Date", text: date(t.date) },
    { label: "Notes", text: t.notes || "—" },
  ];
  return (
    <StockDrawer title={`Transfer ${t.ref}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
        </div>
        <div>
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-4 border-t border-border py-3">
              <span className="type-eyebrow flex-none text-text-muted">{f.label}</span>
              <span className="type-label text-right text-text">{f.text}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="type-title mb-2 text-text">Items</div>
          {t.items.map((i) => (
            <div key={itemKey(i.product, i.variant)} className="type-body flex justify-between gap-4 border-t border-border py-2 text-text">
              <span className="min-w-0 [overflow-wrap:anywhere]">{itemKey(i.product, i.variant)}</span>
              <span className="u-num whitespace-nowrap">
                {i.qty} {i.unit}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {t.status === "In transit" && canWrite && (
            <Button
              onClick={async () => {
                const res = await receiveTransfer(t.ref);
                if (res.ok) onClose();
              }}
            >
              Mark as received
            </Button>
          )}
        </div>
      </div>
    </StockDrawer>
  );
}
