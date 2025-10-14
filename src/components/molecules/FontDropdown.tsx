// src/components/molecules/FontDropdown.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

import { FONT_CATEGORIES, FontOption } from "@/constants/fonts";

interface FontDropdownProps {
    fonts: FontOption[];
    selectedFontFamily: string;
    onFontChange: (font: string) => void;
    previewText: string;
}

export const FontDropdown: React.FC<FontDropdownProps> = ({
                                                              fonts,
                                                              selectedFontFamily,
                                                              onFontChange,
                                                              previewText,
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

    const selectedFont = useMemo(
        () => fonts.find((font) => font.style === selectedFontFamily),
        [fonts, selectedFontFamily]
    );

    const previewLabel = previewText.trim() || "Schriftzug";

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Trigger‑Button */}
            <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left text-base text-white/80 transition hover:border-[#A1E2F8]/40 hover:text-white"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <div className="flex flex-col gap-2">
                    <span
                        className={`${selectedFont?.className ?? ""} text-xl leading-snug text-white`}
                        style={{ fontFamily: selectedFontFamily || undefined }}
                    >
                        {previewLabel}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                        {selectedFont?.name || selectedFontFamily || "Schrift auswählen"}
                    </span>
                </div>
                <svg
                    className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
                    className="absolute z-10 mt-3 max-h-80 w-full min-w-[22rem] overflow-y-auto rounded-xl border border-white/10 bg-zinc-900/95 p-2 shadow-[0_30px_80px_-30px_rgba(192,230,244,0.6)] backdrop-blur"
                >
                    {fontsByCategory.map((group) => (
                        <div key={group.category} className="py-1">
                            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">
                                {group.category}
                            </p>
                            {group.fonts.map((font) => (
                                <div
                                    key={font.name}
                                    className={`cursor-pointer rounded-lg px-4 py-3 text-white/80 transition hover:bg-white/10 hover:text-white ${
                                        font.style === selectedFontFamily ? "bg-white/10 text-white" : ""
                                    }`}
                                    role="option"
                                    aria-selected={font.style === selectedFontFamily}
                                    title={font.name}
                                    onClick={() => {
                                        onFontChange(font.style); // gibt die CSS‑font-family zurück
                                        setIsOpen(false);
                                    }}
                                >
                                    <p
                                        className={`${font.className} text-lg leading-snug text-white`}
                                        style={{ fontFamily: font.style }}
                                    >
                                        {previewLabel}
                                    </p>
                                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-white/40">
                                        {font.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
