import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

/** Icon-only button. `label` is required and becomes aria-label + title (Principle IV). */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconName;
  label: string;
  variant?: "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
  badge?: boolean;
  active?: boolean;
}

export function IconButton({ icon, label, variant = "ghost", size = "md", badge, active, className = "", type = "button", ...rest }: IconButtonProps) {
  const [box, glyph] = { sm: [30, 16], md: [36, 18], lg: [44, 18] }[size];
  const look = active
    ? "bg-action-soft text-green-700 border-transparent"
    : variant === "secondary"
      ? "bg-surface text-text border-border-strong hover:bg-surface-hover"
      : "bg-transparent text-text border-transparent hover:bg-grey-100";
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`relative inline-grid place-items-center rounded-sm border p-0 ${look} ${className}`}
      style={{ width: box, height: box }}
      {...rest}
    >
      <Icon name={icon} size={glyph} />
      {badge && <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger shadow-[0_0_0_2px_var(--surface)]" />}
    </button>
  );
}
