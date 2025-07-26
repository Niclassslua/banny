// app/page.tsx
"use client";

import React, { useState, useRef, useCallback } from "react";
import AppLayout from "../components/AppLayout";
import Sidebar from "../components/Sidebar/Sidebar";
import { patterns } from "@/constants/patterns";
import { parseCSS } from "@/utils/parseCSS";
import Head from "next/head";
import { toPng } from "html-to-image";
import BannerPreview from "@/components/Preview/BannerPreview";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { Pattern, TextStyles } from "@/types";

import LiquidGlass from 'liquid-glass-react'

export default function HomePage() {
    const previewRef = useRef<HTMLDivElement>(null);

    const [selectedPattern, setSelectedPattern] = useState(patterns[0]);
    const [patternColor1, setPatternColor1] = useState("#444CF7");
    const [patternColor2, setPatternColor2] = useState("#e5e5f7");
    const [patternScale, setPatternScale] = useState(10);
    const [textContent, setTextContent] = useState("Dein Banner Text");
    const [textStyles, setTextStyles] = useState<TextStyles>({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        noWrap: false,
        fontSize: 24,
        alignment: "center",
        textColor: "var(--foreground)",
        fontFamily: "Arial",
    });

    const [visiblePicker, setVisiblePicker] = useState<string | null>(null);
    const darkMode = true; // Beispiel für darkMode

    const togglePicker = useCallback((pickerId: string) => {
        setVisiblePicker((current) => (current === pickerId ? null : pickerId));
    }, []);

    const toggleStyle = useCallback((style: keyof TextStyles) => {
        setTextStyles(prev => ({ ...prev, [style]: !prev[style] }));
    }, []);

    const handleExportAsPNG = async () => {
        if (!previewRef.current) return;

        try {
            const dataURL = await toPng(previewRef.current, {
                pixelRatio: 3, // Erhöht die Auflösung (3x Standard)
            });

            const link = document.createElement("a");
            link.href = dataURL;
            link.download = "banner-preview-highres.png";
            link.click();
        } catch (error) {
            console.error("Error exporting high-res PNG:", error);
        }
    };

    return (
        <AppLayout>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Pacifico&family=Times+New+Roman&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
                {/* Sidebar */}
                <aside className="w-64 h-screen fixed top-0 left-0 z-20 bg-background shadow-lg">
                    <Sidebar
                        toggleStyle={toggleStyle}
                        changeFontSize={size => setTextStyles(s => ({ ...s, fontSize: size }))}
                        changeAlignment={a => setTextStyles(s => ({ ...s, alignment: a }))}
                        currentFontSize={textStyles.fontSize}
                        changeTextColor={c => setTextStyles(s => ({ ...s, textColor: c }))}
                        changeFontFamily={f => setTextStyles(s => ({ ...s, fontFamily: f }))}
                        noWrap={textStyles.noWrap}
                        toggleNoWrap={() => setTextStyles(s => ({ ...s, noWrap: !s.noWrap }))}
                        darkMode={darkMode}
                        visiblePicker={visiblePicker}
                        togglePicker={togglePicker}
                        patternScale={patternScale}
                        setPatternScale={setPatternScale}
                        onEmojiSelect={emoji => setTextContent(prev => prev + emoji)}
                    />

                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-64 p-4 relative">
                    <div className="relative w-full max-w-screen-lg mx-auto">
                        {/* Banner Preview */}
                        <BannerPreview
                            selectedPattern={selectedPattern}
                            patternColor1={patternColor1}
                            patternColor2={patternColor2}
                            patternScale={patternScale}
                            textContent={textContent}
                            textStyles={textStyles}
                            previewRef={previewRef}
                        />

                        {/* Settings */}
                        <SettingsPanel
                            patternColor1={patternColor1}
                            setPatternColor1={setPatternColor1}
                            patternColor2={patternColor2}
                            setPatternColor2={setPatternColor2}
                            patternScale={patternScale}
                            setPatternScale={setPatternScale}
                            darkMode={darkMode}
                            visiblePicker={visiblePicker}
                            togglePicker={togglePicker}
                        />

                        {/* Muster Auswahl */}
                        <div className="mt-10">
                            <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100 text-center">
                                Patterns
                            </h2>
                            <div className="overflow-x-auto flex gap-4 px-4 max-w-full snap-x">
                                {patterns.map((pattern) => {
                                    const isSelected = selectedPattern.name === pattern.name;
                                    return (
                                        <div
                                            key={pattern.name}
                                            className={`relative flex-shrink-0 w-48 h-28 rounded-lg cursor-pointer shadow-md snap-center ${
                                                isSelected ? "border-2 border-indigo-600" : ""
                                            }`}
                                            onClick={() => setSelectedPattern(pattern)}
                                            style={{
                                                ...parseCSS(pattern.style, 5, "#444cf7", "#b3b3c4"),
                                            }}
                                        >
                                            <div
                                                className="absolute -top-6 left-0 bg-indigo-600 text-white px-2 py-1 rounded-t-md font-semibold text-xs z-10">
                                                {pattern.name}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}