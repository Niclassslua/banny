"use client";

import { MdWrapText } from "react-icons/md";
import { useTranslations } from "next-intl";
import { GlassButton } from "@/components/atoms/GlassButton";

interface Props {
    active: boolean;
    onToggle: () => void;
}

export const NoWrapToggle: React.FC<Props> = ({ active, onToggle }) => {
    const t = useTranslations("Sidebar");
    return (
        <div className="flex py-4">
            <GlassButton active={active} onClick={onToggle} aria-label={t("noWrapAria")} padding="14px 18px">
                <MdWrapText className="text-xl" />
            </GlassButton>
        </div>
    );
};
