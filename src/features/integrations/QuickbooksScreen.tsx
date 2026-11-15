"use client";
/** Integrations › QuickBooks: send sales, customers and expenses to the business's QuickBooks company (feature 015, contracts/ui.md). */
import { useState } from "react";
import {
  INTEGRATION_ENVS,
  QB_ACCOUNTS,
  QB_COMPANIES,
  QB_ACCOUNT_LABEL,
  QB_FREQUENCIES,
  QB_RECORDS,
  connectQuickbooks,
  disconnectQuickbooks,
  quickbooksErrors,
  retryQuickbooks,
  saveQuickbooksSettings,
  syncQuickbooks,
  syncSummary,
  useCan,
  useQuickbooks,
  type IntegrationEnv,
  type QbAccountField,
  type QbFrequency,
  type QuickbooksConnection,
  type QuickbooksField,
  type QuickbooksSettings,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { ConfirmDialog } from "@/components/ui/Overlay";
import { FormError, GRID, SectionHead } from "./shared";

export function QuickbooksScreen() {
  const connection = useQuickbooks();
  return (
    <div className="flex flex-col gap-4">
      <SectionHead
        title="QuickBooks"
        steps={[
          { label: "Connected", done: !!connection },
          { label: "Synced", done: !!connection?.lastSync },
        ]}
      >
        Send your invoices, payments, customers and expenses to QuickBooks Online so your accountant works from the same figures.
      </SectionHead>
      {connection ? <Connected key={connection.companyId} connection={connection} /> : <Connect />}
    </div>
  );
}

function Connect() {
  const canWrite = useCan("write");
  const [env, setEnv] = useState<IntegrationEnv>("production");
  const [busy, setBusy] = useState(false);
  /** Signed in to Intuit, choosing the company (design `iq.picking`). */
  const [picking, setPicking] = useState(false);
  const connect = async () => {
    setBusy(true);
    await connectQuickbooks(env);
    setBusy(false);
  };
  if (picking) {
    const co = QB_COMPANIES[env];
    return (
      <Card title="Choose your company" subtitle="Signed in to Intuit. Pick the company UzaPro should send to.">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void connect()}
            className="flex w-full items-center gap-3 rounded-md border border-border bg-surface p-3 text-left hover:border-green-600 hover:bg-green-50"
          >
            <span aria-hidden="true" className="type-label grid size-10 flex-none place-items-center rounded-md bg-green-100 font-bold text-green-800">
              {co.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="type-label text-text">{co.name}</span>
              <span className="type-small text-text-muted">{co.sub}</span>
            </span>
            <Icon name="chevron-right" size={16} />
          </button>
          <p className="type-small m-0 text-text-muted">Simulated sign-in. The live app opens Intuit&apos;s own sign-in page.</p>
          <div>
            <Button variant="secondary" disabled={busy} onClick={() => setPicking(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card title="Connect your QuickBooks company" subtitle="You sign in to QuickBooks and choose the company. UzaPro never sees your QuickBooks password.">
      <div className={GRID}>
        <Select
          label="Environment"
          disabled={!canWrite || busy}
          value={env}
          options={INTEGRATION_ENVS}
          hint="Use the sandbox to try things out with a QuickBooks test company."
          onChange={(e) => setEnv(e.target.value as IntegrationEnv)}
        />
      </div>
      {canWrite ? (
        <div className="mt-5">
          <Button icon="arrow-up-right" onClick={() => setPicking(true)}>
            Connect QuickBooks
          </Button>
        </div>
      ) : (
        <p className="type-small m-0 mt-4 text-text-muted">QuickBooks is not connected.</p>
      )}
    </Card>
  );
}

function Connected({ connection }: { connection: QuickbooksConnection }) {
  const canWrite = useCan("write");
  const canDelete = useCan("delete");
  const [f, setF] = useState<QuickbooksSettings>(connection.settings);
  const [errors, setErrors] = useState<Partial<Record<QuickbooksField, string>>>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<"" | "save" | "sync">("");
  const [asking, setAsking] = useState(false);
  const off = !canWrite || busy !== "";
  const env = INTEGRATION_ENVS.find((e) => e.value === connection.env)?.label ?? connection.env;

  const patch = (p: Partial<QuickbooksSettings>) => {
    setF((cur) => ({ ...cur, ...p }));
    setDirty(true);
    setErrors({});
  };

  const save = async () => {
    const found = quickbooksErrors(f);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setBusy("save");
    const r = await saveQuickbooksSettings(f);
    setBusy("");
    if (r.ok) setDirty(false);
  };

  const sync = async () => {
    setBusy("sync");
    await syncQuickbooks();
    setBusy("");
  };

  const accounts = QB_RECORDS.filter((r) => r.account && f.send[r.id]).map((r) => r.account as QbAccountField);

  return (
    <>
      <Card title="Connection">
        <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {[
            ["Company", connection.companyName],
            ["Company ID", connection.companyId],
            ["Environment", env],
            ["Last sync", connection.lastSync ? `${connection.lastSync.at} · ${syncSummary(connection.lastSync.counts)}` : "Not synced yet"],
          ].map(([term, value]) => (
            <div key={term} className="min-w-0">
              <dt className="type-caption text-text-muted">{term}</dt>
              <dd className="type-body m-0 break-words text-text">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card title="What to send" subtitle="UzaPro sends these to QuickBooks. Nothing is brought back from QuickBooks.">
        <fieldset className="m-0 grid grid-cols-1 gap-3 border-0 p-0 sm:grid-cols-2">
          <legend className="sr-only">What to send</legend>
          {QB_RECORDS.map((r) => (
            <Checkbox key={r.id} label={r.label} hint={r.hint} disabled={off} checked={f.send[r.id]} onChange={(v) => patch({ send: { ...f.send, [r.id]: v } })} />
          ))}
        </fieldset>
        <div className="mt-3">
          <FormError text={errors.send ?? ""} />
        </div>
      </Card>

      {accounts.length > 0 && (
        <Card title="QuickBooks accounts" subtitle="Where each kind of record lands in your QuickBooks chart of accounts.">
          <div className={GRID}>
            {accounts.map((a) => (
              <Select
                key={a}
                label={QB_ACCOUNT_LABEL[a]}
                required
                disabled={off}
                value={f[a]}
                error={errors[a]}
                options={[{ value: "", label: "Choose an account" }, ...QB_ACCOUNTS[a]]}
                onChange={(e) => patch({ [a]: e.target.value })}
              />
            ))}
          </div>
        </Card>
      )}

      <Card title="When to send">
        <div className={GRID}>
          <Select label="Send to QuickBooks" disabled={off} value={f.frequency} options={QB_FREQUENCIES} onChange={(e) => patch({ frequency: e.target.value as QbFrequency })} />
        </div>
      </Card>

      {canWrite && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {dirty && <span className="type-small mr-auto text-text-muted">Save your changes before you sync.</span>}
          {canDelete && (
            <Button variant="ghost" disabled={busy !== ""} onClick={() => setAsking(true)}>
              Disconnect
            </Button>
          )}
          <Button variant="secondary" icon="refresh-cw" disabled={dirty || busy !== ""} onClick={() => void sync()}>
            {busy === "sync" ? "Syncing…" : "Sync now"}
          </Button>
          <Button icon="check" disabled={busy !== ""} onClick={() => void save()}>
            Save settings
          </Button>
        </div>
      )}

      {connection.log.length > 0 && (
        <Card title="Sync history">
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {connection.log.map((l, i) => (
              <li key={`${l.when}-${i}`} className="flex items-start gap-3">
                <span className={l.failed ? "text-danger-text" : "text-green-700"}>
                  <Icon name={l.failed ? "circle-alert" : "circle-check"} size={16} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="type-label text-text">{l.title}</span>
                  <span className="type-small text-text-muted">{l.detail}</span>
                </span>
                <span className="type-small whitespace-nowrap text-text-muted">{l.when}</span>
                {l.failed && canWrite && (
                  <Button size="sm" variant="secondary" onClick={() => void retryQuickbooks(i)}>
                    Retry
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        open={asking}
        title="Disconnect QuickBooks?"
        message={`UzaPro stops sending to ${connection.companyName}. What was already sent stays in QuickBooks.`}
        confirmLabel="Disconnect"
        onClose={() => setAsking(false)}
        onConfirm={() => {
          setAsking(false);
          void disconnectQuickbooks();
        }}
      />
    </>
  );
}
