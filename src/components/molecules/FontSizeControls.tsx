"use client";

import { useEffect, useState } from "react";

import { ControlButton, RangeSlider } from "../atoms";

interface Props {
    value: number;
    onChange: (v: number) => void;
}

const PRESET = [16, 20, 24, 32, 46, 64, 72, 96, 128, 144, 192, 256];

export const FontSizeControls: React.FC<Props> = ({ value, onChange }) => {
    const [local, setLocal] = useState(value);

    useEffect(() => {
        setLocal(value);
    }, [value]);

    const apply = (n: number) => {
        setLocal(n);
        onChange(n);
    };

    return (
        <>
            <div className="grid gap-3 pt-6 pb-4 [grid-template-columns:repeat(auto-fit,minmax(3.25rem,1fr))]">
                {PRESET.map((n) => (
                    <ControlButton
                        key={n}
                        className="w-full"
                        active={local === n}
                        onClick={() => apply(n)}
                        isText
                        padding="10px 0"
                        textWidthClass="w-full"
                    >
                        {n}
                    </ControlButton>
                ))}
            </div>

            <div className="mt-4">
                <RangeSlider
                    min={16}
                    max={256}
                    step={1}
                    value={local}
                    onChange={apply}
                    ariaLabel="Schriftgröße"
                />
            </div>
        </>
    );
};
