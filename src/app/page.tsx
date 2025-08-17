"use client";

import React, { useState, useRef, useCallback } from "react";
import Head from "next/head";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

import AppLayout from "@/components/AppLayout";
import Sidebar from "@/components/Sidebar/Sidebar";
import BannerPreview from "@/components/Preview/BannerPreview";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { patterns } from "@/constants/patterns";
import { parseCSS } from "@/utils/parseCSS";
import { TextStyles } from "@/types";

const Page: React.FC = () => {
    const previewRef = useRef<HTMLDivElement>(null);

    /* ----------------------------- Pattern State ----------------------------- */
    const [selectedPattern, setSelectedPattern] = useState(patterns[0]);
    const [patternColor1, setPatternColor1] = useState("#131313");
    const [patternColor2, setPatternColor2] = useState("#b3b3c4");
    const [patternScale, setPatternScale] = useState(10);

    /* ----------------------------- Text State -------------------------------- */
    const [textContent, setTextContent] = useState("Text");
    const [textStyles, setTextStyles] = useState<TextStyles>({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        noWrap: false,
        fontSize: 128,
        alignment: "center",
        textColor: "var(--foreground)",
        fontFamily: "Arial",
    });

    /* ----------------------------- UI State ---------------------------------- */
    const [visiblePicker, setVisiblePicker] = useState<string | null>(null);
    const darkMode = true; // placeholder – swap with real theme toggle if available

    /* ----------------------------- Callbacks --------------------------------- */
    const togglePicker = useCallback((id: string) => {
        setVisiblePicker((current) => (current === id ? null : id));
    }, []);

    const toggleStyle = useCallback((style: keyof TextStyles) => {
        setTextStyles((prev) => ({ ...prev, [style]: !prev[style] }));
    }, []);

    const handleExportAsPNG = async () => {
        if (!previewRef.current) return;

        try {
            const dataURL = await toPng(previewRef.current, { pixelRatio: 3 });
            const link = document.createElement("a");
            link.href = dataURL;
            link.download = "banner-preview-highres.png";
            link.click();
        } catch (error) {
            console.error("Error exporting high-res PNG:", error);
        }
    };

    /* ------------------------------------------------------------------------ */
    return (
        <AppLayout>
            {/* ------------------------------------------------------------------- */}
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Pacifico&family=Times+New+Roman&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* --------------------- Global Download Button ------------------------ */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportAsPNG}
                className="fixed top-4 right-4 z-50 flex items-center gap-2
                 rounded-lg bg-indigo-600/90 px-4 py-2
                 text-sm font-semibold text-white
                 shadow-lg ring-1 ring-white/20 backdrop-blur-md
                 transition-colors hover:bg-indigo-500 focus:outline-none"
            >
                <Download size={18} strokeWidth={2} />
                Download
            </motion.button>

            {/* ------------------------------ Layout ------------------------------ */}
            <div className="min-h-screen flex flex-col md:flex-row bg-zinc-900 text-foreground transition-colors duration-300">
                {/* --------------------------- Sidebar --------------------------- */}
                <Sidebar
                    toggleStyle={toggleStyle}
                    changeFontSize={(size) => setTextStyles((s) => ({ ...s, fontSize: size }))}
                    changeAlignment={(a) => setTextStyles((s) => ({ ...s, alignment: a }))}
                    currentFontSize={textStyles.fontSize}
                    changeTextColor={(c) => setTextStyles((s) => ({ ...s, textColor: c }))}
                    changeFontFamily={(f) => setTextStyles((s) => ({ ...s, fontFamily: f }))}
                    noWrap={textStyles.noWrap}
                    toggleNoWrap={() => setTextStyles((s) => ({ ...s, noWrap: !s.noWrap }))}
                    darkMode={darkMode}
                    visiblePicker={visiblePicker}
                    togglePicker={togglePicker}
                    patternScale={patternScale}
                    setPatternScale={setPatternScale}
                    onEmojiSelect={(emoji) => setTextContent((prev) => prev + emoji)}
                />

                {/* --------------------------- Main ------------------------------ */}
                <main className="flex-1 p-4 md:overflow-y-auto">
                    <div className="w-full max-w-screen-lg mx-auto space-y-16">
                        {/* Preview ----------------------------------------------------- */}
                        <BannerPreview
                            selectedPattern={selectedPattern}
                            patternColor1={patternColor1}
                            patternColor2={patternColor2}
                            patternScale={patternScale}
                            textContent={textContent}
                            textStyles={textStyles}
                            previewRef={previewRef}
                        />

                        {/* Settings ---------------------------------------------------- */}
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

                        {/* Pattern Carousel ------------------------------------------- */}
                        <section className="w-full relative z-0">{/*  <-- hier: relative  */}
                            <div
                                /* eigener Stacking-Context für die Cards                          */
                                className="
      relative z-10
      flex gap-6 overflow-x-auto
      px-6 pt-6 pb-6 snap-x snap-mandatory scroll-smooth
    "
                            >
                                {patterns.map((pattern) => {
                                    const isSelected = selectedPattern?.name === pattern.name
                                    return (
                                        <motion.div
                                            key={pattern.name}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => setSelectedPattern(pattern)}
                                            className={`
            relative w-56 h-40 shrink-0 rounded-xl cursor-pointer
            transition duration-150
            bg-zinc-900/60 backdrop-blur-md shadow-md hover:shadow-lg
            ring-1 ring-white/10
            ${isSelected
                                                ? "ring-2 ring-indigo-500"
                                                : "hover:ring-1 hover:ring-indigo-300"}
          `}
                                            style={parseCSS(pattern.style, 5, "#131313", "#b3b3c4")}
                                        >
          <span
              className="
              absolute top-2 left-2 rounded
              bg-zinc-900/80 backdrop-blur px-2 py-0.5
              text-[10px] font-semibold tracking-wider uppercase
              text-foreground/70 ring-1 ring-white/10
            "
          >
            {pattern.name}
          </span>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </section>


                    </div>
                </main>
            </div>
        </AppLayout>
    );
};

export default Page;
