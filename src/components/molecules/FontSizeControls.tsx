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
        <>
            <div className="flex flex-wrap gap-x-16 gap-y-14 ml-6 mb-12 mt-8">
                {PRESET.map((n) => (
                    <GlassButton key={n} active={local === n} onClick={() => apply(n)} isText={true} padding={"7px 7px"}>
                        {n}
                    </GlassButton>
                ))}
            </div>

            <input
                type="range"
                min={16}
                max={256}
                step={1}
                value={local}
                onChange={(e) => apply(+e.target.value)}
                className="w-full accent-indigo-500"
            />
        </>
    );
};
