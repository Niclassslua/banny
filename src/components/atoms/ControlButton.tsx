"use client";

import clsx from "clsx";
import React from "react";

import { Button } from "@/components/ui/Button";

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
    isText?: boolean;
    padding?: string;
    textWidthClass?: string;
}

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
        <Button
            type={type}
            {...props}
            style={mergedStyle}
            variant={active ? "primary" : "secondary"}
            className={clsx(
                "inline-flex select-none items-center justify-center gap-2 rounded-lg border transition duration-200 ease-out disabled:pointer-events-none disabled:opacity-60",
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
        </Button>
    );
};
