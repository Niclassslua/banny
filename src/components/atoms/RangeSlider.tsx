// src/components/atoms/RangeSlider.tsx
import React from "react";

interface RangeSliderProps {
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (n: number) => void;
    className?: string;
    ariaLabel?: string;
    trackColor?: string;
    progressColor?: string;
    glowColor?: string;
    thumbColor?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
    min,
    max,
    step = 1,
    value,
    onChange,
    className = "",
    ariaLabel,
    trackColor = "rgba(255,255,255,0.12)",
    progressColor = "rgba(161,226,248,0.85)",
    glowColor = "rgba(161,226,248,0.5)",
    thumbColor = "rgba(161,226,248,0.75)",
}) => {
    const percentage = ((value - min) / (max - min)) * 100;

    const sliderStyle = {
        "--value": `${percentage}%`,
        "--track-color": trackColor,
        "--progress-color": progressColor,
        "--glow-color": glowColor,
        "--thumb-color": thumbColor,
    } as React.CSSProperties;

    return (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            aria-label={ariaLabel}
            onChange={(e) => onChange(+e.target.value)}
            className={`glass-slider ${className}`.trim()}
            style={sliderStyle}
        />
    );
};
