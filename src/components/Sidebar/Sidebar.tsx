import React, { useState } from "react";
import EmojiPicker from "@/components/Sidebar/EmojiPicker";
import { FontControls } from "../organisms";

interface SidebarProps {
    toggleStyle: (s: "bold" | "italic" | "underline" | "strikethrough") => void;
    changeFontSize: (n: number) => void;
    changeAlignment: (a: "left" | "center" | "right" | "justify") => void;
    currentFontSize: number;
    changeTextColor: (c: string) => void;
    changeFontFamily: (f: string) => void;
    noWrap: boolean;
    toggleNoWrap: () => void;
    darkMode: boolean;
    visiblePicker: string | null;
    togglePicker: (id: string) => void;
    patternScale: number;
    setPatternScale: (s: number) => void;
    onEmojiSelect: (e: string) => void;
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
                                         }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiSelect = (emoji: any) => {
        onEmojiSelect(emoji.native);
    };

    return (
        <aside
            className="relative flex flex-col gap-6 w-full md:w-72 flex-shrink-0
                 p-6 md:h-screen md:sticky md:top-0 overflow-y-auto md:overflow-visible
                 rounded-xl bg-zinc-800 backdrop-blur-md ring-1 ring-white/10
                 shadow-md hover:shadow-lg transition duration-150"
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
            />

            {/* Emoji-Toggle & Picker ------------------------------------------- */}
            <div className="relative flex flex-col gap-3">
                <button
                    onClick={() => setShowEmojiPicker((v) => !v)}
                    className="px-4 py-2 rounded-md font-medium bg-zinc-700 text-white
               ring-1 ring-white/10 shadow hover:bg-zinc-600
               active:scale-95 transition"
                >
                    {showEmojiPicker ? "Emoji Picker schließen" : "Emoji Picker öffnen"}
                </button>

                {showEmojiPicker && (
                    <div
                        className="
                            absolute left-0 top-full mt-2                     /* Mobile */
                            md:left-full md:ml-4 md:top-1/2 md:-translate-y-[60%] /* Desktop */
                            z-[60] rounded-xl bg-zinc-900/60 backdrop-blur
                            ring-1 ring-white/10 shadow-inner p-2
                            transform
                        "
                    >
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
