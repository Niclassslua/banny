// components/Sidebar/EmojiPicker.tsx
import React from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface EmojiPickerProps {
    onEmojiSelect: (emoji: any) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
    return (
        <Picker
            data={data}
            onEmojiSelect={onEmojiSelect}
            theme="dark"
            icons="outline"
            navPosition="top"
            previewPosition="none"
            skinTonePosition="search"
            emojiButtonRadius="8px"
            emojiButtonSize={34}
            className="!bg-zinc-900 !border-none"  // Tailwind-Utility override
        />
    );
};

export default EmojiPicker;
