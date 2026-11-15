"use client";
/** Integrations › M-Pesa (Daraja): the business's own Paybill or Till credentials (feature 015, contracts/ui.md). */
import { useState } from "react";
import {
  DARAJA_ACCOUNT_TYPES,
  INTEGRATION_ENVS,
  darajaErrors,
  registerDarajaUrls,
  saveDarajaCredentials,
  scopeFrom,
  testDarajaConnection,
  useCan,
  useDarajaConfig,
  useDarajaConfigs,
  useIntegrationScopes,
  useIntegrationTerminals,
  type DarajaAccountType,
  type DarajaConfig,
  type DarajaField,
  type DarajaInput,
  type IntegrationEnv,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { MpesaPayments } from "./MpesaPayments";
import { FormError, GRID, ScopeSelect, SecretInput, SectionHead } from "./shared";

interface AccountRow {
  id: number;
  terminal: string;
  accountNumber: string;
}

type Form = Omit<DarajaInput, "scope" | "terminalAccounts"> & { rows: AccountRow[] };

let rowId = 0;

const BLANK: Form = {
  env: "production",
  accountType: "paybill",
  paybill: "",
  storeNumber: "",
  tillNumber: "",
  accountNumber: "",
  rows: [],
  consumerKey: "",
  consumerSecret: "",
  passkey: "",
  initiatorName: "",
  initiatorPassword: "",
};

const fromConfig = (c: DarajaConfig): Form => ({
  ...BLANK,
  env: c.env,
  accountType: c.accountType,
  paybill: c.paybill,
  storeNumber: c.storeNumber,
  tillNumber: c.tillNumber,
  accountNumber: c.accountNumber,
  rows: c.terminalAccounts.map((r) => ({ id: ++rowId, terminal: String(r.terminalId), accountNumber: r.accountNumber })),
  initiatorName: c.initiatorName,
});

export function DarajaScreen() {
  const canWrite = useCan("write");
  const scopes = useIntegrationScopes();
  const terminals = useIntegrationTerminals();
  // Design: the form opens on the whole business, with its saved set-up.
  const [scopeText, setScopeText] = useState("all");
  const scope = scopeFrom(scopeText);
  const saved = useDarajaConfig(scope);
  const businessWide = useDarajaConfig("all");
  const [f, setF] = useState<Form>(() => (businessWide ? fromConfig(businessWide) : BLANK));
  /** True while the form shows a saved config, so switching away clears it. */
  const [loaded, setLoaded] = useState(!!businessWide);
  const [errors, setErrors] = useState<Partial<Record<DarajaField, string>>>({});
  const [busy, setBusy] = useState<"" | "save" | "test" | "register">("");
  /** Edits since the last save: the test and register buttons act on what is saved. */
  const [dirty, setDirty] = useState(false);
  const configs = useDarajaConfigs();

  const patch = (p: Partial<Form>, clear?: DarajaField) => {
    setF((cur) => ({ ...cur, ...p }));
    setDirty(true);
    if (clear) setErrors((e) => ({ ...e, [clear]: undefined }));
  };

  const pickScope = (value: string) => {
    setScopeText(value);
    setErrors({});
    const next = configs.find((c) => String(c.scope) === value);
    if (next) setF(fromConfig(next));
    else if (loaded) setF(BLANK);
    setLoaded(!!next);
    setDirty(false);
  };

  const input = (): DarajaInput => {
    const { rows, ...rest } = f;
    return { ...rest, scope, terminalAccounts: rows.map((r) => ({ terminalId: Number(r.terminal) || 0, accountNumber: r.accountNumber })) };
  };

  const save = async () => {
    const data = input();
    const found = darajaErrors(data, saved, terminals);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setBusy("save");
    const r = await saveDarajaCredentials(data);
    setBusy("");
    if (!r.ok) return setErrors({ scope: r.message });
    setF(fromConfig(r.value));
    setLoaded(true);
    setDirty(false);
  };

  const run = async (kind: "test" | "register") => {
    if (scope === null) return;
    setBusy(kind);
    await (kind === "test" ? testDarajaConnection(scope) : registerDarajaUrls(scope));
    setBusy("");
  };

  const paybill = f.accountType === "paybill";
  const off = !canWrite || busy !== "";
  const set = saved?.secretsSet;
  const used = new Set(f.rows.map((r) => r.terminal));

  return (
    <div className="flex flex-col gap-4">
      <SectionHead
        title="M-Pesa (Daraja)"
        steps={[
          { label: "Configured", done: !!saved },
          { label: "Connection tested", done: !!saved?.tested },
          { label: "Payment URLs registered", done: !!saved?.urlsRegistered },
        ]}
      >
        Connect your own Paybill or Till so point of sale payments go straight to your M-Pesa account.
      </SectionHead>

      <ScopeSelect value={scopeText} options={scopes} error={errors.scope} onChange={pickScope} />

      <Card title="M-Pesa account">
        <div className={GRID}>
          <Select label="Environment" disabled={off} value={f.env} options={INTEGRATION_ENVS} onChange={(e) => patch({ env: e.target.value as IntegrationEnv })} />
          <Select label="Account type" disabled={off} value={f.accountType} options={DARAJA_ACCOUNT_TYPES} onChange={(e) => (patch({ accountType: e.target.value as DarajaAccountType }), setErrors({}))} />
          {paybill ? (
            <Input label="Paybill number" required inputMode="numeric" disabled={off} value={f.paybill} error={errors.paybill} onChange={(e) => patch({ paybill: e.target.value }, "paybill")} />
          ) : (
            <>
              <Input
                label="Store number (head office)"
                required
                inputMode="numeric"
                disabled={off}
                value={f.storeNumber}
                error={errors.storeNumber}
                hint="For a Till, STK requests use your store number, and payments go to the till number."
                onChange={(e) => patch({ storeNumber: e.target.value }, "storeNumber")}
              />
              <Input label="Till number" required inputMode="numeric" disabled={off} value={f.tillNumber} error={errors.tillNumber} onChange={(e) => patch({ tillNumber: e.target.value }, "tillNumber")} />
            </>
          )}
        </div>
      </Card>

      {paybill && (
        <Card title="Account numbers (optional)" subtitle="The account number customers pay into on your Paybill. Leave it empty to use each sale's number.">
          <div className={GRID}>
            <Input label="Account number" disabled={off} value={f.accountNumber} error={errors.accountNumber} placeholder="Uses the sale number when empty" onChange={(e) => patch({ accountNumber: e.target.value }, "accountNumber")} />
          </div>
          {scope === "all" || scope === null ? (
            <fieldset className="m-0 mt-5 flex flex-col gap-2 border-0 p-0">
              <legend className="type-label mb-1 p-0 text-text">Per-terminal account numbers</legend>
              <p className="type-caption m-0 mb-1 text-text-muted">Give a terminal its own account number. Terminals not listed here use the account number above.</p>
              {f.rows.map((r, i) => (
                <div key={r.id} className="grid max-w-[640px] items-end gap-2" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) 34px" }}>
                  <Select
                    label={i === 0 ? "Terminal" : undefined}
                    aria-label="Terminal"
                    disabled={off}
                    value={r.terminal}
                    options={[{ value: "", label: "Choose a terminal" }, ...terminals.filter((t) => String(t.id) === r.terminal || !used.has(String(t.id))).map((t) => ({ value: String(t.id), label: t.name }))]}
                    onChange={(e) => patch({ rows: f.rows.map((x) => (x.id === r.id ? { ...x, terminal: e.target.value } : x)) }, "terminalAccounts")}
                  />
                  <Input
                    label={i === 0 ? "Account number" : undefined}
                    aria-label="Terminal account number"
                    disabled={off}
                    value={r.accountNumber}
                    onChange={(e) => patch({ rows: f.rows.map((x) => (x.id === r.id ? { ...x, accountNumber: e.target.value } : x)) }, "terminalAccounts")}
                  />
                  {canWrite ? <IconButton icon="trash-2" size="sm" label="Remove terminal" disabled={off} onClick={() => patch({ rows: f.rows.filter((x) => x.id !== r.id) }, "terminalAccounts")} /> : <span />}
                </div>
              ))}
              <FormError text={errors.terminalAccounts ?? ""} />
              {canWrite && (
                <div>
                  <Button variant="secondary" size="sm" icon="plus" disabled={off || f.rows.length >= terminals.length} onClick={() => patch({ rows: [...f.rows, { id: ++rowId, terminal: "", accountNumber: "" }] })}>
                    Add terminal
                  </Button>
                </div>
              )}
            </fieldset>
          ) : null}
        </Card>
      )}

      <Card title="Daraja API keys" subtitle="Find these on your Daraja app. Saved keys are never shown again.">
        <div className={GRID}>
          <SecretInput label="Consumer key" required saved={!!set?.consumerKey} disabled={off} value={f.consumerKey} error={errors.consumerKey} onChange={(e) => patch({ consumerKey: e.target.value }, "consumerKey")} />
          <SecretInput label="Consumer secret" required saved={!!set?.consumerSecret} disabled={off} value={f.consumerSecret} error={errors.consumerSecret} onChange={(e) => patch({ consumerSecret: e.target.value }, "consumerSecret")} />
          <SecretInput label="Lipa na M-Pesa Online passkey" required saved={!!set?.passkey} disabled={off} value={f.passkey} error={errors.passkey} onChange={(e) => patch({ passkey: e.target.value }, "passkey")} />
        </div>
      </Card>

      <Card title="Initiator (optional)" subtitle="Needed only for refunds, payouts and balance checks.">
        <div className={GRID}>
          <Input label="Initiator name" autoComplete="off" disabled={off} value={f.initiatorName} onChange={(e) => patch({ initiatorName: e.target.value }, "initiatorPassword")} />
          <SecretInput label="Initiator password" saved={!!set?.initiatorPassword} disabled={off} value={f.initiatorPassword} error={errors.initiatorPassword} onChange={(e) => patch({ initiatorPassword: e.target.value }, "initiatorPassword")} />
        </div>
      </Card>

      {canWrite && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {saved && dirty && <span className="type-small mr-auto text-text-muted">Save your changes before you test them.</span>}
          <Button variant="secondary" icon="plug" disabled={!saved || dirty || busy !== ""} onClick={() => void run("test")}>
            {busy === "test" ? "Testing" : "Test connection"}
          </Button>
          <Button variant="secondary" icon="link" disabled={!saved?.tested || dirty || busy !== ""} onClick={() => void run("register")}>
            {busy === "register" ? "Registering" : "Register payment URLs"}
          </Button>
          <Button icon="check" disabled={busy !== ""} onClick={() => void save()}>
            Save credentials
          </Button>
        </div>
      )}
      {scope === "all" && businessWide && <MpesaPayments config={businessWide} />}
    </div>
  );
}
