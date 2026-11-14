"use client";
/** Integrations › M-Pesa bank integrations: collect M-Pesa through a bank till (feature 015, contracts/ui.md). */
import { useState } from "react";
import {
  INTEGRATION_BANKS,
  INTEGRATION_ENVS,
  bankErrors,
  saveBankCredentials,
  scopeFrom,
  testBankConnection,
  useBankConfig,
  useBankConfigs,
  useCan,
  useIntegrationScopes,
  useIntegrationTerminals,
  type BankField,
  type BankId,
  type IntegrationBank,
  type IntegrationEnv,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { CopyField, GRID, ScopeSelect, SectionHead } from "./shared";

export function BankScreen() {
  const [bankId, setBankId] = useState<BankId>(INTEGRATION_BANKS[0]!.id);
  const bank = INTEGRATION_BANKS.find((b) => b.id === bankId) ?? INTEGRATION_BANKS[0]!;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="type-title m-0 text-text">M-Pesa bank integrations</h2>
        <p className="type-body m-0 mt-1 text-text-muted">
          Collect M-Pesa payments through your bank. Pick a bank, enter the till details the bank gave you, and save. UzaPro then creates the credentials you give the bank in your instruction letter.
        </p>
      </div>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
        {INTEGRATION_BANKS.map((b) => (
          <BankTile key={b.id} bank={b} active={b.id === bankId} onPick={() => setBankId(b.id)} />
        ))}
      </div>
      <BankForm key={bank.id} bank={bank} />
    </div>
  );
}

function BankTile({ bank, active, onPick }: { bank: IntegrationBank; active: boolean; onPick: () => void }) {
  const configured = useBankConfigs(bank.id).length > 0;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onPick}
      className={`flex items-center gap-3 rounded-md border bg-surface px-4 py-3 text-left ${active ? "border-action bg-action-soft" : "border-border-strong hover:bg-surface-hover"}`}
    >
      <span className="grid size-9 flex-none place-items-center rounded-sm bg-grey-100 text-text-secondary">
        <Icon name="landmark" size={18} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="type-label text-text">{bank.name}</span>
        <span className="type-caption text-text-muted">{configured ? "Configured" : "Not configured"}</span>
      </span>
    </button>
  );
}

function BankForm({ bank }: { bank: IntegrationBank }) {
  const canWrite = useCan("write");
  const scopes = useIntegrationScopes(bank.id);
  const terminals = useIntegrationTerminals();
  const configs = useBankConfigs(bank.id);
  const [scopeText, setScopeText] = useState("");
  const scope = scopeFrom(scopeText);
  const saved = useBankConfig(bank.id, scope);
  const [env, setEnv] = useState<IntegrationEnv>(bank.envs[0] ?? "production");
  const [till, setTill] = useState("");
  const [qr, setQr] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<BankField, string>>>({});
  const [busy, setBusy] = useState<"" | "save" | "test">("");
  const short = bank.name.replace(/ Bank$/, "");

  const pickScope = (value: string) => {
    setScopeText(value);
    setErrors({});
    const next = configs.find((c) => String(c.scope) === value);
    if (next) {
      setEnv(next.env);
      setTill(next.tillNumber);
      setQr(next.qrTillCode);
    } else if (loaded) {
      setTill("");
      setQr("");
    }
    setLoaded(!!next);
    setDirty(false);
  };

  const save = async () => {
    const input = { scope, bank: bank.id, env, tillNumber: till, qrTillCode: qr };
    const found = bankErrors(input, terminals);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setBusy("save");
    const r = await saveBankCredentials(input);
    setBusy("");
    if (!r.ok) return setErrors({ scope: r.message });
    setLoaded(true);
    setDirty(false);
  };

  const test = async () => {
    if (scope === null) return;
    setBusy("test");
    await testBankConnection(bank.id, scope);
    setBusy("");
  };

  const off = !canWrite || busy !== "";
  const g = saved?.generated;
  const letter = `Put it in your ${short} letter`;
  const envs = INTEGRATION_ENVS.filter((e) => bank.envs.includes(e.value));

  return (
    <>
      <ScopeSelect value={scopeText} options={scopes} error={errors.scope} onChange={pickScope} />

      <SectionHead
        title={bank.name}
        steps={[
          { label: "Configured", done: !!saved },
          { label: "Connection tested", done: !!saved?.tested },
        ]}
      >
        Collect M-Pesa payments on your {short} till (paybill {bank.paybill}) with STK push and payment notifications.
      </SectionHead>
      <ul aria-label={`What ${bank.name} supports`} className="m-0 flex list-none flex-wrap gap-2 p-0">
        {bank.features.map((x) => (
          <li key={x}>
            <StatusPill dot={false}>{x}</StatusPill>
          </li>
        ))}
      </ul>

      <Card title="Environment" subtitle={bank.envs.includes("sandbox") ? "Live uses real money. Use the sandbox to try things out first." : `Live uses real money. ${short} has no test environment.`}>
        <div className={GRID}>
          <Select label="Environment" disabled={off || envs.length < 2} value={env} options={envs} onChange={(e) => (setEnv(e.target.value as IntegrationEnv), setDirty(true))} />
        </div>
      </Card>

      <Card title="STK push API" subtitle={`UzaPro signs in to ${short} with these to send STK pushes and create QR codes. Both are created for your business when you save; give them to ${short} in your instruction letter.`}>
        <div className={GRID}>
          <CopyField label="API username" value={g?.apiUsername} hint={`Created for your business by UzaPro. ${letter}.`} />
          <CopyField label="API secret key" secret value={g?.apiSecret} hint={`Created for your business by UzaPro and never shown. Copy it straight into your ${short} letter.`} />
          <Input label="Paybill number" readOnly value={bank.paybill} boxClassName="bg-grey-50" hint={`${short} till payments go through paybill ${bank.paybill}.`} />
          <Input
            label={`${short} till number`}
            required
            inputMode="numeric"
            disabled={off}
            value={till}
            error={errors.tillNumber}
            hint={`Your till number under ${bank.paybill}, for example 000001. Sent as the account number.`}
            onChange={(e) => (setTill(e.target.value), setDirty(true), setErrors((x) => ({ ...x, tillNumber: undefined })))}
          />
        </div>
      </Card>

      <Card title="Payment notifications" subtitle={`Give these to ${short} in your instruction letter. All four are created for your business when you save. ${short} must send notifications as JSON.`}>
        <div className={GRID}>
          <CopyField label="Notification URL" value={g?.notifyUrl} hint="Unique to your business." />
          <CopyField label="Notification username" value={g?.notifyUsername} hint={`${letter}; ${short} sends it with every payment notification.`} />
          <CopyField label="Notification password" secret value={g?.notifyPassword} hint={`Never shown. Copy it straight into your ${short} letter; ${short} sends it with every payment notification.`} />
          <CopyField label="Notification secret key" secret value={g?.notifySecret} hint={`Never shown. Copy it straight into your ${short} letter; it verifies every notification.`} />
        </div>
      </Card>

      <Card title="QR code" subtitle="Optional. Needed only to show dynamic payment QR codes.">
        <div className={GRID}>
          <Input
            label="QR till code"
            disabled={off}
            value={qr}
            error={errors.qrTillCode}
            hint={`The till code ${short} gave you for QR payments, for example PAY100D.`}
            onChange={(e) => (setQr(e.target.value), setDirty(true), setErrors((x) => ({ ...x, qrTillCode: undefined })))}
          />
        </div>
      </Card>

      {canWrite && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {saved && dirty && <span className="type-small mr-auto text-text-muted">Save your changes before you test them.</span>}
          <Button variant="secondary" icon="plug" disabled={!saved || dirty || busy !== ""} onClick={() => void test()}>
            {busy === "test" ? "Testing" : "Test connection"}
          </Button>
          <Button icon="check" disabled={busy !== ""} onClick={() => void save()}>
            Save credentials
          </Button>
        </div>
      )}
    </>
  );
}
