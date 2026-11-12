export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export interface Pill {
  label: string;
  tone: Tone;
}

export type Result<T> = { ok: true; value: T; message: string } | { ok: false; message: string };

export const ok = <T>(value: T, message = ""): Result<T> => ({ ok: true, value, message });
export const fail = <T = never>(message: string): Result<T> => ({ ok: false, message });

export type RoleId = "owner" | "accountant" | "cashier" | "store";

export type ModuleId =
  | "home"
  | "prod"
  | "inv"
  | "sales"
  | "cust"
  | "buy"
  | "vend"
  | "fin"
  | "exp"
  | "rcv"
  | "pay"
  | "rep"
  | "ppl"
  | "perm"
  | "cal"
  | "comm"
  | "docs"
  | "sup"
  | "prof"
  | "set";

/** Quick-task / deep-link action keys (contracts/routes.md). */
export type ActionKey = "new" | "invoice" | "quote" | "credit" | "stock" | "transfer" | "waste" | "warehouse";
