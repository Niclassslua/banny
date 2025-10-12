import clsx from "clsx";
import React from "react";

type ControlGridProps = {
    children: React.ReactNode;
    columns?: number;
    smColumns?: number;
    mdColumns?: number;
    lgColumns?: number;
    gap?: string;
    autoFit?: boolean;
    minItemWidth?: string;
    className?: string;
};

export const ControlGrid: React.FC<ControlGridProps> = ({
    children,
    columns = 1,
    smColumns,
    mdColumns,
    lgColumns,
    gap = "0.5rem",
    autoFit = false,
    minItemWidth = "3rem",
    className,
}) => {
    const style = {
        "--grid-columns": columns,
        "--grid-gap": gap,
        ...(smColumns ? { "--grid-columns-sm": smColumns } : {}),
        ...(mdColumns ? { "--grid-columns-md": mdColumns } : {}),
        ...(lgColumns ? { "--grid-columns-lg": lgColumns } : {}),
        ...(autoFit ? { "--grid-min-item": minItemWidth } : {}),
    } as React.CSSProperties;

    return (
        <div
            className={clsx("control-grid", className)}
            style={style}
            data-auto-fit={autoFit ? "true" : undefined}
        >
            {children}
        </div>
    );
};
