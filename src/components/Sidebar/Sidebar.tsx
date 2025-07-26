// components/Sidebar/Sidebar.tsx
import React, { useState } from "react";
import FontControls from "./FontControls";
import EmojiPicker from "@/components/Sidebar/EmojiPicker";

interface SidebarProps {
    toggleStyle: (style: "bold" | "italic" | "underline" | "strikethrough") => void;
    changeFontSize: (size: number) => void;
    changeAlignment: (alignment: "left" | "center" | "right" | "justify") => void;
    currentFontSize: number;
    changeTextColor: (color: string) => void;
    changeFontFamily: (font: string) => void;
    darkMode: boolean;
    visiblePicker: string | null;
    togglePicker: (pickerId: string) => void;
    patternScale: number;
    setPatternScale: (scale: number) => void;
    onEmojiSelect: (emoji: string) => void;
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
                                             darkMode,
                                             visiblePicker,
                                             togglePicker,
                                             patternScale,
                                             setPatternScale,
                                             onEmojiSelect,
                                         }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiSelect = (emoji: any) => {
        console.log("Ausgewähltes Emoji:", emoji); // Zum Debuggen
        // Sicherstellen, dass die Eigenschaft "native" vorhanden ist
        onEmojiSelect(emoji.native);
        setShowEmojiPicker(false);
    };

    return (
        <aside className="w-full md:w-64 p-6 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 transition-colors duration-300 flex flex-col space-y-6">
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
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Sidebar</h2>

                <button
                    className="mb-2 px-4 py-2 bg-green-600 text-white rounded-md"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                    {showEmojiPicker ? "Emoji Picker schließen" : "Emoji Picker öffnen"}
                </button>

                {showEmojiPicker && <EmojiPicker onEmojiSelect={handleEmojiSelect} />}

                {/* Weitere Sidebar-Optionen */}
            </div>
        </aside>
    );
};

export default Sidebar;
