"use client";

import {
    MdAlignHorizontalLeft,
    MdAlignHorizontalCenter,
    MdAlignHorizontalRight,
    MdFormatAlignJustify,
} from "react-icons/md";
import { GlassButton } from "../atoms";
import { useEffect, useState } from "react";

type Align = "left" | "center" | "right" | "justify";

interface AlignmentControlsProps {
    onChange: (v: Align) => void;
    value: Align;
}

export const AlignmentControls: React.FC<AlignmentControlsProps> = ({ onChange, value }) => {
    const [local, setLocal] = useState<Align>(value);

    useEffect(() => {
        setLocal(value);
    }, [value]);

    const handle = (v: Align) => {
        setLocal(v);
        onChange(v);
    };

    return (
        <div className="flex flex-wrap gap-x-16 gap-y-8 pl-4 pt-6 pb-6">
            <GlassButton active={local === "left"} onClick={() => handle("left")} aria-label="Links" padding="14px 18px">
                <MdAlignHorizontalLeft className="text-xl" />
            </GlassButton>
            <GlassButton active={local === "center"} onClick={() => handle("center")} aria-label="Zentriert" padding="14px 18px">
                <MdAlignHorizontalCenter className="text-xl" />
            </GlassButton>
            <GlassButton active={local === "right"} onClick={() => handle("right")} aria-label="Rechts" padding="14px 18px">
                <MdAlignHorizontalRight className="text-xl" />
            </GlassButton>
            <GlassButton active={local === "justify"} onClick={() => handle("justify")} aria-label="Blocksatz" padding="14px 18px">
                <MdFormatAlignJustify className="text-xl" />
            </GlassButton>
        </div>
    );
};
