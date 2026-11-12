"use client";
/**
 * The design's Profile screen (`isProfile`, `pf` and `pw`): the photo card, Personal information
 * and Address with Undo / "Save changes", and Change password with the five rule chips.
 */
import { useRef, useState, type ChangeEvent, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  CITIES,
  COUNTRIES,
  badEmail,
  changePassword,
  passwordRules,
  photoFileError,
  saveProfile,
  setPhoto,
  toast,
  useProfile,
  useRole,
  type ProfileDetails,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";

const KEYS = ["first", "last", "email", "phone", "country", "city", "address"] as const;

const PANEL = "flex flex-col gap-4 rounded-lg border border-border bg-surface p-5";
const GRID = "grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]";

function PanelHead({ icon, tile, title, note }: { icon: IconName; tile: string; title: string; note: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid size-10 flex-none place-items-center rounded-md ${tile}`}>
        <Icon name={icon} size={18} />
      </span>
      <div>
        <div className="type-title text-text">{title}</div>
        <div className="type-small text-text-secondary">{note}</div>
      </div>
    </div>
  );
}

export function ProfileScreen() {
  // Unsaved personal details (design `pfF`); the photo card shows the email being typed, as in the design.
  const [draft, setDraft] = useState<ProfileDetails | null>(null);
  return (
    <div className="flex flex-wrap items-start gap-5">
      <PhotoCard email={draft?.email} />
      <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-4">
        <DetailsForm draft={draft} setDraft={setDraft} />
        <PasswordForm />
      </div>
    </div>
  );
}

/** The design's `pf` email rule (`badEmail` in the data layer). */
const isBadEmail = (email: string) => !!email && badEmail(email);

// ---- Photo card -------------------------------------------------------------------------------

function PhotoCard({ email }: { email?: string }) {
  const saved = useProfile();
  const role = useRole();
  const file = useRef<HTMLInputElement>(null);
  const fullName = `${saved.first || ""} ${saved.last || ""}`.trim() || "Your name";
  const initials = ((saved.first || "?")[0]! + ((saved.last || "")[0] || "")).toUpperCase();

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const err = photoFileError(f);
    if (err) {
      toast(err);
      return;
    }
    const rd = new FileReader();
    rd.onload = () => void setPhoto(String(rd.result), f);
    rd.readAsDataURL(f);
  };

  return (
    <div className="min-w-0 max-w-[420px] flex-[1_1_300px] overflow-hidden rounded-lg border border-border bg-surface">
      <div className="h-24 bg-[linear-gradient(135deg,var(--green-500),var(--green-700))]" />
      <div className="-mt-12 flex flex-col items-center gap-2 px-5 pb-5 text-center">
        <div className="relative grid size-24 place-items-center overflow-hidden rounded-full border-4 border-surface bg-green-100 text-[32px] font-bold text-green-800 shadow-sm">
          {saved.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- a session data URL, not an optimisable asset
            <img src={saved.photo} alt="Profile photo" className="size-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="type-card-title mt-1 text-text">{fullName}</div>
        <div className="type-small text-text-secondary [overflow-wrap:anywhere]">{email ?? saved.email}</div>
        <StatusPill tone="success">{role.role || "Owner"}</StatusPill>
        <div className="type-caption mt-3 text-text-muted">JPG or PNG, up to 2 MB</div>
        <div className="flex w-full gap-2">
          <div className="flex-1">
            <Button variant="secondary" icon="image" fullWidth onClick={() => file.current?.click()}>
              Change photo
            </Button>
          </div>
          {saved.photo && <IconButton icon="trash-2" label="Remove photo" onClick={() => void setPhoto("")} />}
        </div>
        <input ref={file} type="file" accept=".jpg,.jpeg,.png" aria-label="Profile photo file" className="hidden" onChange={pick} />
      </div>
    </div>
  );
}

// ---- Personal information and address ----------------------------------------------------------

function DetailsForm({ draft, setDraft }: { draft: ProfileDetails | null; setDraft: Dispatch<SetStateAction<ProfileDetails | null>> }) {
  const saved = useProfile();
  const [newCities, setNewCities] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const f: ProfileDetails = draft ?? saved;
  const set = (k: keyof ProfileDetails) => (v: string) => setDraft((d) => ({ ...(d ?? saved), [k]: v }));
  const onInput = (k: keyof ProfileDetails) => (e: ChangeEvent<HTMLInputElement>) => set(k)(e.target.value);

  const bad = isBadEmail(f.email);
  const clean = KEYS.every((k) => (f[k] || "") === (saved[k] || ""));
  const blocked = clean || bad || !(f.first || "").trim();

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const r = await saveProfile(f);
    setBusy(false);
    if (r.ok) setDraft(null);
    else toast(r.message);
  };

  return (
    <>
      <div className={PANEL}>
        <PanelHead icon="file-text" tile="bg-green-50 text-green-700" title="Personal information" note="Your name and how to reach you." />
        <div className={GRID}>
          <Input label="First name" value={f.first} onChange={onInput("first")} />
          <Input label="Last name" value={f.last} onChange={onInput("last")} />
          <Input label="Email" type="email" value={f.email} onChange={onInput("email")} />
          <Input label="Phone number" type="tel" placeholder="+254 7XX XXX XXX" value={f.phone} onChange={onInput("phone")} />
        </div>
        {bad && <div className="type-small text-danger-text">Enter a valid email address.</div>}
      </div>
      <div className={PANEL}>
        <PanelHead icon="map-pin" tile="bg-info-soft text-info-text" title="Address" note="Where you are based." />
        <div className={GRID}>
          <SearchSelect label="Country" options={COUNTRIES} value={f.country} onChange={set("country")} />
          <SearchSelect
            label="City or town"
            noun="town"
            options={[...CITIES, ...newCities]}
            value={f.city}
            onChange={set("city")}
            onCreate={(x) => {
              setNewCities((c) => [...c, x]);
              return x;
            }}
          />
        </div>
        <Input label="Address" placeholder="For example, 123 Moi Avenue" value={f.address} onChange={onInput("address")} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={clean} onClick={() => setDraft(null)}>
            Undo
          </Button>
          <Button icon="check" disabled={blocked || busy} onClick={save}>
            Save changes
          </Button>
        </div>
      </div>
    </>
  );
}

// ---- Change password --------------------------------------------------------------------------

const EMPTY_PW = { cur: "", next: "", conf: "", show: false };

function Chip({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span className={`type-caption inline-flex items-center gap-1 rounded-pill px-2.5 py-1 font-semibold ${ok ? "bg-green-50 text-green-700" : "bg-canvas text-text-muted"}`}>
      {ok ? "✓" : "○"} {children}
    </span>
  );
}

function PasswordForm() {
  const [pw, setPw] = useState(EMPTY_PW);
  const [busy, setBusy] = useState(false);
  const rules = passwordRules(pw.next);
  const type = pw.show ? "text" : "password";
  const on = (k: "cur" | "next" | "conf") => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setPw((p) => ({ ...p, [k]: v }));
  };
  const mismatch = !!pw.conf && pw.conf !== pw.next;
  const blocked = !pw.cur || !rules.every((r) => r.ok) || pw.conf !== pw.next || pw.next === pw.cur;

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const r = await changePassword(pw.cur, pw.next, pw.conf);
    setBusy(false);
    if (r.ok) setPw(EMPTY_PW);
    else toast(r.message);
  };

  return (
    <div className={PANEL}>
      <PanelHead icon="circle-check" tile="bg-warning-soft text-warning-text" title="Change password" note="Use a strong password you don't use anywhere else." />
      <Input label="Current password" type={type} placeholder="Your current password" value={pw.cur} onChange={on("cur")} />
      <div className={GRID}>
        <Input label="New password" type={type} placeholder="Create a strong password" value={pw.next} onChange={on("next")} />
        <Input label="Confirm new password" type={type} placeholder="Type it again" value={pw.conf} onChange={on("conf")} />
      </div>
      <label className="type-small inline-flex cursor-pointer items-center gap-2 text-text-secondary">
        <input type="checkbox" checked={pw.show} onChange={(e) => setPw((p) => ({ ...p, show: e.target.checked }))} className="accent-[var(--action)]" />
        Show passwords
      </label>
      <div className="type-eyebrow text-text-muted">Your new password must include</div>
      <div className="flex flex-wrap gap-2">
        {rules.map((r) => (
          <Chip key={r.label} ok={r.ok}>
            {r.label}
          </Chip>
        ))}
      </div>
      {mismatch && <div className="type-small text-danger-text">The new passwords don&apos;t match.</div>}
      <div className="flex justify-end">
        <Button icon="check" disabled={blocked || busy} onClick={save}>
          Update password
        </Button>
      </div>
    </div>
  );
}
