// src/components/molecules/FontDropdown.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

import { FONT_CATEGORIES, FontOption } from "@/constants/fonts";

interface FontDropdownProps {
    fonts: FontOption[];
    selectedFontFamily: string;
    onFontChange: (font: string) => void;
}

export const FontDropdown: React.FC<FontDropdownProps> = ({
                                                              fonts,
                                                              selectedFontFamily,
                                                              onFontChange,
                                                          }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const fontsByCategory = useMemo(
        () =>
            FONT_CATEGORIES.map((category) => ({
                category,
                fonts: fonts
                    .filter((font) => font.category === category)
                    .sort((a, b) => a.name.localeCompare(b.name)),
            })).filter((group) => group.fonts.length > 0),
        [fonts]
    );

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) {
                setIsOpen(false);
                return;
            }

            if (wrapperRef.current?.contains(target)) {
                return;
            }
            setIsOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Trigger‑Button */}
            <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-left text-base text-white/80 transition hover:border-[#A1E2F8]/40 hover:text-white"
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
                    {fontsByCategory.map((group) => (
                        <div key={group.category} className="py-1">
                            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                                {group.category}
                            </p>
                            {group.fonts.map((font) => (
                                <div
                                    key={font.name}
                                    className={`cursor-pointer rounded-lg px-3 py-2 text-base text-white/80 transition hover:bg-white/10 hover:text-white ${font.className}`}
                                    onClick={() => {
                                        onFontChange(font.style); // gibt die CSS‑font-family zurück
                                        setIsOpen(false);
                                    }}
                                >
                                    {font.name}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
