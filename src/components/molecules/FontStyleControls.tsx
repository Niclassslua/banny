"use client";

import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS, MdWrapText } from "react-icons/md";

import { ControlButton } from "../atoms";
import { Style } from "@/types/Style";

interface Props {
    value: Style[];
    toggleStyle: (s: Style) => void;
    wrapActive: boolean;
    toggleWrap: () => void;
}

export const FontStyleControls: React.FC<Props> = ({ value, toggleStyle, wrapActive, toggleWrap }) => {
    const isActive = (s: Style) => value.includes(s);

    return (
        <div className="grid grid-cols-4 gap-2 pt-6 pb-4 sm:grid-cols-5">
            <ControlButton
                active={isActive("bold")}
                onClick={() => toggleStyle("bold")}
                aria-label="Fett"
                padding="12px"
                className="w-full"
            >
                <MdFormatBold className="text-xl" />
            </ControlButton>
            <ControlButton
                active={isActive("italic")}
                onClick={() => toggleStyle("italic")}
                aria-label="Kursiv"
                padding="12px"
                className="w-full"
            >
                <MdFormatItalic className="text-xl" />
            </ControlButton>
            <ControlButton
                active={isActive("underline")}
                onClick={() => toggleStyle("underline")}
                aria-label="Unterstrichen"
                padding="12px"
                className="w-full"
            >
                <MdFormatUnderlined className="text-xl" />
            </ControlButton>
            <ControlButton
                active={isActive("strikethrough")}
                onClick={() => toggleStyle("strikethrough")}
                aria-label="Durchgestrichen"
                padding="12px"
                className="w-full"
            >
                <MdStrikethroughS className="text-xl" />
            </ControlButton>
            <ControlButton
                active={wrapActive}
                onClick={toggleWrap}
                aria-label="Zeilenumbruch umschalten"
                padding="12px"
                className="w-full"
            >
                <div className="flex flex-col items-center gap-1">
                    <MdWrapText className="text-lg" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                        Umbruch
                    </span>
                </div>
            </ControlButton>
        </div>
    );
};
