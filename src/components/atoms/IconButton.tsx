import { forwardRef } from "react";
import clsx from "clsx";

interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isActive?: boolean;            // z. B. Bold aktiv
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, isActive, ...rest }, ref) => (
        <button
            ref={ref}
            {...rest}
            className={clsx(
                "inline-flex select-none items-center justify-center rounded-md border border-transparent p-3 shadow transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8] disabled:pointer-events-none disabled:opacity-60 [appearance:none]",
                isActive
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600",
                className
            )}
        />
    )
);
IconButton.displayName = "IconButton";
