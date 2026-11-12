"use client";
/** The design's payment plan form (`isRcvPlan` with `pl`), for receivables (`rcvPlan`) and payables (`payPlan`). */
import { useState } from "react";
import { PLAN_FREQS, createPlan, planEach, planStep, toast, usePayables, usePlans, useReceivables, type Side } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { docDate, fmt } from "./shared";

export interface PlanFormProps {
  side: Side;
  open: boolean;
  onClose: () => void;
}

export function PlanForm({ open, ...rest }: PlanFormProps) {
  if (!open) return null;
  return <PlanFormBody {...rest} />;
}

function PlanFormBody({ side, onClose }: Omit<PlanFormProps, "open">) {
  const rcv = side === "rcv";
  const receivables = useReceivables();
  const payables = usePayables();
  const plans = usePlans(side);
  const [target, setTarget] = useState("");
  // Design header action defaults: customer 3 / Monthly / 17 Nov; supplier 2 / Monthly / 20 Nov.
  const [count, setCount] = useState(rcv ? "3" : "2");
  const [freq, setFreq] = useState("Monthly");
  const [start, setStart] = useState(rcv ? "2026-11-17" : "2026-11-20");
  const [busy, setBusy] = useState(false);

  const active = new Set(plans.filter((p) => p.status.label === "Active").map((p) => p.target));
  const items: { ref: string; party: string; balance: number }[] = rcv
    ? receivables.filter((r) => r.balance > 0 && !active.has(r.ref))
    : payables.filter((p) => p.balance > 0 && p.approval === "Approved" && !active.has(p.ref));
  const options = items.map((r) => ({ value: r.ref, label: `${r.ref} · ${r.party} · KES ${fmt(r.balance)}` }));
  const r = items.find((x) => x.ref === target);
  const cnt = Math.round(Number(count) || 0);
  const each = r && cnt >= 2 ? planEach(r.balance, cnt) : 0;
  const last = start && cnt >= 1 ? planStep(start, freq, cnt - 1) : start;
  const preview =
    r && cnt >= 2 && start
      ? `${cnt} payments of about KES ${fmt(each)} (${freq.toLowerCase()}), from ${docDate(start)} to ${docDate(last)}.`
      : rcv
        ? "Pick a receivable and the number of instalments to see the plan."
        : "Pick an approved payable and the number of instalments to see the plan.";
  const blocked = !r || cnt < 2 || cnt > 24 || !start;

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const res = await createPlan(side, { target, count: cnt, freq, start });
    setBusy(false);
    if (res.ok) onClose();
    else toast(res.message);
  };

  return (
    <Modal
      open
      title="New payment plan"
      subtitle={rcv ? "Split what a customer owes into smaller payments." : "Split what you owe a supplier into smaller payments."}
      onClose={onClose}
      width={640}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" disabled={blocked || busy} onClick={save}>
            Create plan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SearchSelect label={rcv ? "Receivable" : "Payable"} options={options} value={target} onChange={setTarget} />
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          <Input label="Number of instalments" type="number" placeholder="3" min="2" max="24" value={count} onChange={(e) => setCount(e.target.value)} />
          <SearchSelect label="How often" options={PLAN_FREQS} value={freq} onChange={setFreq} />
        </div>
        <Input label="First instalment due" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <div className="type-body rounded-md border border-green-200 bg-green-50 px-4 py-3 text-text">{preview}</div>
      </div>
    </Modal>
  );
}
