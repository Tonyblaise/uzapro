"use client";
/**
 * Bank accounts tab: the design's card grid (`isBankCards`). Each card shows the type icon and
 * tone, name and type, Active/Inactive, KES balance, opening balance and the net inflow/outflow
 * since then, with Deposit, Withdraw and Edit account. The "Account type" picker filters the cards.
 */
import { useState } from "react";
import { useAccounts, type Account } from "@/data";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { FinOverlays } from "./FinOverlays";
import { LOOKS, fmt2, useFinOverlay } from "./shared";

const TYPES = ["All", "Bank", "Mobile money", "Cash", "Petty cash"] as const;
const ALL_TYPES = "All account types";

function BankCard({ a }: { a: Account }) {
  const { open } = useFinOverlay();
  const look = LOOKS[a.type] ?? LOOKS.Bank;
  const flow = a.balance - a.opening;
  const label = "type-eyebrow text-text-muted";
  return (
    <article aria-label={a.name} className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-col gap-5 bg-green-50 p-5">
        <div className="flex items-start gap-3">
          <span className={`grid size-10 flex-none place-items-center rounded-md bg-surface ${look.color}`}>
            <Icon name={look.icon} size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="type-title block text-text [overflow-wrap:anywhere]">{a.name}</span>
            <span className="type-small block text-text-secondary">{a.type === "Bank" ? "Bank account" : a.type}</span>
          </span>
          <StatusPill tone={a.active ? "success" : "neutral"}>{a.active ? "Active" : "Inactive"}</StatusPill>
        </div>
        <div>
          <div className={label}>KES balance</div>
          <div className="type-kpi u-num text-text">{fmt2(a.balance)}</div>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={label}>Opening</div>
            <div className="type-label u-num text-text">{fmt2(a.opening)}</div>
          </div>
          <div>
            <div className={label}>{flow < 0 ? "Net outflow" : "Net inflow"}</div>
            <div className={`type-label u-num ${flow < 0 ? "text-danger-text" : "text-success-text"}`}>{(flow < 0 ? "−" : "+") + fmt2(Math.abs(flow))}</div>
          </div>
        </div>
        <div className="grid gap-2 border-t border-border pt-3 [grid-template-columns:minmax(0,1fr)_minmax(0,1fr)_36px]">
          <button
            type="button"
            onClick={() => open({ action: "deposit", acc: a.name })}
            className="type-small h-[34px] cursor-pointer rounded-md border border-green-200 bg-green-50 font-semibold text-green-700 hover:bg-green-100"
          >
            ↓ Deposit
          </button>
          <button
            type="button"
            onClick={() => open({ action: "withdrawal", acc: a.name })}
            className="type-small h-[34px] cursor-pointer rounded-md border border-danger-soft bg-danger-soft font-semibold text-danger-text hover:brightness-95"
          >
            ↑ Withdraw
          </button>
          <IconButton icon="pencil" variant="secondary" size="sm" label="Edit account" onClick={() => open({ view: a.name })} className="size-[34px]!" />
        </div>
      </div>
    </article>
  );
}

export function BankAccountList() {
  const accounts = useAccounts();
  const [type, setType] = useState<string>("All");
  const cards = accounts.filter((a) => type === "All" || a.type === type);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="ml-auto min-w-[180px] flex-[0_1_240px]">
          <SearchSelect noun="Account type" options={[ALL_TYPES, ...TYPES.slice(1)]} value={type === "All" ? ALL_TYPES : type} onChange={(v) => setType(v === ALL_TYPES ? "All" : v)} />
        </div>
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr))]">
        {cards.map((a) => (
          <BankCard key={a.name} a={a} />
        ))}
      </div>
      <FinOverlays />
    </div>
  );
}
