// src/components/atoms/ColorSwatch.tsx
import React from "react";
import clsx from "clsx";
import { Check } from "lucide-react";

interface ColorSwatchProps {
    color: string;
    selected?: boolean;
    onClick: () => void;
    /** optional extra styles (z. B. Pattern-Preview) */
    styleOverride?: React.CSSProperties;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
                                                            color,
                                                            selected = false,
                                                            onClick,
                                                            styleOverride,
                                                        }) => {
    return (
        <button
            aria-label={`choose ${color}`}
            onClick={onClick}
            type="button"
            className={clsx(
                "relative flex items-center justify-center rounded-full transition duration-150",
                "ring-2 ring-white/20",
                // Hover / Shadow
                "shadow-sm hover:shadow-md",
                // ausgewählt: stärkere Hervorhebung
                selected && "ring-2 ring-offset-1 shadow-lg"
            )}
            style={{
                backgroundColor: color,
                width: 28,
                height: 28,
                padding: 0,
                ...styleOverride,
            }}
        >
            <span className="sr-only">{color}</span>
            {selected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Check size={16} className="text-white" />
                </div>
            )}
        </button>
    );
};