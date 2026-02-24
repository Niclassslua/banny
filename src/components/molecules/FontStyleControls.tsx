"use client";

import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS } from "react-icons/md";
import { useTranslations } from "next-intl";
import { GlassButton } from "../atoms";
import { Style } from "@/types/Style";

interface Props {
    value: Style[];
    toggleStyle: (s: Style) => void;
}

export const FontStyleControls: React.FC<Props> = ({ value, toggleStyle }) => {
    const t = useTranslations("Sidebar.fontStyle");
    const isActive = (s: Style) => value.includes(s);

    return (
        <div className="flex flex-wrap gap-x-16 gap-y-8 pt-6 pb-6">
            <GlassButton active={isActive("bold")} onClick={() => toggleStyle("bold")} aria-label={t("bold")} padding="14px 18px">
                <MdFormatBold className="text-xl" />
            </GlassButton>
            <GlassButton active={isActive("italic")} onClick={() => toggleStyle("italic")} aria-label={t("italic")} padding="14px 18px">
                <MdFormatItalic className="text-xl" />
            </GlassButton>
            <GlassButton
                active={isActive("underline")}
                onClick={() => toggleStyle("underline")}
                aria-label={t("underline")}
                padding="14px 18px"
            >
                <MdFormatUnderlined className="text-xl" />
            </GlassButton>
            <GlassButton
                active={isActive("strikethrough")}
                onClick={() => toggleStyle("strikethrough")}
                aria-label={t("strikethrough")}
                padding="14px 18px"
            >
                <MdStrikethroughS className="text-xl" />
            </GlassButton>
        </div>
    );
};
