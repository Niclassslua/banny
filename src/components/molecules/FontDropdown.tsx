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
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-left text-sm text-white/80 transition hover:border-[#A1E2F8]/40 hover:text-white"
                onClick={() => setIsOpen((prev) => !prev)}
                style={{ fontFamily: selectedFontFamily }}
            >
                <span>
                    {fonts.find((font) => font.style === selectedFontFamily)?.name || selectedFontFamily || "Schrift auswählen"}
                </span>
                <svg
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-white/10 bg-zinc-900/95 p-1 shadow-[0_20px_60px_-30px_rgba(192,230,244,0.6)] backdrop-blur"
                >
                    {fonts.map((font) => (
                        <div
                            key={font.name}
                            className={`cursor-pointer rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white ${font.className}`}
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
