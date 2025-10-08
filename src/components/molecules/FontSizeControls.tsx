"use client";

import { useEffect, useState } from "react";
import { GlassButton } from "../atoms";

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
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
                {PRESET.map((n) => (
                    <GlassButton key={n} active={local === n} onClick={() => apply(n)} isText padding="8px 8px">
                        {n}
                    </GlassButton>
                ))}
            </div>

            <div className="flex flex-col gap-2">
                <input
                    type="range"
                    min={16}
                    max={256}
                    step={1}
                    value={local}
                    onChange={(e) => apply(+e.target.value)}
                    className="accent-[#A1E2F8]"
                />
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">{local}px</span>
            </div>
        </div>
    );
};
