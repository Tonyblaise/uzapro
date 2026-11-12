/**
 * Browser storage for UI conveniences only (Constitution v1.1.0, Principle III).
 * Only `uzAuth` and `uzNavClosed` may be stored. Every access is guarded.
 */
const AUTH_KEY = "uzAuth";
const NAV_KEY = "uzNavClosed";

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: ignore */
  }
}

export function readAuth(): { role: string } | null {
  const v = read<{ role?: unknown }>(AUTH_KEY);
  return v && typeof v.role === "string" ? { role: v.role } : null;
}

export function writeAuth(role: string): void {
  write(AUTH_KEY, { role });
}

export function clearAuth(): void {
  try {
    window.localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}

export function readNavClosed(): Record<string, boolean> {
  const v = read<Record<string, boolean>>(NAV_KEY);
  return v && typeof v === "object" ? v : {};
}

export function writeNavClosed(map: Record<string, boolean>): void {
  write(NAV_KEY, map);
}
