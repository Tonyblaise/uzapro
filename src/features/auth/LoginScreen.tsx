"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { login, requestPasswordReset, resendReset, signUp, useSession } from "@/data";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

type View = "login" | "forgot" | "sent";

const POINTS = [
  { icon: "shopping-cart", text: "Record sales and send invoices" },
  { icon: "boxes", text: "Know what is in stock at every branch" },
  { icon: "wallet", text: "Track expenses, M-Pesa and bank money" },
];
const BARS = [38, 52, 45, 64, 58, 80, 100];

function ErrorBox({ text, icon = true }: { text: string; icon?: boolean }) {
  return (
    <div role="alert" className="type-small flex items-start gap-2 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-danger-text">
      {icon && <Icon name="circle-alert" size={16} />}
      <span>{text}</span>
    </div>
  );
}

/** Login, Forgot password and Check your messages, ported from the canvas `isLogin` block. */
export function LoginScreen() {
  const router = useRouter();
  const { authed, hydrated } = useSession();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && authed && !busy) router.replace("/dashboard");
  }, [hydrated, authed, busy, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const r = await login({ id: email, password: pass, remember });
    setBusy(false);
    if (!r.ok) return setErr(r.message);
    setPass("");
    setShow(false);
    router.replace("/dashboard");
  };

  const sendReset = async (e: FormEvent) => {
    e.preventDefault();
    const r = await requestPasswordReset(email);
    if (!r.ok) return setErr(r.message);
    setErr("");
    setView("sent");
  };

  const go = (v: View) => {
    setErr("");
    setView(v);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <div className="flex min-w-0 flex-[1_1_520px] flex-col px-5 py-6">
        <div className="px-2">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="flex w-full max-w-[400px] flex-col gap-6">
            {view === "login" && (
              <>
                <div>
                  <h1 className="m-0 text-[28px] font-semibold leading-tight text-text">Welcome back</h1>
                  <p className="type-body mb-0 mt-2 text-text-secondary">Log in to manage your business.</p>
                </div>
                <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                  {err && <ErrorBox text={err} />}
                  <Input label="Email or phone number" icon="mail" placeholder="you@business.co.ke" autoComplete="username" value={email} onChange={(e) => (setEmail(e.target.value), setErr(""))} />
                  <div className="relative">
                    <Input
                      label="Password"
                      icon="lock"
                      type={show ? "text" : "password"}
                      placeholder="Your password"
                      autoComplete="current-password"
                      value={pass}
                      onChange={(e) => (setPass(e.target.value), setErr(""))}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "Hide password" : "Show password"}
                      className="type-label absolute bottom-1 right-1.5 h-8 bg-transparent px-2 text-action"
                    >
                      {show ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Checkbox label="Keep me logged in" checked={remember} onChange={setRemember} />
                    <button type="button" onClick={() => go("forgot")} className="type-label bg-transparent p-0 text-action">
                      Forgot password?
                    </button>
                  </div>
                  <Button type="submit" size="lg" fullWidth disabled={busy}>
                    {busy ? "Logging in…" : "Log in"}
                  </Button>
                </form>
                <div className="type-small flex items-center gap-3 text-text-muted">
                  <span className="h-px flex-1 bg-border" />
                  New to UzaPro?
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Button variant="secondary" size="lg" fullWidth onClick={() => void signUp()}>
                  Create a free account
                </Button>
              </>
            )}

            {view === "forgot" && (
              <>
                <div>
                  <h1 className="m-0 text-[28px] font-semibold leading-tight text-text">Reset your password</h1>
                  <p className="type-body mb-0 mt-2 text-text-secondary">Enter the email or phone number you log in with. We&apos;ll send you a link to set a new password.</p>
                </div>
                <form onSubmit={sendReset} noValidate className="flex flex-col gap-4">
                  {err && <ErrorBox text={err} icon={false} />}
                  <Input label="Email or phone number" icon="mail" placeholder="you@business.co.ke" value={email} onChange={(e) => (setEmail(e.target.value), setErr(""))} />
                  <Button type="submit" size="lg" fullWidth>
                    Send reset link
                  </Button>
                </form>
                <button type="button" onClick={() => go("login")} className="type-label flex items-center gap-1 self-center bg-transparent text-text-secondary">
                  <Icon name="arrow-left" size={16} />
                  Back to log in
                </button>
              </>
            )}

            {view === "sent" && (
              <>
                <div className="grid size-12 place-items-center rounded-lg bg-green-50 text-green-700">
                  <Icon name="mail" size={24} />
                </div>
                <div>
                  <h1 className="m-0 text-[28px] font-semibold leading-tight text-text">Check your messages</h1>
                  <p className="type-body mb-0 mt-2 text-text-secondary">
                    If an account uses <strong className="text-text">{email}</strong>, we&apos;ve sent a link to reset the password. The link works for 30 minutes.
                  </p>
                </div>
                <Button size="lg" fullWidth onClick={() => go("login")}>
                  Back to log in
                </Button>
                <button type="button" onClick={() => void resendReset()} className="type-label self-center bg-transparent text-action">
                  Didn&apos;t get it? Send again
                </button>
              </>
            )}
          </div>
        </div>
        <div className="type-small flex flex-wrap justify-between gap-4 px-2 text-text-muted">
          <span>© 2026 UzaPro</span>
          <span className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Help: 0700 000 000</span>
          </span>
        </div>
      </div>

      <div className="relative hidden min-w-0 flex-[1_1_560px] flex-col justify-center overflow-hidden bg-green-700 px-[clamp(32px,6vw,96px)] py-8 text-white min-[901px]:flex">
        <div aria-hidden="true" className="absolute -right-[120px] -top-[120px] size-[360px] rounded-full bg-white/[.06]" />
        <div aria-hidden="true" className="absolute -bottom-[140px] -left-20 size-[300px] rounded-full bg-white/5" />
        <div className="relative flex max-w-[480px] flex-col gap-6">
          <h2 className="m-0 text-[36px] font-bold leading-[1.15] tracking-[-0.02em]">Run your whole business from one place.</h2>
          <p className="m-0 text-[17px] leading-normal text-white/80">Sales, stock, expenses and payments in one simple app, for shops and small businesses in Kenya.</p>
          <div className="flex flex-col gap-3">
            {POINTS.map((pt) => (
              <div key={pt.text} className="flex items-center gap-3 text-[15px]">
                <span className="grid size-7 flex-none place-items-center rounded-full bg-white/[.14]">
                  <Icon name={pt.icon} size={15} />
                </span>
                {pt.text}
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="flex max-w-[360px] flex-col gap-3 rounded-lg bg-surface px-5 py-4 text-text shadow-lg">
            <div className="flex items-center justify-between">
              <span className="type-eyebrow text-text-muted">Today&apos;s sales</span>
              <span className="type-small font-semibold text-green-700">▲ 12%</span>
            </div>
            <div className="u-num text-[26px] font-bold">KES 48,250</div>
            <div className="flex h-11 items-end gap-1.5">
              {BARS.map((b, i) => (
                <span key={i} className={`flex-1 rounded-t-[3px] ${i === 6 ? "bg-green-600" : "bg-green-100"}`} style={{ height: `${b}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
