"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid, Sparkles } from "lucide-react";

import Sidebar from "@/components/Sidebar/Sidebar";
import BannerPreview from "@/components/Preview/BannerPreview";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { animatedPatterns, patterns } from "@/constants/patterns";
import { Pattern, TextStyles } from "@/types";
import { parseCSS } from "@/utils/parseCSS";

const CreatorPage = () => {
    const [textContent, setTextContent] = useState("Text");
    const [textStyles, setTextStyles] = useState<TextStyles>({
        bold: true,
        italic: false,
        underline: false,
        strikethrough: false,
        noWrap: false,
        fontSize: 72,
        alignment: "center",
        textColor: "#FFFFFF",
        fontFamily: "Arial, sans-serif",
    });

    const [selectedPattern, setSelectedPattern] = useState(() => patterns[0]);
    const [patternColor1, setPatternColor1] = useState("#131313");
    const [patternColor2, setPatternColor2] = useState("#b3b3c4");
    const [patternScale, setPatternScale] = useState(14);
    const [visiblePicker, setVisiblePicker] = useState<string | null>(null);
    const [patternCategory, setPatternCategory] = useState<"static" | "animated">("static");
    const previewRef = useRef<HTMLDivElement>(null);
    const darkMode = true;

    useEffect(() => {
        if (patternCategory === "static") {
            const isStatic = patterns.some((pattern) => pattern.name === selectedPattern.name);
            if (!isStatic) {
                setSelectedPattern(patterns[0]);
            }
        } else {
            const isAnimated = animatedPatterns.some((pattern) => pattern.name === selectedPattern.name);
            if (!isAnimated && animatedPatterns.length > 0) {
                setSelectedPattern(animatedPatterns[0]);
            }
        }
    }, [patternCategory, selectedPattern.name]);

    const renderPatternButton = (pattern: Pattern) => {
        const isSelected = pattern.name === selectedPattern.name;
        return (
            <button
                key={pattern.name}
                type="button"
                onClick={() => setSelectedPattern(pattern)}
                className={`group relative overflow-hidden rounded-2xl border ${
                    isSelected ? "border-[#A1E2F8]" : "border-white/10"
                } bg-white/5 p-2.5 text-left transition hover:border-[#A1E2F8]/60`}
            >
                <div
                    className={`relative h-20 w-full overflow-hidden rounded-lg border border-white/10 ${
                        pattern.className ?? ""
                    }`}
                    style={parseCSS(pattern.style, 14, patternColor1, patternColor2)}
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">{pattern.name}</span>
                    {pattern.isAnimated && (
                        <span className="rounded-full bg-[#A1E2F8]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#A1E2F8]">
                            ∞ GIF
                        </span>
                    )}
                </div>
            </button>
        );
    };

    const toggleStyle = (style: "bold" | "italic" | "underline" | "strikethrough") => {
        setTextStyles((prev) => ({
            ...prev,
            [style]: !prev[style],
        }));
    };

    const changeFontSize = (size: number) => {
        setTextStyles((prev) => ({
            ...prev,
            fontSize: size,
        }));
    };

    const changeAlignment = (alignment: "left" | "center" | "right" | "justify") => {
        setTextStyles((prev) => ({
            ...prev,
            alignment,
        }));
    };

    const changeTextColor = (color: string) => {
        setTextStyles((prev) => ({
            ...prev,
            textColor: color,
        }));
    };

    const changeFontFamily = (fontFamily: string) => {
        setTextStyles((prev) => ({
            ...prev,
            fontFamily,
        }));
    };

    const toggleNoWrap = () => {
        setTextStyles((prev) => ({
            ...prev,
            noWrap: !prev.noWrap,
        }));
    };

    const handleEmojiSelect = (emoji: string) => {
        setTextContent((prev) => `${prev}${emoji}`);
    };

    const togglePicker = (pickerId: string) => {
        setVisiblePicker((prev) => (prev === pickerId ? null : pickerId));
    };

    const navItems = useMemo(
        () => [
            { href: "/", label: "Landing" },
            { href: "/creator", label: "Creator" },
        ],
        []
    );

    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#A1E2F8]/25 blur-3xl" />
                <div className="absolute top-1/4 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#A1E2F8]/15 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[#A1E2F8]/10 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pt-12 md:px-10 lg:px-16">
                <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#A1E2F8]/25 bg-[#A1E2F8]/5 text-3xl font-semibold uppercase tracking-[0.3em] text-white/80 shadow-2xl shadow-[0_20px_60px_-20px_rgba(192,230,244,0.45)]">
                            <img src="/bunny.png" alt="Banny" className="h-20 w-20" />
                        </div>
                        <div>
                            <span className="text-sm uppercase tracking-[0.45em] text-[#A1E2F8]">Banner Creator</span>
                            <h1 className="text-3xl font-semibold text-white md:text-4xl">Banny Workspace</h1>
                        </div>
                    </div>
                    <nav className="flex items-center gap-4 text-sm text-white/70">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="rounded-full border border-white/10 px-4 py-2 transition hover:border-[#A1E2F8]/50 hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </header>

                <motion.section
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative flex flex-col gap-8"
                >
                    <div className="relative flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)] xl:items-start xl:gap-10">
                        <div className="xl:sticky xl:top-10 xl:self-start">
                            <Sidebar
                                toggleStyle={toggleStyle}
                                changeFontSize={changeFontSize}
                                changeAlignment={changeAlignment}
                                currentFontSize={textStyles.fontSize}
                                changeTextColor={changeTextColor}
                                changeFontFamily={changeFontFamily}
                                noWrap={textStyles.noWrap}
                                toggleNoWrap={toggleNoWrap}
                                onEmojiSelect={handleEmojiSelect}
                                textStyles={textStyles}
                            />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-8">
                            <div className="w-full rounded-3xl border border-[#A1E2F8]/20 bg-white/5 p-6 backdrop-blur-xl shadow-[0_25px_80px_-35px_rgba(192,230,244,0.55)]">
                                <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.35em] text-[#A1E2F8]/70">
                                    <span>Preview</span>
                                    <span>{textStyles.fontSize}px</span>
                                </div>
                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                                    <BannerPreview
                                        selectedPattern={selectedPattern}
                                        patternColor1={patternColor1}
                                        patternColor2={patternColor2}
                                        patternScale={patternScale}
                                        textContent={textContent}
                                        textStyles={textStyles}
                                        previewRef={previewRef}
                                        onTextChange={setTextContent}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="rounded-3xl border border-[#A1E2F8]/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_20px_60px_-35px_rgba(192,230,244,0.45)]">
                                    <h2 className="text-lg font-semibold text-white">Pattern auswählen</h2>
                                    <p className="mt-2 text-sm text-white/60">
                                        {patternCategory === "static"
                                            ? "Feine Texturen für lebendige Banner. Justiere Farben und Skalierung, um deinen Look zu perfektionieren."
                                            : "Diese Hintergründe laufen dauerhaft in einer Endlosschleife und bringen Bewegung in deine Banner."}
                                    </p>
                                    <div className="mt-5 flex flex-wrap gap-3">
                                        {[{
                                            id: "static" as const,
                                            label: "Statische Banner",
                                            icon: LayoutGrid,
                                            subline: "Ruhige Texturen",
                                        }, {
                                            id: "animated" as const,
                                            label: "Animierte Banner",
                                            icon: Sparkles,
                                            subline: "Mit Bewegung",
                                        }].map(({ id, label, icon: Icon, subline }) => {
                                            const isActive = patternCategory === id;
                                            return (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    onClick={() => setPatternCategory(id)}
                                                    aria-pressed={isActive}
                                                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                                                        isActive
                                                            ? "border-[#A1E2F8] bg-[#A1E2F8]/15 text-white shadow-[0_12px_40px_-20px_rgba(161,226,248,0.8)]"
                                                            : "border-white/10 bg-white/5 text-white/70 hover:border-[#A1E2F8]/40 hover:text-white"
                                                    }`}
                                                >
                                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#A1E2F8]">
                                                        <Icon className="h-5 w-5" />
                                                    </span>
                                                    <span className="flex flex-col">
                                                        <span className="text-sm font-semibold uppercase tracking-[0.35em]">
                                                            {label}
                                                        </span>
                                                        <span className="text-xs text-white/60">{subline}</span>
                                                    </span>
                                                    {id === "animated" && (
                                                        <span className="ml-auto rounded-full bg-[#A1E2F8]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#A1E2F8]">
                                                            ∞
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-6 max-h-[20rem] overflow-y-auto pr-2">
                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                            {(patternCategory === "static" ? patterns : animatedPatterns).map((pattern) =>
                                                renderPatternButton(pattern)
                                            )}
                                        </div>
                                        {patternCategory === "animated" && (
                                            <p className="mt-4 text-xs text-[#A1E2F8]/80">
                                                Animierte Banner nutzen CSS-Animationen und laufen in einer Endlosschleife.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-[#A1E2F8]/15 bg-white/5 p-6 backdrop-blur-xl shadow-[0_25px_70px_-30px_rgba(192,230,244,0.45)]">
                                    <h2 className="text-lg font-semibold text-white">Farben & Scale</h2>
                                    <p className="mt-2 text-sm text-white/60">
                                        Passe die Farben für deinen Pattern-Look an und justiere die Skalierung für mehr Dynamik.
                                    </p>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default CreatorPage;
