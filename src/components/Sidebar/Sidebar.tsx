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
            className="relative flex h-full w-full flex-col gap-6 rounded-[26px] border border-white/10 bg-black/40 p-6 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(192,230,244,0.55)] transition duration-150 lg:w-[260px] lg:flex-none xl:w-[280px]"
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
                    onClick={() => setShowEmojiPicker((v) => !v)}
                    className="rounded-full border border-[#A1E2F8]/30 bg-[#A1E2F8]/15 px-4 py-2 font-medium text-[#A1E2F8] shadow-[0_10px_30px_-15px_rgba(192,230,244,0.6)] transition hover:border-[#A1E2F8]/50 hover:bg-[#A1E2F8]/25 hover:text-white active:scale-95"
                >
                    {showEmojiPicker ? "Emoji Picker schließen" : "Emoji Picker öffnen"}
                </button>

                {showEmojiPicker && (
                    <div
                        className="absolute left-0 top-full mt-2 z-[60] rounded-2xl border border-[#A1E2F8]/20 bg-black/80 p-2 shadow-[0_20px_50px_-25px_rgba(192,230,244,0.6)] backdrop-blur md:left-full md:ml-4 md:top-1/2 md:-translate-y-[60%]"
                    >
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
