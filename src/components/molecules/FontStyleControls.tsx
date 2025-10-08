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
        <div className="flex flex-wrap gap-x-16 gap-y-8 pl-4 pt-6 pb-6">
            <GlassButton active={isActive("bold")} onClick={() => toggleStyle("bold")} aria-label="Fett" padding="14px 18px">
                <MdFormatBold className="text-xl" />
            </GlassButton>
            <GlassButton active={isActive("italic")} onClick={() => toggleStyle("italic")} aria-label="Kursiv" padding="14px 18px">
                <MdFormatItalic className="text-xl" />
            </GlassButton>
            <GlassButton
                active={isActive("underline")}
                onClick={() => toggleStyle("underline")}
                aria-label="Unterstrichen"
                padding="14px 18px"
            >
                <MdFormatUnderlined className="text-xl" />
            </GlassButton>
            <GlassButton
                active={isActive("strikethrough")}
                onClick={() => toggleStyle("strikethrough")}
                aria-label="Durchgestrichen"
                padding="14px 18px"
            >
                <MdStrikethroughS className="text-xl" />
            </GlassButton>
        </div>
    );
};
