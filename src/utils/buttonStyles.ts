import clsx from "clsx";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "ghost"
    | "danger"
    | "icon"
    | "iconSmall"
    | "iconDanger";
export type ButtonSize = "sm" | "md" | "lg" | "none";

const baseClass =
    "inline-flex select-none items-center justify-center gap-2 font-semibold transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8] disabled:pointer-events-none disabled:opacity-60 [appearance:none]";

const sizeClasses: Record<ButtonSize, string> = {
    sm: "rounded-full px-3 py-1.5 text-xs",
    md: "rounded-full px-4 py-2 text-sm",
    lg: "rounded-full px-5 py-3 text-base",
    none: "px-0 py-0",
};

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "border border-[#A1E2F8]/60 bg-[#A1E2F8]/20 text-[#A1E2F8] shadow-[0_16px_40px_-24px_rgba(161,226,248,0.6)] hover:border-[#A1E2F8] hover:bg-[#A1E2F8]/35 hover:text-white",
    secondary:
        "border border-white/15 bg-white/10 text-white/90 hover:border-white/30 hover:bg-white/20 hover:text-white",
    ghost:
        "border border-transparent bg-transparent text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white",
    danger:
        "border border-red-400/70 bg-red-500/10 text-red-200 hover:border-red-400 hover:bg-red-500/20",
    icon: "h-10 w-10 rounded-xl border border-white/15 bg-white/10 p-0 text-white/80 hover:border-[#A1E2F8]/40 hover:bg-[#A1E2F8]/20 hover:text-white",
    iconSmall:
        "h-8 w-8 rounded-lg border border-white/12 bg-white/8 p-0 text-white/70 hover:border-[#A1E2F8]/40 hover:bg-[#A1E2F8]/15 hover:text-white",
    iconDanger:
        "h-9 w-9 rounded-lg border border-red-400/60 bg-red-500/10 p-0 text-red-200 hover:border-red-400 hover:bg-red-500/20",
};

export const buttonClass = (
    variant: ButtonVariant,
    size: ButtonSize = variant.startsWith("icon") ? "none" : "md",
    ...extra: Array<string | false | null | undefined>
) => clsx(baseClass, sizeClasses[size], variantClasses[variant], extra);

export const combineButtonClass = (
    variant: ButtonVariant,
    size: ButtonSize,
    className?: string,
) => clsx(buttonClass(variant, size), className);
