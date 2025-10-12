"use client";

import { forwardRef } from "react";
import clsx from "clsx";

import { Button } from "@/components/ui/Button";

interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isActive?: boolean;            // z. B. Bold aktiv
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, isActive, ...rest }, ref) => (
        <Button
            ref={ref}
            {...rest}
            variant={isActive ? "primary" : "secondary"}
            size="sm"
            className={clsx(
                "inline-flex select-none items-center justify-center rounded-md border border-transparent p-3 shadow transition-colors duration-200 disabled:pointer-events-none disabled:opacity-60",
                isActive
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600",
                className
            )}
        />
    )
);
IconButton.displayName = "IconButton";
