"use client";
/**
 * The design's deposit / withdrawal / transfer record view (`isDepView`, `dv` for `depView`,
 * `wdView`, `trView`): amount panel, money breakdown with the account balance after, details,
 * status, history and notes, and the Reverse flow (Reverse → "Yes, reverse it" / "Keep it").
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { reverseMove, toast, useAccounts, useDeposits, useLedger, useMoneyTransfers, useWithdrawals, type LedgerEntry } from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { docDate, fmt2 } from "./shared";

interface Look {
  title: string;
  icon: IconName;
  /** Amount panel ground, its border and the header icon chip. */
  soft: string;
  line: string;
  strong: string;
  eye: string;
  netColor: string;
  balBg: string;
  eye2: string;
  netLabel: string;
  detailsTitle: string;
}

const LOOK: Record<"dep" | "wd" | "tr", Look> = {
  dep: {
    title: "Deposit receipt",
    icon: "file-text",
    soft: "bg-green-50",
    line: "border-green-200",
    strong: "text-green-700",
    eye: "text-green-800",
    netColor: "text-green-700",
    balBg: "bg-green-50",
    eye2: "text-green-800",
    netLabel: "Net credited",
    detailsTitle: "Deposit details",
  },
  wd: {
    title: "Withdrawal details",
    icon: "download",
    soft: "bg-danger-soft",
    line: "border-danger/30",
    strong: "text-danger-text",
    eye: "text-danger-text",
    netColor: "text-danger-text",
    balBg: "bg-canvas",
    eye2: "text-text-muted",
    netLabel: "Total taken out",
    detailsTitle: "Withdrawal details",
  },
  tr: {
    title: "Transfer details",
    icon: "refresh-cw",
    soft: "bg-info-soft",
    line: "border-info/30",
    strong: "text-info-text",
    eye: "text-info-text",
    netColor: "text-info-text",
    balBg: "bg-canvas",
    eye2: "text-text-muted",
    netLabel: "Total out of",
    detailsTitle: "Transfer details",
  },
};

interface View {
  look: Look;
  kind: "deposit" | "withdrawal" | "transfer";
  ref: string;
  reversed: boolean;
  revWho: string;
  confirmText: string;
  status: string;
  tone: string;
  amtLabel: string;
  amount: string;
  account: string;
  method: string;
  when: string;
  gross: string;
  fee: string;
  netLabel: string;
  net: string;
  afterText: string;
  afterBig: boolean;
  bankRef: string;
  desc: string;
  statusText: string;
  statusNote: string;
  who: string;
  notes: string;
}

const sum = (list: LedgerEntry[]) => list.reduce((a, e) => a + e.amt, 0);

/** Ledger sum on `account` newer than the first (newest) line matching `match` (design `newer`). */
function newer(ledger: LedgerEntry[], account: string, match: (e: LedgerEntry) => boolean, skip: (e: LedgerEntry) => boolean = () => false) {
  const first = ledger.findIndex(match);
  return first < 0 ? 0 : sum(ledger.slice(0, first).filter((e) => e.account === account && !skip(e)));
}

/** Builds the `dv` object for a DEP- / WDL- / TRN- reference, or undefined if there is no such record. */
export function useMoveView(ref: string): View | undefined {
  const deposits = useDeposits();
  const withdrawals = useWithdrawals();
  const transfers = useMoneyTransfers();
  const ledger = useLedger();
  const accounts = useAccounts();
  const bal = (name: string) => accounts.find((a) => a.name === name)?.balance;

  const dep = deposits.find((d) => d.ref === ref);
  if (dep) {
    const net = dep.amount - dep.fee;
    const b = bal(dep.account);
    const after = b === undefined ? net : b - newer(ledger, dep.account, (e) => e.ref === ref && e.account === dep.account && e.kind === "Deposit", (e) => e.ref === ref && e.kind === "Fee");
    const rev = dep.reversed;
    return {
      look: LOOK.dep,
      kind: "deposit",
      ref,
      reversed: !!rev,
      revWho: rev?.who || "—",
      confirmText: `Reverse this deposit? KES ${fmt2(net)} will be taken back out of ${dep.account}. This can't be undone.`,
      status: dep.status.label,
      tone: dep.status.tone,
      amtLabel: rev ? "Amount credited (reversed)" : "Amount credited",
      amount: fmt2(dep.amount),
      account: dep.account,
      method: dep.method,
      when: docDate(dep.date) + (dep.time ? `, ${dep.time}` : ""),
      gross: fmt2(dep.amount),
      fee: dep.fee ? `−${fmt2(dep.fee)}` : "0.00",
      netLabel: LOOK.dep.netLabel,
      net: fmt2(net),
      afterText: `KES ${fmt2(after)}`,
      afterBig: true,
      bankRef: dep.bankRef || "None",
      desc: dep.description || "—",
      statusText: rev ? "Reversed" : "Money received",
      statusNote: rev ? `Reversed on ${rev.when}. The money was taken back out of ${dep.account}.` : `This money is in ${dep.account} and counts in its balance.`,
      who: dep.who || "—",
      notes: dep.notes,
    };
  }
  const wd = withdrawals.find((w) => w.ref === ref);
  if (wd) {
    const out = wd.amount + wd.fee;
    const b = bal(wd.account);
    const after = b === undefined ? 0 : b - newer(ledger, wd.account, (e) => e.ref === ref && e.account === wd.account && (e.kind === "Withdrawal" || e.kind === "Fee"));
    const rev = wd.reversed;
    return {
      look: LOOK.wd,
      kind: "withdrawal",
      ref,
      reversed: !!rev,
      revWho: rev?.who || "—",
      confirmText: `Reverse this withdrawal? KES ${fmt2(out)} will be put back into ${wd.account}. This can't be undone.`,
      status: wd.status.label,
      tone: wd.status.tone,
      amtLabel: rev ? "Total outflow (reversed)" : "Total outflow",
      amount: fmt2(out),
      account: wd.account,
      method: wd.method,
      when: docDate(wd.date) + (wd.time ? `, ${wd.time}` : ""),
      gross: fmt2(wd.amount),
      fee: wd.fee ? `+${fmt2(wd.fee)}` : "0.00",
      netLabel: LOOK.wd.netLabel,
      net: fmt2(out),
      afterText: `KES ${fmt2(after)}`,
      afterBig: true,
      bankRef: wd.bankRef || "None",
      desc: (wd.description || "—") + (wd.purpose && wd.purpose !== "—" ? ` (${wd.purpose})` : ""),
      statusText: rev ? "Reversed" : "Money paid out",
      statusNote: rev ? `Reversed on ${rev.when}. The money was put back into ${wd.account}.` : `This money has left ${wd.account} and is out of its balance.`,
      who: wd.who || "—",
      notes: wd.notes,
    };
  }
  const tr = transfers.find((t) => t.ref === ref);
  if (tr) {
    const after = (name: string) => {
      const b = bal(name);
      return b === undefined ? 0 : b - newer(ledger, name, (e) => e.ref === ref && e.account === name);
    };
    const rev = tr.reversed;
    return {
      look: LOOK.tr,
      kind: "transfer",
      ref,
      reversed: !!rev,
      revWho: rev?.who || "—",
      confirmText: `Reverse this transfer? KES ${fmt2(tr.amount)} goes back from ${tr.to} to ${tr.from}${tr.fee ? `, and the KES ${fmt2(tr.fee)} fee is put back` : ""}. This can't be undone.`,
      status: tr.status.label,
      tone: tr.status.tone,
      amtLabel: rev ? "Amount moved (reversed)" : "Amount moved",
      amount: fmt2(tr.amount),
      account: `${tr.from} → ${tr.to}`,
      method: "Account transfer",
      when: docDate(tr.date) + (tr.time ? `, ${tr.time}` : ""),
      gross: fmt2(tr.amount),
      fee: tr.fee ? `+${fmt2(tr.fee)}` : "0.00",
      netLabel: `Total out of ${tr.from}`,
      net: fmt2(tr.amount + tr.fee),
      afterText: `${tr.from}: KES ${fmt2(after(tr.from))}\n${tr.to}: KES ${fmt2(after(tr.to))}`,
      afterBig: false,
      bankRef: tr.bankRef || "None",
      desc: tr.description || "—",
      statusText: rev ? "Reversed" : "Money moved",
      statusNote: rev ? `Reversed on ${rev.when}. The money went back to ${tr.from}.` : `Taken out of ${tr.from} and added to ${tr.to}.`,
      who: tr.who || "—",
      notes: tr.notes,
    };
  }
  return undefined;
}

/** Centred dialog with the design's record header (icon chip, title, ref, status pill, close). */
function RecordDialog({ label, header, footer, onClose, children }: { label: string; header: ReactNode; footer: ReactNode; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      } else if (e.key === "Tab") {
        const list = focusables();
        if (!list.length) return;
        const a = list[0]!;
        const z = list[list.length - 1]!;
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, []);
  return (
    <div className="fixed inset-0 z-[var(--z-drawer-stacked)] grid place-items-center bg-overlay p-4" onClick={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-[1000px] flex-col overflow-auto rounded-lg bg-surface shadow-lg"
      >
        {header}
        {children}
        {footer}
      </div>
    </div>
  );
}

const EYEBROW = "type-eyebrow text-text-muted";

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="type-body flex justify-between gap-3 text-text-secondary">
      <span>{label}</span>
      <span className="type-label text-right text-text [overflow-wrap:anywhere]">{value}</span>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-5 py-4">
      <div className={`${EYEBROW} flex items-center gap-2`}>
        <Icon name={icon} size={14} />
        {title}
      </div>
      {children}
    </div>
  );
}

export function MoveView({ view, onClose }: { view: View; onClose: () => void }) {
  const lk = view.look;
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const doReverse = async () => {
    if (busy) return;
    setBusy(true);
    const r = await reverseMove(view.kind, view.ref);
    setBusy(false);
    setConfirming(false);
    if (!r.ok) toast(r.message);
  };
  return (
    <RecordDialog
      label={lk.title}
      onClose={onClose}
      header={
        <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`grid size-10 flex-none place-items-center rounded-md ${lk.soft} ${lk.strong}`}>
              <Icon name={lk.icon} size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="type-card-title m-0 text-text">{lk.title}</h2>
              <div className="type-small u-num text-text-muted">{view.ref}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill tone={view.tone}>{view.status}</StatusPill>
            <IconButton icon="x" size="sm" label="Close" onClick={onClose} />
          </div>
        </div>
      }
      footer={
        <div className="flex justify-between gap-3 border-t border-border px-6 py-4">
          {view.reversed ? (
            <span />
          ) : confirming ? (
            <div className="flex gap-2">
              <Button variant="danger" icon="refresh-cw" disabled={busy} onClick={doReverse}>
                Yes, reverse it
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </div>
          ) : (
            <Button variant="danger" icon="refresh-cw" onClick={() => setConfirming(true)}>
              Reverse
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <div className={`flex min-w-0 flex-col gap-4 rounded-lg border p-5 sm:col-span-2 ${lk.soft} ${lk.line}`}>
            <div>
              <div className={`type-eyebrow ${lk.eye}`}>{view.amtLabel}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="type-title text-text-secondary">KES</span>
                <span className="u-num text-[36px] font-bold leading-[1.1] text-text">{view.amount}</span>
              </div>
            </div>
            <div className={`flex flex-wrap gap-5 border-t pt-4 ${lk.line}`}>
              {(
                [
                  ["Account", view.account],
                  ["Method", view.method],
                  ["Date", view.when],
                ] as const
              ).map(([l, v]) => (
                <div key={l}>
                  <div className={EYEBROW}>{l}</div>
                  <div className="type-label mt-0.5 text-text">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <div className={`${EYEBROW} flex items-center gap-2`}>
                <Icon name="landmark" size={14} />
                Money breakdown
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 px-5 py-4">
              <Line label="Amount" value={view.gross} />
              <div className="type-body flex justify-between text-text-secondary">
                <span>Fee</span>
                <span className="type-label u-num text-danger-text">{view.fee}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <span className="type-label text-text">{view.netLabel}</span>
                <span className={`type-title u-num ${lk.netColor}`}>{view.net}</span>
              </div>
            </div>
            <div className={`px-5 py-3 ${lk.balBg}`}>
              <div className={`type-eyebrow ${lk.eye2}`}>Account balance after</div>
              <div className={`u-num whitespace-pre-line text-text ${view.afterBig ? "type-title" : "type-label"}`}>{view.afterText}</div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <Panel icon="info" title={lk.detailsTitle}>
            <Line label="Reference number" value={view.bankRef} />
            <Line label="Description" value={view.desc} />
            <Line label="Recorded on" value={view.when} />
          </Panel>
          <Panel icon="circle-check" title="Status">
            <div className={`type-title flex items-center gap-2 ${view.reversed ? "text-danger-text" : "text-green-700"}`}>
              <Icon name={view.reversed ? "refresh-cw" : "circle-check"} size={18} />
              {view.statusText}
            </div>
            <div className="type-small text-text-secondary">{view.statusNote}</div>
          </Panel>
          <Panel icon="clock" title="History">
            <Line label="Recorded by" value={view.who} />
            <Line label="Ledger entry" value={view.ref} />
            {view.reversed && <Line label="Reversed by" value={view.revWho} />}
          </Panel>
        </div>
        <Panel icon="file-text" title="Notes">
          <div className={`type-body rounded-md bg-canvas px-4 py-3 ${view.notes ? "text-text" : "text-text-muted"}`}>{view.notes || "No notes added."}</div>
        </Panel>
        {confirming && !view.reversed && <div className="type-body rounded-lg border border-danger/30 bg-danger-soft px-5 py-4 text-text">{view.confirmText}</div>}
      </div>
    </RecordDialog>
  );
}
