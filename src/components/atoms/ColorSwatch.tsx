// src/components/atoms/ColorSwatch.tsx
import clsx from "clsx";
import React from "react";
import {GlassButton} from "@/components/atoms/GlassButton";
import {backgroundColor} from "html2canvas/dist/types/css/property-descriptors/background-color";

interface ColorSwatchProps {
    color: string;
    selected?: boolean;
    onClick: () => void;
    /** optional extra styles (z. B. Pattern‑Preview) */
    styleOverride?: React.CSSProperties;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
    color,
    selected = false,
    onClick,
    styleOverride,
}) => (
    <GlassButton
        aria-label={`choose ${color}`}
        onClick={onClick}
        style={{
            backgroundColor: color,
            width: 16,
            height: 16,
            borderRadius: 99,
            ...styleOverride,
        }}
        padding="19px 18px"
    >
        <span className="sr-only">{color}</span>
    </GlassButton>
);
