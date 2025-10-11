"use client";

import React from "react";
import { FontControls } from "../organisms";
import { LayerList } from "../molecules";
import { TextLayer, TextStyles } from "@/types";

interface SidebarProps {
    layers: TextLayer[];
    activeLayerId: string | null;
    onSelectLayer: (id: string) => void;
    onAddLayer: () => void;
    onDuplicateLayer: (id: string) => void;
    onDeleteLayer: (id: string) => void;
    toggleStyle: (s: "bold" | "italic" | "underline" | "strikethrough") => void;
    changeFontSize: (n: number) => void;
    changeAlignment: (a: "left" | "center" | "right" | "justify") => void;
    currentFontSize: number;
    changeTextColor: (c: string) => void;
    changeFontFamily: (f: string) => void;
    noWrap: boolean;
    toggleNoWrap: () => void;
    textStyles: TextStyles;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             layers,
                                             activeLayerId,
                                             onSelectLayer,
                                             onAddLayer,
                                             onDuplicateLayer,
                                             onDeleteLayer,
                                             toggleStyle,
                                             changeFontSize,
                                             changeAlignment,
                                             currentFontSize,
                                             changeTextColor,
                                             changeFontFamily,
                                             noWrap,
                                             toggleNoWrap,
                                             textStyles,
                                         }) => {
    return (
        <aside
            className="relative flex h-full w-full flex-col gap-6 overflow-visible rounded-[26px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_-35px_rgba(161,226,248,0.6)] backdrop-blur-2xl transition duration-150 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:content-[''] before:bg-[radial-gradient(circle_at_top,_rgba(161,226,248,0.22),_transparent_65%)] before:opacity-80 after:pointer-events-none after:absolute after:inset-0 after:-z-20 after:rounded-[inherit] after:content-[''] after:bg-zinc-950/60 lg:w-[260px] lg:flex-none xl:w-[280px]"
        >
            <div className="flex flex-col gap-8">
                <LayerList
                    layers={layers}
                    activeLayerId={activeLayerId}
                    onSelectLayer={onSelectLayer}
                    onAddLayer={onAddLayer}
                    onDuplicateLayer={onDuplicateLayer}
                    onDeleteLayer={onDeleteLayer}
                />

                {/* Typografie-Kontrollen */}
                <FontControls
                    toggleStyle={toggleStyle}
                    changeAlignment={changeAlignment}
                    changeFontSize={changeFontSize}
                    currentFontSize={currentFontSize}
                    changeTextColor={changeTextColor}
                    changeFontFamily={changeFontFamily}
                    noWrap={noWrap}
                    toggleNoWrap={toggleNoWrap}
                    textStyles={textStyles}
                />
            </div>
        </aside>
    );
};

export default Sidebar;
