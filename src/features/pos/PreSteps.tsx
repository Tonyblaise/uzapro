"use client";
/** The till's entry steps (design `ps.pre`): step bar, open shift, and the PIN login. */
import { useEffect, useRef } from "react";
import { ROLES, ROLE_IDS } from "@/config/roles";
import { POS_FLOATS, continueToPin, exitTill, openShift, pickSeller, pressPin, setFloatDraft, usePos, type Terminal } from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Field";
import { Eyebrow, UMark, avatar } from "./shared";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clr", "0", "del"];

export function PreSteps({ term }: { term: Terminal }) {
  const { ui, shifts } = usePos();
  const sh = shifts[term.id] ?? { open: false, refs: [] };
  const stepIdx = ui.step === "pin" ? 2 : 1;
  const pad = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ui.step === "pin" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "")) pad.current?.focus();
  }, [ui.step]);

  return (
    <div className="fixed inset-0 z-[250] flex flex-col overflow-auto" role="dialog" aria-modal="true" aria-label={`${term.name} till`} style={{ background: "radial-gradient(1200px 600px at 90% -10%, var(--green-50), transparent 60%), var(--surface)" }}>
      <div className="flex items-center gap-3 border-b border-border bg-surface/70 px-5 py-3 backdrop-blur">
        <UMark />
        <button type="button" onClick={exitTill} className="type-label inline-flex items-center gap-1.5 border-0 bg-transparent text-text">
          <Icon name="arrow-left" size={16} />
          Back to UzaPro
        </button>
        <span className="flex-1" />
        <span className="type-small text-right text-text-secondary">
          {term.name} · {term.branch || "Any branch"} · {term.store}
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
        <ol aria-label="Steps" className="m-0 flex list-none flex-wrap items-center justify-center gap-3 p-0">
          {["Terminal", "Open shift", "PIN"].map((label, i) => {
            const done = i < stepIdx;
            const cur = i === stepIdx;
            return (
              <li key={label} className="flex items-center gap-3" aria-current={cur ? "step" : undefined}>
                {i > 0 && <span aria-hidden="true" className={`h-0.5 w-14 rounded ${i <= stepIdx ? "bg-green-500" : "bg-border"}`} />}
                <span
                  className={`grid size-9 place-items-center rounded-full border-2 font-bold ${cur ? "border-transparent bg-[linear-gradient(135deg,var(--green-500),var(--green-700))] text-white shadow-[var(--shadow-charge)]" : done ? "border-green-200 bg-green-50 text-green-700" : "border-border bg-surface text-text-muted"}`}
                >
                  {done ? <Icon name="check" size={16} /> : i + 1}
                </span>
                <span className={`type-label uppercase tracking-[0.06em] ${cur || done ? "text-text" : "text-text-muted"}`}>{label}</span>
              </li>
            );
          })}
        </ol>

        {ui.step === "shift" && (
          <>
            <div className="text-center">
              <Eyebrow>Point of sale</Eyebrow>
              <h1 className="m-0 mt-1.5 text-[32px] font-extrabold tracking-[-0.02em] text-text">{sh.open ? "This shift is already open" : "Open a new shift"}</h1>
              <p className="type-body m-0 mt-2 text-text-secondary">{sh.open ? "Carry on where it left off." : `Record the cash in the drawer to start selling on ${term.name}.`}</p>
            </div>
            <div className="flex w-full max-w-[440px] flex-col gap-4 rounded-[20px] border border-border bg-surface p-6 shadow-[var(--shadow-pos)]">
              {sh.open ? (
                <>
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-warning-soft text-warning-text">
                      <Icon name="clock" size={20} />
                    </span>
                    <div>
                      <div className="type-label text-text">Shift opened by {sh.by}</div>
                      <div className="type-small text-text-secondary">
                        {sh.date}, {sh.at} · opening cash KES {Number(sh.float || 0).toLocaleString("en-KE")}
                      </div>
                    </div>
                  </div>
                  <Button size="lg" icon="chevron-right" fullWidth onClick={continueToPin}>
                    Continue to PIN
                  </Button>
                </>
              ) : (
                <form
                  className="flex flex-col gap-4"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    openShift();
                  }}
                >
                  <Input label="Opening cash in the drawer (KES)" type="number" min={0} placeholder="0.00" value={ui.floatDraft} onChange={(e) => setFloatDraft(e.target.value)} />
                  <div className="flex flex-wrap gap-2">
                    {POS_FLOATS.map((n) => (
                      <button key={n} type="button" onClick={() => setFloatDraft(String(n))} className="type-small rounded-pill border border-border bg-canvas px-3 py-1.5 font-semibold text-text">
                        KES {n.toLocaleString("en-KE")}
                      </button>
                    ))}
                  </div>
                  <div className="type-small text-text-secondary">Count the notes and coins in the drawer before you start. You&apos;ll count again when you close the shift.</div>
                  <Button type="submit" size="lg" icon="check" fullWidth>
                    Open shift
                  </Button>
                </form>
              )}
            </div>
          </>
        )}

        {ui.step === "pin" && (
          <>
            <div className="text-center">
              <Eyebrow>Secure login</Eyebrow>
              <h1 className="m-0 mt-1.5 text-[32px] font-extrabold tracking-[-0.02em] text-text">{term.name}</h1>
              <p className="type-body m-0 mt-2 text-text-secondary">Pick your name, then enter your 4-digit PIN</p>
            </div>
            <div className="uz-pinwrap grid w-full max-w-[860px] items-start gap-5" style={{ gridTemplateColumns: "minmax(0,1fr) 380px" }}>
              <div className="flex flex-col gap-2.5">
                <Eyebrow>Who is selling?</Eyebrow>
                {ROLE_IDS.map((id, i) => {
                  const r = ROLES[id];
                  const on = r.name === ui.pinWho;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => pickSeller(r.name)}
                      className={`flex items-center gap-4 rounded-[18px] border-2 px-[18px] py-4 text-left transition-colors ${on ? "border-green-600 bg-green-50" : "border-border bg-surface"}`}
                    >
                      <span aria-hidden="true" className="grid size-[52px] flex-none place-items-center rounded-full text-[20px] font-bold" style={avatar(i)}>
                        {r.name[0]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[18px] font-semibold text-text">{r.name}</span>
                        <span className="type-small block text-text-secondary">
                          {r.role}
                          {r.name === sh.by ? " · opened this shift" : ""}
                        </span>
                      </span>
                      {on && <Icon name="circle-check" size={22} className="text-green-700" />}
                    </button>
                  );
                })}
              </div>
              <div
                ref={pad}
                tabIndex={0}
                role="group"
                aria-label="Enter your PIN"
                onKeyDown={(e) => {
                  if (/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    pressPin(e.key);
                  } else if (e.key === "Backspace") {
                    e.preventDefault();
                    pressPin("del");
                  } else if (e.key === "Escape") pressPin("clr");
                }}
                className="flex flex-col gap-5 rounded-[24px] border border-border bg-surface p-6 shadow-[var(--shadow-pos)] outline-none focus-visible:ring-2 focus-visible:ring-green-600"
              >
                <div className="type-label text-center text-text-secondary">Enter your PIN</div>
                <div key={ui.shake} className={`flex justify-center gap-3.5 ${ui.pinErr ? "uz-shake" : ""}`} aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="size-[18px] rounded-full border-2 transition-all"
                      style={{ borderColor: ui.pinErr ? "var(--danger-text)" : i < ui.pin.length ? "var(--green-600)" : "var(--border-strong)", background: i < ui.pin.length ? "var(--green-600)" : "transparent" }}
                    />
                  ))}
                </div>
                <div className="sr-only" aria-live="polite">
                  {ui.pin.length} of 4 digits entered
                </div>
                {ui.pinErr && (
                  <div role="alert" className="type-small text-center text-danger-text">
                    {ui.pinErr}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2.5">
                  {KEYS.map((k) => {
                    const icon = k === "clr" ? "x" : k === "del" ? "arrow-left" : null;
                    return (
                      <button
                        key={k}
                        type="button"
                        aria-label={k === "clr" ? "Clear" : k === "del" ? "Delete" : k}
                        onClick={() => pressPin(k)}
                        className={`uz-key grid h-[60px] place-items-center rounded-[14px] border border-border text-[22px] font-medium text-text ${icon ? "bg-canvas" : "bg-surface"}`}
                      >
                        {icon ? <Icon name={icon} size={20} /> : k}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="type-small text-text-muted">Demo PIN: 1234</div>
          </>
        )}
      </div>
    </div>
  );
}
