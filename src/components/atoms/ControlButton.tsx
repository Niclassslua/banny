import clsx from "clsx";
import React from "react";

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
    isText?: boolean;
    padding?: string;
    textWidthClass?: string;
}

const focusRingClass =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8]";

export const ControlButton: React.FC<ControlButtonProps> = ({
    active = false,
    isText = false,
    padding = "16px 16px",
    className,
    style,
    type = "button",
    textWidthClass = "min-w-[2.75rem]",
    children,
    ...props
}) => {
    const mergedStyle =
        typeof padding === "string" ? { ...(style ?? {}), padding } : style;

    return (
        <button
            type={type}
            {...props}
            style={mergedStyle}
            className={clsx(
                "inline-flex select-none items-center justify-center gap-2 rounded-lg border transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8] disabled:pointer-events-none disabled:opacity-60 [appearance:none]",
                active
                    ? "border-[#A1E2F8] bg-[#A1E2F8]/20 text-white shadow-[0_0_0_1px_rgba(161,226,248,0.35)]"
                    : "border-white/15 bg-white/5 text-white/90 hover:border-[#A1E2F8]/60 hover:bg-white/10",
                isText
                    ? "text-sm font-medium tracking-normal"
                    : "text-xs font-semibold uppercase tracking-[0.18em]",
                className,
            )}
        >
            {isText ? (
                <span className={clsx("inline-block text-center tabular-nums", textWidthClass)}>
                    {children}
                </span>
            ) : (
                children
            )}
        </button>
    );
};
