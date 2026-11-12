"use client";
/**
 * The design's account drawer (`isAccEdit`, `a*` fields), shared by "New account" and the card's
 * "Edit account": location and access, general details, institution details, the dark account
 * preview card and the till tip.
 */
import { useState } from "react";
import { ACCOUNT_TILLS, ACCOUNT_TYPES_EDIT, UZ_LOC, saveAccount, toast, useAccounts, useBanks, type AccountType } from "@/data";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { Icon } from "@/components/ui/Icon";
import { CRUMB, LOOKS, fmt } from "./shared";

export function AccountForm({ edit, onClose }: { edit: string; onClose: () => void }) {
  const accounts = useAccounts();
  const row = edit ? accounts.find((a) => a.name === edit) : undefined;
  if (edit && !row) return null;
  return <AccountFormBody key={edit} edit={row ? edit : ""} onClose={onClose} />;
}

function AccountFormBody({ edit, onClose }: { edit: string; onClose: () => void }) {
  const accounts = useAccounts();
  const banks = useBanks();
  const row = edit ? accounts.find((a) => a.name === edit) : undefined;
  // Design `accOpen(row)` defaults.
  const [branch, setBranch] = useState(row?.branch || "Nairobi HQ");
  const [till, setTill] = useState(row?.till || "All tills");
  const [name, setName] = useState(row?.name ?? "");
  const [type, setType] = useState<AccountType>(row?.type ?? "Bank");
  const [number, setNumber] = useState(row && row.number !== "—" ? row.number : "");
  const [opening, setOpening] = useState(String(row?.opening || 0));
  const [bank, setBank] = useState(row && row.provider !== "—" ? row.provider : "");
  const [bankBranch, setBankBranch] = useState(row?.bankBranch ?? "");
  const [swift, setSwift] = useState(row?.swift ?? "");
  const [iban, setIban] = useState(row?.iban ?? "");
  const [active, setActive] = useState(row ? row.active : true);
  const [newBranches, setNewBranches] = useState<string[]>([]);
  const [newBanks, setNewBanks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const trimmed = name.trim();
  const dup = accounts.some((a) => a.name.toLowerCase() === trimmed.toLowerCase() && a.name !== edit);
  const digits = number.replace(/\s/g, "");
  const blocked = !trimmed || dup || !branch;

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const r = await saveAccount({ name: trimmed, type, provider: bank, number, branch, till, opening: Number(opening) || 0, bankBranch, swift, iban, active }, edit);
    setBusy(false);
    if (r.ok) onClose();
    else toast(r.message);
  };

  const box = "flex flex-col gap-4 rounded-lg border border-border bg-surface p-5";
  const head = "type-title border-b border-border pb-3 text-text";
  const grid = "grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]";

  return (
    <Drawer open title={edit ? "Edit account" : "New account"} subtitle={CRUMB} onClose={onClose} width={9999}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="type-body text-text-secondary">Set up a bank, mobile money or cash account for your branches.</div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={blocked || busy} onClick={save}>
              {edit ? "Save changes" : "Add account"}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[1_1_620px] flex-col gap-4">
            <div className={box}>
              <div className={head}>Location and access</div>
              <div className={grid}>
                <SearchSelect
                  label="Branch"
                  noun="branch"
                  options={[...UZ_LOC.branches, ...newBranches]}
                  value={branch}
                  onChange={setBranch}
                  onCreate={(n) => {
                    setNewBranches((l) => [...l, n]);
                    return n;
                  }}
                />
                <SearchSelect label="Assigned till (optional)" options={ACCOUNT_TILLS} value={till} onChange={setTill} />
              </div>
            </div>
            <div className={box}>
              <div className={head}>General details</div>
              <div className={grid}>
                <Input label="Account name" placeholder="For example, KCB Business Account" value={name} onChange={(e) => setName(e.target.value)} />
                <SearchSelect label="Account type" options={ACCOUNT_TYPES_EDIT} value={type} onChange={(v) => setType(v as AccountType)} />
              </div>
              <div className={grid}>
                <Input label="Account number or code (optional)" placeholder="For example, 1234567890" value={number} onChange={(e) => setNumber(e.target.value)} />
                <Input label="Opening balance (KES)" type="number" value={opening} onChange={(e) => setOpening(e.target.value)} />
              </div>
              <Checkbox checked={active} onChange={setActive} label="Account is active" />
            </div>
            <div className={box}>
              <div className={head}>Institution details</div>
              <div className={grid}>
                <SearchSelect
                  label="Bank or provider (optional)"
                  noun="bank or provider"
                  options={[...banks, ...newBanks.filter((b) => !banks.includes(b))]}
                  value={bank}
                  onChange={setBank}
                  onCreate={(n) => {
                    setNewBanks((l) => [...l, n]);
                    return n;
                  }}
                />
                <Input label="Branch name (optional)" placeholder="For example, Westlands" value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} />
              </div>
              <div className={grid}>
                <Input label="SWIFT code (optional)" value={swift} onChange={(e) => setSwift(e.target.value)} />
                <Input label="IBAN (optional)" value={iban} onChange={(e) => setIban(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex min-w-[260px] flex-[0_1_360px] flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-lg bg-grey-900 p-5 text-white">
              <div className="flex justify-between gap-3">
                <div>
                  <div className="type-eyebrow text-grey-400">Account preview</div>
                  <div className="type-title mt-1 [overflow-wrap:anywhere]">{trimmed || "Account name"}</div>
                </div>
                <span className="grid size-[34px] flex-none place-items-center rounded-sm bg-white/12">
                  <Icon name={LOOKS[type]?.icon ?? "landmark"} size={18} />
                </span>
              </div>
              <div>
                <div className="type-eyebrow text-grey-400">Account number</div>
                <div className="type-title mt-1 tracking-[3px]">{digits ? `•••• ${digits.slice(-4)}` : "•••• •••• ••••"}</div>
              </div>
              <div className="flex justify-between gap-3 border-t border-white/15 pt-3">
                <div>
                  <div className="type-eyebrow text-grey-400">Institution</div>
                  <div className="type-label mt-0.5">{bank || "—"}</div>
                </div>
                <div className="text-right">
                  <div className="type-eyebrow text-grey-400">Opening balance</div>
                  <div className="type-label u-num mt-0.5">{fmt(Number(opening) || 0)}</div>
                </div>
              </div>
            </div>
            <div className="type-small rounded-lg bg-info-soft p-4 text-info-text">
              <b className="mb-1 block">Tip</b>
              Assigning a till to this account means cashiers on other tills will not see it, which avoids mistakes when counting money.
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
