"use client";

import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS } from "react-icons/md";
import { GlassButton } from "../atoms";
import { Style } from "@/types/Style";

interface Props {
    value: Style[];
    toggleStyle: (s: Style) => void;
}

export const FontStyleControls: React.FC<Props> = ({ value, toggleStyle }) => {
    const isActive = (s: Style) => value.includes(s);

    return (
        <div className="flex flex-wrap gap-3">
            <GlassButton active={isActive("bold")} onClick={() => toggleStyle("bold")} aria-label="Fett" padding="10px 12px">
                <MdFormatBold className="text-lg" />
            </GlassButton>
            <GlassButton active={isActive("italic")} onClick={() => toggleStyle("italic")} aria-label="Kursiv" padding="10px 12px">
                <MdFormatItalic className="text-lg" />
            </GlassButton>
            <GlassButton
                active={isActive("underline")}
                onClick={() => toggleStyle("underline")}
                aria-label="Unterstrichen"
                padding="10px 12px"
            >
                <MdFormatUnderlined className="text-lg" />
            </GlassButton>
            <GlassButton
                active={isActive("strikethrough")}
                onClick={() => toggleStyle("strikethrough")}
                aria-label="Durchgestrichen"
                padding="10px 12px"
            >
                <MdStrikethroughS className="text-lg" />
            </GlassButton>
        </div>
    );
};
