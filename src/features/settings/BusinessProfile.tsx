"use client";
/**
 * Settings › Business profile (design `isBizProfile` with `bp`): the logo or initials with "Change
 * logo" and "Edit profile", the completion ring with up to 4 "+ {detail}" shortcuts, and the
 * Contact, Location, Registration and "How you sell" cards, each with Edit. The edit modal opens
 * with `?view=<section>` (`all` is the full modal; design `setModal` for kind 'biz').
 */
import { useRef, useState } from "react";
import {
  BIZ_CHANNELS,
  BIZ_CUSTOMERS,
  BIZ_INDUSTRIES,
  BIZ_SECTION_TITLES,
  BIZ_STAFF_SIZES,
  BIZ_TYPES,
  badEmail,
  bizInitials,
  logoFileError,
  saveBusinessProfile,
  setLogo,
  toast,
  useBizCompletion,
  useBranchNames,
  useBusinessProfile,
  type BizSection,
  type BusinessProfile as Biz,
} from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { date as fmtDate } from "@/lib/format";
import { Cell, Head, Note, SetModal, addCity, cityOptions, useSettingsOverlay, withValue } from "./shared";

const SECTIONS: BizSection[] = ["all", "contact", "location", "registration", "business"];

interface Row {
  label: string;
  value: string;
  link?: boolean;
}

function CardRow({ label, value, link }: Row) {
  const cls = !value ? "italic text-text-muted" : link ? "text-green-700 [overflow-wrap:anywhere]" : "text-text [overflow-wrap:anywhere]";
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-baseline gap-3">
      <span className="type-small text-text-secondary">{label}</span>
      <span className={`type-body ${cls}`}>{value || "Not set"}</span>
    </div>
  );
}

export function BusinessProfile() {
  const b = useBusinessProfile();
  const c = useBizCompletion();
  const { params, open, close } = useSettingsOverlay();
  const file = useRef<HTMLInputElement>(null);
  const view = params.get("view") as BizSection | null;

  const pickLogo = (f: File | undefined) => {
    if (!f) return;
    const err = logoFileError(f);
    if (err) {
      toast(err);
      return;
    }
    const rd = new FileReader();
    rd.onload = () => void setLogo(String(rd.result));
    rd.readAsDataURL(f);
  };

  const ringColor = c.pct === 100 ? "var(--green-600)" : c.pct >= 60 ? "var(--warning-text)" : "var(--danger-text)";
  const cards: { title: string; icon: IconName; section: BizSection; intro?: string; rows: Row[] }[] = [
    {
      title: "Contact",
      icon: "phone",
      section: "contact",
      rows: [
        { label: "Email", value: b.email, link: true },
        { label: "Phone", value: b.phone, link: true },
        { label: "WhatsApp", value: b.whatsapp, link: true },
        { label: "Website", value: b.website, link: true },
      ],
    },
    {
      title: "Location",
      icon: "map-pin",
      section: "location",
      rows: [
        { label: "Main branch", value: b.location },
        { label: "Address", value: b.address },
        { label: "City", value: b.city },
        { label: "Postal code", value: b.postal },
      ],
    },
    {
      title: "Registration",
      icon: "file-text",
      section: "registration",
      rows: [
        { label: "KRA PIN", value: b.pin },
        { label: "Registration no.", value: b.regNo },
        { label: "Registered on", value: b.regDate ? fmtDate(b.regDate) : "" },
        { label: "Industry", value: b.industry },
      ],
    },
    {
      title: "How you sell",
      icon: "store",
      section: "business",
      intro: "Tell us how you sell and who you sell to. It shapes the reports and features we suggest.",
      rows: [
        { label: "Business type", value: b.type },
        { label: "Sales channels", value: b.channels },
        { label: "Customers", value: b.customers },
        { label: "Staff size", value: b.staff },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex flex-wrap items-center gap-4 p-5">
          <div className="grid size-[72px] flex-none place-items-center overflow-hidden rounded-md border border-border bg-canvas text-[24px] font-semibold text-text-secondary">
            {b.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- a session data URL, not a static asset
              <img src={b.logo} alt="Business logo" className="size-full object-contain" />
            ) : (
              <span>{bizInitials(b.name)}</span>
            )}
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="type-card-title text-text">{b.name || "Your business"}</span>
              <span className="type-caption rounded-sm bg-canvas px-2 py-0.5 font-semibold text-text-secondary">{b.staff || "Staff size not set"}</span>
            </div>
            <div className="type-small mt-0.5 text-text-secondary">{[b.type, b.industry].filter(Boolean).join(" · ") || "Business type not set"}</div>
          </div>
          <div className="flex gap-2">
            <input
              ref={file}
              type="file"
              accept=".jpg,.jpeg,.png,.svg"
              hidden
              aria-label="Business logo file"
              onChange={(e) => {
                pickLogo(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button variant="secondary" icon="image" onClick={() => file.current?.click()}>
              Change logo
            </Button>
            <Button icon="pencil" onClick={() => open({ view: "all" })}>
              Edit profile
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-border bg-canvas px-5 py-3">
          <div
            className="grid size-11 flex-none place-items-center rounded-full"
            style={{ background: `conic-gradient(${ringColor} ${c.pct}%, var(--border) 0)` }}
            role="img"
            aria-label={`${c.pct}% complete`}
          >
            <div className="type-caption grid size-[34px] place-items-center rounded-full bg-surface font-bold text-text">{c.pct}%</div>
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="type-label text-text">{c.title}</div>
            <div className="type-small text-text-secondary">Receipts, invoices and tax documents use these details.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {c.chips.map((ch) => (
              <button
                key={ch.key}
                type="button"
                onClick={() => open({ view: ch.section })}
                className="type-caption cursor-pointer rounded-pill border border-warning/50 bg-warning-soft px-2.5 py-[3px] font-semibold text-warning-text"
              >
                + {ch.label}
              </button>
            ))}
            {c.more && <span className="type-caption text-text-muted">{c.more}</span>}
          </div>
        </div>
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]">
        {cards.map((card) => (
          <section key={card.title} aria-label={card.title} className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="type-title m-0 flex items-center gap-2 text-text">
                <Icon name={card.icon} size={16} />
                {card.title}
              </h2>
              <Button variant="ghost" size="sm" aria-label={`Edit ${card.title}`} onClick={() => open({ view: card.section })}>
                Edit
              </Button>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4">
              {card.intro && <div className="type-small text-text-secondary">{card.intro}</div>}
              {card.rows.map((r) => (
                <CardRow key={r.label} {...r} />
              ))}
            </div>
          </section>
        ))}
      </div>
      {view && SECTIONS.includes(view) && <BizModal key={view} section={view} biz={b} onClose={close} />}
    </div>
  );
}

// ---- The edit modal (design `setModal` for kind 'biz') -----------------------------------------

function BizModal({ section, biz, onClose }: { section: BizSection; biz: Biz; onClose: () => void }) {
  const branches = useBranchNames();
  const [f, setF] = useState<Biz>(() => ({ ...biz }));
  const all = section === "all";
  const want = (x: BizSection) => all || section === x;
  const bad = badEmail(f.email);
  const blocked = bad || (all && !f.name.trim());
  const text = (label: string, k: keyof Biz, o: { half?: boolean; type?: string; ph?: string } = {}) => (
    <Cell half={o.half}>
      <Input label={label} type={o.type ?? "text"} placeholder={o.ph} value={f[k]} onChange={(e) => setF((s) => ({ ...s, [k]: e.target.value }))} />
    </Cell>
  );
  const pick = (label: string, k: keyof Biz, options: readonly string[], o: { noun?: string; onCreate?: (x: string) => string } = {}) => (
    <Cell half>
      <SearchSelect label={label} noun={o.noun ?? "option"} options={withValue(options, f[k])} value={f[k]} onChange={(v) => setF((s) => ({ ...s, [k]: v }))} onCreate={o.onCreate} />
    </Cell>
  );
  const keep = (x: string) => x;

  const save = async () => {
    if (blocked) return;
    const res = await saveBusinessProfile(f, section);
    if (res.ok) onClose();
    else toast(res.message);
  };

  return (
    <SetModal
      title={BIZ_SECTION_TITLES[section]}
      sub="These details appear on receipts, invoices and tax documents."
      width={all ? 760 : 600}
      btn="Save changes"
      blocked={blocked}
      onClose={onClose}
      onSave={() => void save()}
    >
      {all && (
        <>
          {text("Business name", "name", { half: true })}
          {text("Trading name", "trading", { half: true, ph: "The name customers know you by" })}
        </>
      )}
      {want("contact") && (
        <>
          {all && <Head>Contact</Head>}
          {text("Email", "email", { half: true, type: "email" })}
          {text("Phone", "phone", { half: true, type: "tel" })}
          {text("WhatsApp", "whatsapp", { half: true, type: "tel", ph: "+254 7XX XXX XXX" })}
          {text("Website", "website", { half: true, ph: "www.yourbusiness.co.ke" })}
        </>
      )}
      {bad && <Note label="Check the email" sub="Enter a valid email address." className="text-danger-text" />}
      {want("location") && (
        <>
          {all && <Head>Location</Head>}
          {pick("Main branch", "location", branches)}
          {pick("City or town", "city", cityOptions(), { noun: "town", onCreate: addCity })}
          {text("Address", "address", { half: true, ph: "For example, 123 Moi Avenue" })}
          {text("Postal code", "postal", { half: true, ph: "For example, 00100" })}
        </>
      )}
      {want("registration") && (
        <>
          {all && <Head>Registration</Head>}
          {text("KRA PIN", "pin", { half: true, ph: "For example, P051234567X" })}
          {text("Registration no.", "regNo", { half: true, ph: "Business registration number" })}
          {text("Registered on", "regDate", { half: true, type: "date" })}
          {pick("Industry", "industry", BIZ_INDUSTRIES, { noun: "industry", onCreate: keep })}
        </>
      )}
      {want("business") && (
        <>
          {all && <Head>How you sell</Head>}
          {pick("Business type", "type", BIZ_TYPES)}
          {pick("Staff size", "staff", BIZ_STAFF_SIZES)}
          {pick("Sales channels", "channels", BIZ_CHANNELS, { noun: "channel", onCreate: keep })}
          {pick("Customers", "customers", BIZ_CUSTOMERS, { noun: "customer type", onCreate: keep })}
        </>
      )}
    </SetModal>
  );
}
