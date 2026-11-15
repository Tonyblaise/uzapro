"use client";
/**
 * Integrations › M-Pesa bank integrations (design `ib`, feature 026): customers pay with M-Pesa to a
 * bank's Paybill; the money lands in the business's bank account and UzaPro records it. Lists the
 * linked accounts and adds new ones.
 */
import { useState } from "react";
import { BANK_FEEDS, BANK_PAYBILLS, addBankLink, paybillOf, removeBankLink, useAccountNames, useBankLinks, useBusinessProfile, useCan, type BankFeed } from "@/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import { FormError, GRID, SectionHead } from "./shared";

export function BankScreen() {
  const canWrite = useCan("write");
  const canDelete = useCan("delete");
  const links = useBankLinks();
  const accounts = useAccountNames();
  const biz = useBusinessProfile();
  const [bank, setBank] = useState(BANK_PAYBILLS[0]!.bank);
  const [account, setAccount] = useState("");
  const [name, setName] = useState(biz.name);
  const [deposit, setDeposit] = useState(accounts[0] ?? "");
  const [feed, setFeed] = useState<BankFeed>("Bank API (instant)");
  const [error, setError] = useState("");
  const paybill = paybillOf(bank);
  const active = links.filter((l) => l.status === "Active").length;
  const clear = () => setError("");

  const save = async () => {
    const r = await addBankLink({ bank, account, name, deposit, feed });
    if (!r.ok) return setError(r.message);
    setAccount("");
    setError("");
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHead
        title="M-Pesa bank integrations"
        steps={[
          { label: `${links.length} linked`, done: links.length > 0 },
          { label: `${active} active`, done: active > 0 },
        ]}
      >
        Customers pay with M-Pesa to your bank&apos;s Paybill. The money lands in your bank account and UzaPro records it against the sale.
      </SectionHead>

      <section aria-label="Linked bank accounts" className="overflow-hidden rounded-lg border border-border bg-surface">
        {links.map((b) => (
          <div key={`${b.bank}|${b.account}`} className="flex flex-wrap items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
            <span className="grid size-10 flex-none place-items-center rounded-md bg-green-50 text-green-700">
              <Icon name="landmark" size={20} />
            </span>
            <div className="min-w-[200px] flex-1">
              <div className="type-label text-text">
                {b.bank} <span className="font-normal text-text-muted">· Paybill {b.paybill}</span>
              </div>
              <div className="type-small text-text-muted">
                Account {b.account} · {b.name}
              </div>
            </div>
            <div className="type-small min-w-[200px] text-text-secondary">
              Customers pay: <strong className="text-text">Paybill {b.paybill}</strong>, account <strong className="text-text">{b.account}#SALE NO.</strong>
            </div>
            <div className="type-small text-text-secondary">
              Recorded in
              <br />
              <strong className="text-text">{b.deposit}</strong>
            </div>
            <StatusPill tone={b.status === "Active" ? "success" : "warning"}>{b.status}</StatusPill>
            {canDelete && <IconButton icon="trash-2" size="sm" label={`Remove ${b.bank} ${b.account}`} onClick={() => void removeBankLink(b.bank, b.account)} />}
          </div>
        ))}
        {links.length === 0 && <div className="type-body p-6 text-center text-text-muted">No bank integrations yet.</div>}
      </section>

      {canWrite && (
        <Card title="Add a bank integration" subtitle="Link a bank account so M-Pesa payments made to the bank's Paybill are recorded in UzaPro.">
          <div className="flex flex-col gap-4">
            <div className={GRID}>
              <SearchSelect label="Bank" noun="bank" options={BANK_PAYBILLS.map((b) => b.bank)} value={bank} onChange={(v) => (setBank(v), clear())} />
              <Input label="Paybill" value={paybill} disabled readOnly />
              <Input label="Bank account number" inputMode="numeric" placeholder="For example, 0180294833321" value={account} onChange={(e) => (setAccount(e.target.value.replace(/\s/g, "")), clear())} />
              <Input label="Account name" placeholder="As shown by the bank" value={name} onChange={(e) => (setName(e.target.value), clear())} />
              <SearchSelect label="Record payments in" noun="account" options={accounts} value={deposit} onChange={setDeposit} />
              <SearchSelect label="How payments reach UzaPro" noun="option" options={[...BANK_FEEDS]} value={feed} onChange={(v) => setFeed(v as BankFeed)} />
            </div>
            <div className="type-small rounded-md bg-canvas p-3 text-text-secondary">
              Customers will pay to Paybill {paybill}, account {account || "your account number"}#SALE NO.{" "}
              {feed === "Bank API (instant)" ? `Payments show in UzaPro within seconds once ${bank} turns on alerts for your account.` : "Upload the bank statement each day and UzaPro matches the payments."}
            </div>
            <FormError text={error} />
            <div>
              <Button icon="plus" onClick={() => void save()}>
                Add bank integration
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
