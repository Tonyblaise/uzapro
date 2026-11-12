import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/** Port of the design system Button (variants and sizes from _ds_bundle.js). */
export type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-action text-text-on-action border-transparent hover:enabled:bg-action-hover",
  secondary: "bg-surface text-text border-border-strong hover:enabled:bg-surface-hover",
  soft: "bg-action-soft text-green-700 border-transparent hover:enabled:bg-action-soft-hover",
  ghost: "bg-transparent text-text border-transparent hover:enabled:bg-grey-100",
  danger: "bg-danger-text text-white border-transparent hover:enabled:brightness-90",
};

const SIZE: Record<ButtonSize, { cls: string; icon: number }> = {
  sm: { cls: "h-[var(--control-height-sm)] px-[10px] text-[13px]", icon: 14 },
  md: { cls: "h-[var(--control-height)] px-[14px] text-[14px]", icon: 16 },
  lg: { cls: "h-[var(--control-height-lg)] px-[18px] text-[15px]", icon: 18 },
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Button({ variant = "primary", size = "md", icon, iconRight, fullWidth, className = "", type = "button", children, ...rest }: ButtonProps) {
  const s = SIZE[size];
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border font-medium leading-none transition-colors duration-[120ms] ease-standard active:enabled:translate-y-px disabled:opacity-45 ${VARIANT[variant]} ${s.cls} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={s.icon} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.icon} />}
    </button>
  );
}
