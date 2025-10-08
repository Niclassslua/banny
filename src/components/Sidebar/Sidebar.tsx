"use client";

import React, { useState } from "react";
import EmojiPicker from "@/components/Sidebar/EmojiPicker";
import { FontControls } from "../organisms";
import { TextStyles } from "@/types";

interface SidebarProps {
    toggleStyle: (s: "bold" | "italic" | "underline" | "strikethrough") => void;
    changeFontSize: (n: number) => void;
    changeAlignment: (a: "left" | "center" | "right" | "justify") => void;
    currentFontSize: number;
    changeTextColor: (c: string) => void;
    changeFontFamily: (f: string) => void;
    noWrap: boolean;
    toggleNoWrap: () => void;
    onEmojiSelect: (e: string) => void;
    textStyles: TextStyles;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             toggleStyle,
                                             changeFontSize,
                                             changeAlignment,
                                             currentFontSize,
                                             changeTextColor,
                                             changeFontFamily,
                                             noWrap,
                                             toggleNoWrap,
                                             onEmojiSelect,
                                             textStyles,
                                         }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiSelect = (emoji: { native: string }) => {
        onEmojiSelect(emoji.native);
    };

    return (
        <aside
            className="relative flex h-full w-full flex-col gap-6 overflow-visible rounded-[26px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_-35px_rgba(161,226,248,0.6)] backdrop-blur-2xl transition duration-150 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:content-[''] before:bg-[radial-gradient(circle_at_top,_rgba(161,226,248,0.22),_transparent_65%)] before:opacity-80 after:pointer-events-none after:absolute after:inset-0 after:-z-20 after:rounded-[inherit] after:content-[''] after:bg-zinc-950/60 lg:w-[260px] lg:flex-none xl:w-[280px]"
        >
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

            {/* Emoji-Toggle & Picker ------------------------------------------- */}
            <div className="relative flex flex-col gap-3">
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker((v) => !v)}
                    aria-expanded={showEmojiPicker}
                    aria-controls="sidebar-emoji-picker"
                    className="rounded-full border border-[#A1E2F8]/30 bg-[#A1E2F8]/15 px-4 py-2 font-medium text-[#A1E2F8] shadow-[0_12px_38px_-18px_rgba(161,226,248,0.6)] transition hover:border-[#A1E2F8]/50 hover:bg-[#A1E2F8]/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A1E2F8]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 active:scale-95"
                >
                    {showEmojiPicker ? "Emoji Picker schließen" : "Emoji Picker öffnen"}
                </button>

                {showEmojiPicker && (
                    <div
                        id="sidebar-emoji-picker"
                        className="absolute right-full top-1/2 z-[200] -translate-y-1/2 origin-top-right rounded-2xl border border-[#A1E2F8]/25 bg-zinc-950/90 p-2 shadow-[0_30px_80px_-30px_rgba(161,226,248,0.75)] backdrop-blur-xl mr-4"
                    >
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
