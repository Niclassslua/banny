// components/Sidebar/EmojiPicker.tsx
import React from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface EmojiPickerProps {
    onEmojiSelect: (emoji: any) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
    return (
        <div className="p-2 border rounded-md bg-white dark:bg-gray-800">
            <Picker
                data={data}
                onEmojiSelect={onEmojiSelect}
                theme="light" // oder "dark", je nach deinem Design
            />
        </div>
    );
};

export default EmojiPicker;
