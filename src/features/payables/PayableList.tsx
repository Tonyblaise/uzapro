"use client";
/**
 * Payables › Payables: Ref, Supplier, Type (document as a note), Branch, Due date, Priority, Total,
 * Balance ("Paid …" as a note), Approval, Status, with the design's filters and the row actions
 * Approve / Reject (only while waiting approval), Pay supplier (approved and unpaid) and View.
 */
import { approvePayable, rejectPayable, togglePayablePriority, usePayables, type PayableRow, type Pill } from "@/data";
import { MoneyKpis, MoneyOverlays, MoneyTable, Stack, col, docDate, fmt, pillCol, priorityPill, useMoneyOverlay, type MoneyCol, type MoneyFilter } from "@/features/receivables";

const APPROVAL: Record<PayableRow["approval"], Pill> = {
  "Waiting approval": { label: "Waiting approval", tone: "warning" },
  Approved: { label: "Approved", tone: "success" },
  Rejected: { label: "Rejected", tone: "danger" },
};

const COLUMNS: MoneyCol<PayableRow>[] = [
  col("ref", "Ref", (r) => r.ref),
  col("party", "Supplier", (r) => r.party),
  col("type", "Type", (r) => r.type, { note: (r) => r.doc }),
  col("branch", "Branch", (r) => r.branch),
  col("due", "Due date", (r) => docDate(r.due)),
  pillCol("priority", "Priority", (r) => priorityPill(r.priority)),
  col("total", "Total (KES)", (r) => fmt(r.total), { numeric: true }),
  col("balance", "Balance (KES)", (r) => fmt(r.balance), { numeric: true, note: (r) => `Paid ${fmt(r.paid)}` }),
  pillCol("approval", "Approval", (r) => APPROVAL[r.approval]),
  pillCol("status", "Status", (r) => r.status),
];

const FILTERS: MoneyFilter<PayableRow>[] = [
  { label: "Payment status", all: "All statuses", value: (r) => r.status.label },
  { label: "Approval status", all: "All approval statuses", value: (r) => r.approval },
  { label: "Type", all: "All types", value: (r) => r.type },
  { label: "Priority", all: "All priorities", value: (r) => r.priority },
  { label: "Branch", all: "All branches", value: (r) => r.branch },
];

export function PayableList() {
  const rows = usePayables();
  const { open } = useMoneyOverlay();
  return (
    <Stack>
      <MoneyKpis side="pay" />
      <MoneyTable
        side="pay"
        columns={COLUMNS}
        rows={rows}
        rowKey={(r) => r.ref}
        filters={FILTERS}
        minWidth={1080}
        actions={(r) => [
          { label: "Approve", disabled: r.approval !== "Waiting approval", onClick: () => void approvePayable(r.ref) },
          { label: "Reject", danger: true, disabled: r.approval !== "Waiting approval", onClick: () => void rejectPayable(r.ref) },
          { label: "Pay supplier", disabled: r.status.label === "Paid" || r.approval !== "Approved", onClick: () => open({ action: "pay", party: r.party, sel: r.ref }) },
          { label: r.priority === "High" ? "Mark normal priority" : "Mark high priority", onClick: () => void togglePayablePriority(r.ref) },
          { label: "View", onClick: () => open({ view: r.ref }) },
        ]}
      />
      <MoneyOverlays side="pay" />
    </Stack>
  );
}
