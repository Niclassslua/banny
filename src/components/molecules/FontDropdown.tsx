// src/components/molecules/FontDropdown.tsx
import React, { useState } from "react";

interface FontDesc {
    name: string;
    style: string;     // z. B. "'Roboto', sans-serif"
    className: string; // next/font generierte Klasse
}

interface FontDropdownProps {
    fonts: FontDesc[];
    selectedFontFamily: string;
    onFontChange: (font: string) => void;
}

export const FontDropdown: React.FC<FontDropdownProps> = ({
                                                              fonts,
                                                              selectedFontFamily,
                                                              onFontChange,
                                                          }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* Trigger‑Button */}
            <button
                type="button"
                className="w-full p-2 rounded-md bg-zinc-700 text-left"
                onClick={() => setIsOpen((prev) => !prev)}
                style={{ fontFamily: selectedFontFamily }}
            >
                {selectedFontFamily || "Select a Font"}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute z-10 mt-1 w-full bg-zinc-700 rounded-md shadow-lg overflow-y-auto"
                    style={{ maxHeight: 200 }}
                >
                    {fonts.map((font) => (
                        <div
                            key={font.name}
                            className={`p-2 cursor-pointer hover:bg-zinc-600 ${font.className}`}
                            onClick={() => {
                                onFontChange(font.style); // gibt die CSS‑font-family zurück
                                setIsOpen(false);
                            }}
                        >
                            {font.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
