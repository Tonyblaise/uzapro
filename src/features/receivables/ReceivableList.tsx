"use client";
/**
 * Receivables › Receivables: Ref, Customer, Type, Document, Due date, Priority, Total, Paid,
 * Balance, Status with the design's filters (Payment status, Receivable type, Priority) and row
 * actions Record payment / Mark high or normal priority / View. Header action "Record payment".
 */
import { useState } from "react";
import { toggleReceivablePriority, useReceivables, useReminderMessage, type ReceivableRow } from "@/data";
import { WhatsAppDialog } from "@/components/ui/WhatsAppDialog";
import { MoneyKpis } from "./MoneyKpis";
import { MoneyOverlays } from "./MoneyOverlays";
import { MoneyTable, Stack, col, docDate, fmt, pillCol, priorityPill, useMoneyOverlay, type MoneyCol, type MoneyFilter } from "./shared";

const COLUMNS: MoneyCol<ReceivableRow>[] = [
  col("ref", "Ref", (r) => r.ref),
  col("party", "Customer", (r) => r.party),
  col("type", "Type", (r) => r.type),
  col("doc", "Document", (r) => r.doc),
  col("due", "Due date", (r) => docDate(r.due)),
  pillCol("priority", "Priority", (r) => priorityPill(r.priority)),
  col("total", "Total (KES)", (r) => fmt(r.total), { numeric: true }),
  col("paid", "Paid (KES)", (r) => fmt(r.paid), { numeric: true }),
  col("balance", "Balance (KES)", (r) => fmt(r.balance), { numeric: true }),
  pillCol("status", "Status", (r) => r.status),
];

const FILTERS: MoneyFilter<ReceivableRow>[] = [
  { label: "Payment status", all: "All statuses", value: (r) => r.status.label },
  { label: "Receivable type", all: "All types", value: (r) => r.type },
  { label: "Priority", all: "All priorities", value: (r) => r.priority },
];

export function ReceivableList() {
  const rows = useReceivables();
  const { open } = useMoneyOverlay();
  const [remind, setRemind] = useState<string | null>(null);
  return (
    <Stack>
      <MoneyKpis side="rcv" />
      <MoneyTable
        side="rcv"
        columns={COLUMNS}
        rows={rows}
        rowKey={(r) => r.ref}
        filters={FILTERS}
        minWidth={1000}
        actions={(r) => [
          { label: "Record payment", disabled: r.status.label === "Paid" || r.voided, onClick: () => open({ action: "pay", party: r.party, sel: r.ref }) },
          { label: r.priority === "High" ? "Mark normal priority" : "Mark high priority", onClick: () => void toggleReceivablePriority(r.ref) },
          { label: "View", onClick: () => open({ view: r.ref }) },
          // Feature 020: a WhatsApp reminder listing everything the customer owes.
          ...(r.balance > 0 && !r.voided ? [{ label: "Send reminder", icon: "message-square" as const, onClick: () => setRemind(r.party) }] : []),
        ]}
      />
      <MoneyOverlays side="rcv" />
      {remind && <ReminderDialog customer={remind} onClose={() => setRemind(null)} />}
    </Stack>
  );
}

/** The payment reminder for one customer (feature 020). */
function ReminderDialog({ customer, onClose }: { customer: string; onClose: () => void }) {
  const message = useReminderMessage(customer);
  return <WhatsAppDialog open reminder name={customer} message={message} onClose={onClose} />;
}
