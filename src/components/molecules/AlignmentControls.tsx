"use client";

import {
    MdAlignHorizontalLeft,
    MdAlignHorizontalCenter,
    MdAlignHorizontalRight,
    MdFormatAlignJustify,
} from "react-icons/md";
import { useEffect, useState } from "react";

import { ControlButton } from "../atoms";

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
        <div className="grid grid-cols-4 gap-2 pt-6 pb-4">
            <ControlButton
                className="w-full"
                active={local === "left"}
                onClick={() => handle("left")}
                aria-label="Links"
                padding="12px"
            >
                <MdAlignHorizontalLeft className="text-xl" />
            </ControlButton>
            <ControlButton
                className="w-full"
                active={local === "center"}
                onClick={() => handle("center")}
                aria-label="Zentriert"
                padding="12px"
            >
                <MdAlignHorizontalCenter className="text-xl" />
            </ControlButton>
            <ControlButton
                className="w-full"
                active={local === "right"}
                onClick={() => handle("right")}
                aria-label="Rechts"
                padding="12px"
            >
                <MdAlignHorizontalRight className="text-xl" />
            </ControlButton>
            <ControlButton
                className="w-full"
                active={local === "justify"}
                onClick={() => handle("justify")}
                aria-label="Blocksatz"
                padding="12px"
            >
                <MdFormatAlignJustify className="text-xl" />
            </ControlButton>
        </div>
    );
};
