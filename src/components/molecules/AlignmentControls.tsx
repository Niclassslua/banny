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
        <div className="flex flex-wrap gap-3">
            <GlassButton active={local === "left"} onClick={() => handle("left")} aria-label="Links" padding="10px 12px">
                <MdAlignHorizontalLeft />
            </GlassButton>
            <GlassButton active={local === "center"} onClick={() => handle("center")} aria-label="Zentriert" padding="10px 12px">
                <MdAlignHorizontalCenter />
            </GlassButton>
            <GlassButton active={local === "right"} onClick={() => handle("right")} aria-label="Rechts" padding="10px 12px">
                <MdAlignHorizontalRight />
            </GlassButton>
            <GlassButton active={local === "justify"} onClick={() => handle("justify")} aria-label="Blocksatz" padding="10px 12px">
                <MdFormatAlignJustify />
            </GlassButton>
        </div>
    );
};
