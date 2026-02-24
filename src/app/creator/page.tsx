"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    CircleDotDashed,
    Download,
    FileDown,
    Grid3X3,
    PartyPopper,
    RotateCcw,
    Rows3,
    Sparkles,
    Triangle,
    Upload,
    Waves,
} from "lucide-react";

import Sidebar from "@/components/Sidebar/Sidebar";
import BannerPreview from "@/components/Preview/BannerPreview";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { patternCategoryLabels } from "@/constants/patterns";
import type { Pattern, PatternCategoryId } from "@/types";
import { parseCSS } from "@/utils/parseCSS";
import { downloadBanner } from "@/utils/downloadBanner";
import { exportWorkspaceState } from "@/utils/exportWorkspace";
import { importWorkspaceState, ImportError } from "@/utils/importWorkspace";
import { sanitizeFileName } from "@/utils/fileName";
import { useWorkspaceState } from "@/hooks/useWorkspaceState";
import { usePatternFilters } from "@/hooks/usePatternFilters";
import { useNotifications } from "@/components/Notifications/NotificationsProvider";
import LanguageSwitch from "@/components/LanguageSwitch";
import ClientOnly from "@/components/ClientOnly";

type CategoryFilter = {
    id: "all" | PatternCategoryId;
    label: string;
    icon: LucideIcon;
};

const CATEGORY_FILTERS: CategoryFilter[] = [
    { id: "all", label: "Alle Patterns", icon: Rows3 },
    { id: "atmospheric", label: patternCategoryLabels.atmospheric, icon: Sparkles },
    { id: "radial", label: patternCategoryLabels.radial, icon: CircleDotDashed },
    { id: "geometric", label: patternCategoryLabels.geometric, icon: Grid3X3 },
    { id: "angular", label: patternCategoryLabels.angular, icon: Triangle },
    { id: "organic", label: patternCategoryLabels.organic, icon: Waves },
    { id: "playful", label: patternCategoryLabels.playful, icon: PartyPopper },
];

function CreatorContent() {
    const t = useTranslations("Creator");
    const [isSafari, setIsSafari] = useState(false);

    const {
        textContent,
        setTextContent,
        textStyles,
        setTextStyles,
        selectedPattern,
        setSelectedPattern,
        patternColor1,
        setPatternColor1,
        patternColor2,
        setPatternColor2,
        patternScale,
        setPatternScale,
        resetWorkspace,
        applyImportedState,
    } = useWorkspaceState();

    const {
        selectedCategory,
        setSelectedCategory,
        filteredPatterns,
        getCountForCategory,
    } = usePatternFilters(selectedPattern, setSelectedPattern);
    const [visiblePicker, setVisiblePicker] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const darkMode = true;
    const [isDownloading, setIsDownloading] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { showError } = useNotifications();

    useEffect(() => {
        if (typeof navigator === "undefined") {
            return;
        }

        const detectedSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent,
        );

        setIsSafari(detectedSafari);
    }, []);

    const renderPatternButton = (pattern: Pattern) => {
        const isSelected = pattern.name === selectedPattern.name;
        const categoryLabel = patternCategoryLabels[pattern.category];
        return (
            <button
                key={pattern.name}
                type="button"
                onClick={() => setSelectedPattern(pattern)}
                aria-pressed={isSelected}
                className={`group relative overflow-hidden rounded-2xl border ${
                    isSelected
                        ? "border-[#A1E2F8] bg-[#A1E2F8]/10 shadow-[0_0_0_1px_rgba(161,226,248,0.4)]"
                        : "border-white/10 bg-white/5 hover:border-[#A1E2F8]/40 hover:bg-white/10"
                } p-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A1E2F8]/80`}
            >
                <div
                    className="relative h-20 w-full overflow-hidden rounded-lg border border-white/10"
                    style={parseCSS(pattern.style, 4, patternColor1, patternColor2)}
                />
                <div className="mt-3 flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-white">{pattern.name}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white/60">
                        {categoryLabel}
                    </span>
                </div>
            </button>
        );
    };

    const toggleStyle = useCallback(
        (style: "bold" | "italic" | "underline" | "strikethrough") =>
            setTextStyles((prev) => ({ ...prev, [style]: !prev[style] })),
        [setTextStyles],
    );

    const changeFontSize = useCallback(
        (size: number) =>
            setTextStyles((prev) => ({ ...prev, fontSize: size })),
        [setTextStyles],
    );

    const changeAlignment = useCallback(
        (alignment: "left" | "center" | "right" | "justify") =>
            setTextStyles((prev) => ({ ...prev, alignment })),
        [setTextStyles],
    );

    const changeTextColor = useCallback(
        (color: string) =>
            setTextStyles((prev) => ({ ...prev, textColor: color })),
        [setTextStyles],
    );

    const changeFontFamily = useCallback(
        (fontFamily: string) =>
            setTextStyles((prev) => ({ ...prev, fontFamily })),
        [setTextStyles],
    );

    const toggleNoWrap = useCallback(
        () =>
            setTextStyles((prev) => ({ ...prev, noWrap: !prev.noWrap })),
        [setTextStyles],
    );

    const togglePicker = useCallback(
        (pickerId: string) =>
            setVisiblePicker((prev) => (prev === pickerId ? null : pickerId)),
        [],
    );

    const navItems = useMemo(
        () => [
            { href: "/", label: t("nav.landing") },
            { href: "/creator", label: t("nav.creator") },
        ],
        [t],
    );

    const handleResetWorkspace = useCallback(() => {
        resetWorkspace();
        setSelectedCategory("all");
        setVisiblePicker(null);
    }, [resetWorkspace, setSelectedCategory]);

    const handleDownload = useCallback(async () => {
        if (!previewRef.current) {
            return;
        }

        const filenameBase = sanitizeFileName(
            textContent.trim() || selectedPattern.name || "banny-banner",
        );

        setIsDownloading(true);

        try {
            const parsedStyles = parseCSS(
                selectedPattern.style,
                patternScale,
                patternColor1,
                patternColor2,
            );

            let exportBackground = parsedStyles.backgroundColor;

            if (previewRef.current) {
                const computedBackground = getComputedStyle(previewRef.current).backgroundColor;
                if (
                    (!exportBackground ||
                        exportBackground === "transparent" ||
                        exportBackground === "none") &&
                    computedBackground &&
                    computedBackground !== "rgba(0, 0, 0, 0)" &&
                    computedBackground !== "transparent"
                ) {
                    exportBackground = computedBackground;
                }
            }

            await downloadBanner(previewRef.current, {
                fileName: filenameBase,
                backgroundColor: exportBackground,
            });
        } catch (error) {
            console.error("Download fehlgeschlagen", error);
            showError(t("toasts.downloadFailed"));
        } finally {
            setIsDownloading(false);
        }
    }, [patternColor1, patternColor2, patternScale, selectedPattern, textContent]);

    const handleExport = useCallback(() => {
        try {
            const stateToExport = {
                textContent,
                textStyles: { ...textStyles },
                selectedPatternName: selectedPattern.name,
                patternColor1,
                patternColor2,
                patternScale,
            };

            exportWorkspaceState(stateToExport);
        } catch (error) {
            console.error("Export fehlgeschlagen", error);
            showError(t("toasts.exportFailed"));
        }
    }, [patternColor1, patternColor2, patternScale, selectedPattern.name, textContent, textStyles, t, showError]);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImport = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }

            setImportError(null);

            try {
                const importedState = await importWorkspaceState(file);

                applyImportedState(importedState);

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } catch (error) {
                let message = t("toasts.importUnknownError");

                if (error instanceof ImportError) {
                    message = error.message;
                }

                setImportError(message);
                showError(message);
                console.error("Import fehlgeschlagen", error);
            }
        },
        [applyImportedState, showError, t],
    );

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-white">
            {/* Orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#A1E2F8]/25 blur-3xl" />
                <div className="absolute top-1/4 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#A1E2F8]/15 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[#A1E2F8]/10 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pt-12 md:px-10 lg:px-16">
                {/* Header */}
                <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-6">
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#A1E2F8]/25 bg-[#A1E2F8]/5 text-3xl font-semibold uppercase tracking-[0.3em] text-white/80 shadow-2xl shadow-[0_20px_60px_-20px_rgba(192,230,244,0.45)]">
                            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/bunny.png`} alt="Banny" className="h-20 w-20" />
                        </div>
                        <div>
              <span className="text-sm uppercase tracking-[0.45em] text-[#A1E2F8]">
                {t("brandLabel")}
              </span>
                            <h1 className="text-3xl font-semibold text-white md:text-4xl">
                                {t("brandTitle")}
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-4 text-sm md:flex-row md:items-center md:gap-5">
                        <nav className="flex items-center gap-3 text-sm text-white/70">
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
                        <LanguageSwitch />
                        <div className="flex flex-col gap-2">
                            {importError && (
                                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                                    {importError}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,application/json"
                                onChange={handleImport}
                                className="hidden"
                                aria-label="Import preset file"
                            />
                            <button
                                type="button"
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white whitespace-nowrap"
                            >
                                <FileDown className="h-4 w-4" />
                                {t("buttons.export")}
                            </button>
                            <button
                                type="button"
                                onClick={handleImportClick}
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white whitespace-nowrap"
                            >
                                <Upload className="h-4 w-4" />
                                {t("buttons.import")}
                            </button>
                            <button
                                type="button"
                                onClick={handleResetWorkspace}
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white whitespace-nowrap"
                            >
                                <RotateCcw className="h-4 w-4" />
                                {t("buttons.reset")}
                            </button>
                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="inline-flex items-center gap-2 rounded-full border border-[#A1E2F8]/60 bg-[#A1E2F8]/15 px-4 py-2 text-sm font-semibold text-[#A1E2F8] transition hover:border-[#A1E2F8] hover:bg-[#A1E2F8]/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                            >
                                <Download className="h-4 w-4" />
                                {isDownloading ? t("buttons.downloading") : t("buttons.download")}
                            </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* === Safari-FIX: KEIN y-Transform auf dem Vorfahren der sticky Sidebar === */}
                {/* Nur Fade auf dem Section-Wrapper */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className={`relative flex flex-col gap-8 ${
                        isSafari ? "safari-transform-none" : ""
                    }`}
                >
                    <div className="relative flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)] xl:items-stretch xl:gap-10">
                        {/* Sidebar – WebKit-sticky */}
                        <div className="xl:sticky xl:top-10 xl:self-stretch safari-sticky">
                            <Sidebar
                                toggleStyle={toggleStyle}
                                changeFontSize={changeFontSize}
                                changeAlignment={changeAlignment}
                                currentFontSize={textStyles.fontSize}
                                changeTextColor={changeTextColor}
                                changeFontFamily={changeFontFamily}
                                noWrap={textStyles.noWrap}
                                toggleNoWrap={toggleNoWrap}
                                textStyles={textStyles}
                                previewText={textContent}
                            />
                        </div>

                        {/* Main column */}
                        <div className="flex min-w-0 flex-1 flex-col gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="w-full rounded-3xl border border-[#A1E2F8]/20 bg-white/5 p-6 backdrop-blur-xl shadow-[0_25px_80px_-35px_rgba(192,230,244,0.55)]"
                            >
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
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.05 }}
                                className="flex flex-col gap-6"
                            >
                                <div className="rounded-3xl border border-[#A1E2F8]/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_16px_50px_-30px_rgba(192,230,244,0.45)]">
                                    <h2 className="text-lg font-semibold text-white">
                                        {t("sections.patterns.title")}
                                    </h2>
                                    <p className="mt-2 text-sm text-white/60">
                                        {t("sections.patterns.description")}
                                    </p>

                                    <div className="mt-5 flex flex-col gap-4">
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORY_FILTERS.map(({ id, label, icon: Icon }) => {
                                                const isActive = selectedCategory === id;
                                                const count = getCountForCategory(id);

                                                return (
                                                    <button
                                                        key={id}
                                                        type="button"
                                                        onClick={() => setSelectedCategory(id)}
                                                        aria-pressed={isActive}
                                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A1E2F8]/80 ${
                                                            isActive
                                                                ? "border-[#A1E2F8] bg-[#A1E2F8]/15 text-white"
                                                                : "border-white/10 bg-white/5 text-white/70 hover:border-[#A1E2F8]/40 hover:text-white"
                                                        }`}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                        <span className="whitespace-nowrap">{label}</span>
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                                                                isActive
                                                                    ? "bg-[#A1E2F8]/40 text-white"
                                                                    : "bg-white/10 text-white/60"
                                                            }`}
                                                        >
                                                            {count}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="max-h-[12rem] overflow-y-auto pr-2">
                                            {filteredPatterns.length === 0 ? (
                                                <div className="flex min-h-[7rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/60">
                                                    {t("sections.patterns.empty")}
                                                </div>
                                            ) : (
                                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                    {filteredPatterns.map((pattern) => renderPatternButton(pattern))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-[#A1E2F8]/15 bg-white/5 p-6 backdrop-blur-xl shadow-[0_25px_70px_-30px_rgba(192,230,244,0.45)]">
                                    <h2 className="text-lg font-semibold text-white">
                                        {t("sections.colors.title")}
                                    </h2>
                                    <p className="mt-2 text-sm text-white/60">
                                        {t("sections.colors.description")}
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
                            </motion.div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}

const CreatorPageFallback = () => (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
            <p className="text-lg text-white/80">Banny Workspace</p>
            <p className="mt-2 text-sm text-white/50">Loading…</p>
        </div>
    </div>
);

export default function CreatorPage() {
    return (
        <ClientOnly fallback={<CreatorPageFallback />}>
            <CreatorContent />
        </ClientOnly>
    );
}