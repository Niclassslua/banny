"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { AlertCircle, Check, Download, Loader2 } from "lucide-react";

import Sidebar from "@/components/Sidebar/Sidebar";
import BannerPreview from "@/components/Preview/BannerPreview";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { patterns } from "@/constants/patterns";
import { Pattern, TextStyles } from "@/types";
import { parseCSS } from "@/utils/parseCSS";
import {
    downloadBanner,
    sanitizeFileName,
    type ExportFormat,
    type ExportVariant,
} from "@/utils/downloadBanner";

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
    {
        value: "png",
        label: "PNG",
        description: "Perfekt für transparente, verlustfreie Grafiken.",
    },
    {
        value: "jpeg",
        label: "JPG",
        description: "Kompaktes Format – ideal für Fotos und Social Media.",
    },
    {
        value: "webp",
        label: "WebP",
        description: "Moderne Kompression mit sehr guter Qualität.",
    },
    {
        value: "svg",
        label: "SVG",
        description: "Vektorbasiert und unendlich skalierbar.",
    },
];

const RESOLUTION_OPTIONS = [
    { value: 1, label: "Standard (1x)" },
    { value: 2, label: "Retina (2x)" },
    { value: 3, label: "Ultra (3x)" },
];

const CreatorPage = () => {
    // --- Safari detection (für sticky/transform-Fix)
    const [isSafari, setIsSafari] = useState(false);

    useEffect(() => {
        if (typeof navigator === "undefined") {
            return;
        }

        const detectedSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent,
        );

        setIsSafari(detectedSafari);
    }, []);

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
    const previewRef = useRef<HTMLDivElement>(null);
    const darkMode = true;
    const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>(["png"]);
    const [selectedResolutions, setSelectedResolutions] = useState<number[]>([2]);
    const [qualitySettings, setQualitySettings] = useState<{ jpeg: number; webp: number }>({
        jpeg: 0.92,
        webp: 0.92,
    });
    const [dialogError, setDialogError] = useState<string | null>(null);
    const [exportStatus, setExportStatus] = useState<{
        state: "idle" | "running" | "success" | "error";
        message?: string;
    }>({
        state: "idle",
    });
    const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        if (exportStatus.state === "success" || exportStatus.state === "error") {
            const timeout = window.setTimeout(() => {
                setExportStatus({ state: "idle" });
            }, 5000);

            return () => window.clearTimeout(timeout);
        }

        return undefined;
    }, [exportStatus.state]);

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
                    className="relative h-20 w-full overflow-hidden rounded-lg border border-white/10"
                    style={parseCSS(pattern.style, 4, patternColor1, patternColor2)}
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">{pattern.name}</span>
                </div>
            </button>
        );
    };

    const toggleStyle = (style: "bold" | "italic" | "underline" | "strikethrough") =>
        setTextStyles((prev) => ({ ...prev, [style]: !prev[style] }));

    const changeFontSize = (size: number) =>
        setTextStyles((prev) => ({ ...prev, fontSize: size }));

    const changeAlignment = (alignment: "left" | "center" | "right" | "justify") =>
        setTextStyles((prev) => ({ ...prev, alignment }));

    const changeTextColor = (color: string) =>
        setTextStyles((prev) => ({ ...prev, textColor: color }));

    const changeFontFamily = (fontFamily: string) =>
        setTextStyles((prev) => ({ ...prev, fontFamily }));

    const toggleNoWrap = () =>
        setTextStyles((prev) => ({ ...prev, noWrap: !prev.noWrap }));

    const togglePicker = (pickerId: string) =>
        setVisiblePicker((prev) => (prev === pickerId ? null : pickerId));

    const toggleFormat = (format: ExportFormat) =>
        setSelectedFormats((prev) =>
            prev.includes(format)
                ? prev.filter((value) => value !== format)
                : [...prev, format],
        );

    const toggleResolution = (value: number) =>
        setSelectedResolutions((prev) =>
            prev.includes(value)
                ? prev.filter((option) => option !== value)
                : [...prev, value].sort((a, b) => a - b),
        );

    const handleQualityChange = (format: "jpeg" | "webp", value: number) =>
        setQualitySettings((prev) => ({
            ...prev,
            [format]: Math.min(1, Math.max(0.1, value)),
        }));

    const navItems = useMemo(
        () => [
            { href: "/", label: "Landing" },
            { href: "/creator", label: "Creator" },
        ],
        [],
    );

    const rasterFormatsSelected = useMemo(
        () => selectedFormats.filter((format) => format !== "svg"),
        [selectedFormats],
    );

    const canConfirmExport =
        selectedFormats.length > 0 &&
        (rasterFormatsSelected.length === 0 || selectedResolutions.length > 0);

    const previewVariantCount =
        (rasterFormatsSelected.length > 0
            ? rasterFormatsSelected.length * selectedResolutions.length
            : 0) + (selectedFormats.includes("svg") ? 1 : 0);

    const exportButtonLabel =
        exportProgress.total > 0
            ? exportProgress.current > 0
                ? `Export ${exportProgress.current}/${exportProgress.total}`
                : exportProgress.total > 1
                  ? `Bereite ${exportProgress.total} Exporte vor…`
                  : "Bereite Export vor…"
            : "Export läuft…";

    const handleExport = async () => {
        if (!previewRef.current) {
            return;
        }

        if (selectedFormats.length === 0) {
            setDialogError("Bitte wähle mindestens ein Exportformat aus.");
            return;
        }

        if (rasterFormatsSelected.length > 0 && selectedResolutions.length === 0) {
            setDialogError("Bitte wähle mindestens eine Auflösung für PNG/JPG/WebP aus.");
            return;
        }

        const filenameBase = sanitizeFileName(
            textContent.trim() || selectedPattern.name || "banny-banner",
        );

        const variants: ExportVariant[] = [];

        if (rasterFormatsSelected.length > 0) {
            rasterFormatsSelected.forEach((format) => {
                selectedResolutions.forEach((resolution) => {
                    variants.push({
                        format,
                        pixelRatio: resolution,
                        quality:
                            format === "jpeg"
                                ? qualitySettings.jpeg
                                : format === "webp"
                                  ? qualitySettings.webp
                                  : undefined,
                    });
                });
            });
        }

        if (selectedFormats.includes("svg")) {
            variants.push({ format: "svg" });
        }

        if (variants.length === 0) {
            setDialogError("Bitte wähle mindestens eine gültige Exportvariante aus.");
            return;
        }

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

        setDialogError(null);
        setExportProgress({ current: 0, total: variants.length });
        setExportStatus({
            state: "running",
            message: `Starte Export (${variants.length} Variante${variants.length === 1 ? "" : "n"})…`,
        });
        setIsExporting(true);
        setIsDownloadDialogOpen(false);

        try {
            const summary = await downloadBanner(previewRef.current, {
                fileName: filenameBase,
                backgroundColor: exportBackground,
                variants,
                onProgress: (current, total) => {
                    setExportProgress({ current, total });
                    setExportStatus({
                        state: "running",
                        message: `Exportiere ${current}/${total}…`,
                    });
                },
            });

            if (summary.failed.length > 0) {
                console.error("Einige Exporte fehlgeschlagen", summary.failed);
                setExportStatus({
                    state: "error",
                    message: `${summary.failed.length} von ${summary.total} Exporten fehlgeschlagen.`,
                });
            } else {
                setExportStatus({
                    state: "success",
                    message: `${summary.total} Export${summary.total === 1 ? "" : "e"} abgeschlossen.`,
                });
            }
        } catch (error) {
            console.error("Download fehlgeschlagen", error);
            setExportStatus({
                state: "error",
                message: "Download fehlgeschlagen. Bitte versuche es erneut.",
            });
        } finally {
            setIsExporting(false);
            setExportProgress({ current: 0, total: 0 });
        }
    };

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
                            <img src="/bunny.png" alt="Banny" className="h-20 w-20" />
                        </div>
                        <div>
              <span className="text-sm uppercase tracking-[0.45em] text-[#A1E2F8]">
                Banner Creator
              </span>
                            <h1 className="text-3xl font-semibold text-white md:text-4xl">
                                Banny Workspace
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
                        <div className="flex flex-col items-start gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setDialogError(null);
                                    setIsDownloadDialogOpen(true);
                                }}
                                disabled={isExporting}
                                className="inline-flex items-center gap-2 rounded-full border border-[#A1E2F8]/60 bg-[#A1E2F8]/15 px-4 py-2 font-semibold text-[#A1E2F8] transition hover:border-[#A1E2F8] hover:bg-[#A1E2F8]/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {exportButtonLabel}
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Banner exportieren
                                    </>
                                )}
                            </button>
                            {exportStatus.state !== "idle" && exportStatus.message && (
                                <div
                                    className={`flex items-center gap-2 text-xs md:text-sm ${
                                        exportStatus.state === "error"
                                            ? "text-red-400"
                                            : exportStatus.state === "success"
                                              ? "text-emerald-300"
                                              : "text-[#A1E2F8]"
                                    }`}
                                    aria-live="polite"
                                >
                                    {exportStatus.state === "running" && (
                                        <Loader2 className="h-3 w-3 animate-spin md:h-4 md:w-4" />
                                    )}
                                    {exportStatus.state === "success" && (
                                        <Check className="h-3 w-3 md:h-4 md:w-4" />
                                    )}
                                    {exportStatus.state === "error" && (
                                        <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                                    )}
                                    <span>{exportStatus.message}</span>
                                </div>
                            )}
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
                                    <h2 className="text-lg font-semibold text-white">Pattern auswählen</h2>
                                    <p className="mt-2 text-sm text-white/60">
                                        Feine Texturen für lebendige Banner. Justiere Farben und
                                        Skalierung, um deinen Look zu perfektionieren.
                                    </p>

                                    <div className="mt-5 max-h-[12rem] overflow-y-auto pr-2">
                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                            {patterns.map((pattern) => renderPatternButton(pattern))}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-[#A1E2F8]/15 bg-white/5 p-6 backdrop-blur-xl shadow-[0_25px_70px_-30px_rgba(192,230,244,0.45)]">
                                    <h2 className="text-lg font-semibold text-white">Farben & Scale</h2>
                                    <p className="mt-2 text-sm text-white/60">
                                        Passe die Farben für deinen Pattern-Look an und justiere die
                                        Skalierung für mehr Dynamik.
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

            <Transition.Root show={isDownloadDialogOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsDownloadDialogOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-6">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative w-full max-w-xl transform overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 p-6 text-left shadow-2xl transition-all sm:p-8">
                                    <Dialog.Title className="text-lg font-semibold text-white">
                                        Banner exportieren
                                    </Dialog.Title>
                                    <p className="mt-2 text-sm text-white/70">
                                        Wähle die gewünschten Formate und Auflösungen für deinen Export.
                                    </p>

                                    <div className="mt-6 space-y-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">Formate</h3>
                                            <p className="mt-1 text-xs text-white/60">
                                                Mehrfachauswahl möglich – PNG für Transparenz, JPG/WebP für kleine Dateien, SVG für Vektoren.
                                            </p>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                {FORMAT_OPTIONS.map((option) => {
                                                    const isActive = selectedFormats.includes(option.value);
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => toggleFormat(option.value)}
                                                            className={`rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A1E2F8] ${
                                                                isActive
                                                                    ? "border-[#A1E2F8] bg-[#A1E2F8]/20 text-white"
                                                                    : "border-white/10 bg-white/5 text-white/80 hover:border-[#A1E2F8]/50"
                                                            }`}
                                                        >
                                                            <span className="block text-sm font-semibold">{option.label}</span>
                                                            <span className="mt-1 block text-xs text-white/60">
                                                                {option.description}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="text-sm font-semibold text-white">Auflösungen</h3>
                                                <span className="text-xs text-white/60">Ideal für verschiedene Plattformen</span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {RESOLUTION_OPTIONS.map((option) => {
                                                    const isActive = selectedResolutions.includes(option.value);
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => toggleResolution(option.value)}
                                                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A1E2F8] ${
                                                                isActive
                                                                    ? "border-[#A1E2F8] bg-[#A1E2F8]/25 text-white"
                                                                    : "border-white/15 bg-white/5 text-white/70 hover:border-[#A1E2F8]/40"
                                                            }`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {rasterFormatsSelected.length > 0 && selectedResolutions.length === 0 && (
                                                <p className="mt-2 text-xs text-red-300">
                                                    Für PNG/JPG/WebP muss mindestens eine Auflösung ausgewählt sein.
                                                </p>
                                            )}
                                        </div>

                                        {(selectedFormats.includes("jpeg") || selectedFormats.includes("webp")) && (
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-white">Qualität</h3>
                                                {selectedFormats.includes("jpeg") && (
                                                    <div>
                                                        <div className="flex items-center justify-between text-xs text-white/60">
                                                            <span>JPG-Qualität</span>
                                                            <span>{Math.round(qualitySettings.jpeg * 100)}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0.1"
                                                            max="1"
                                                            step="0.05"
                                                            value={qualitySettings.jpeg}
                                                            onChange={(event) =>
                                                                handleQualityChange("jpeg", parseFloat(event.target.value))
                                                            }
                                                            className="mt-2 w-full accent-[#A1E2F8]"
                                                        />
                                                    </div>
                                                )}
                                                {selectedFormats.includes("webp") && (
                                                    <div>
                                                        <div className="flex items-center justify-between text-xs text-white/60">
                                                            <span>WebP-Qualität</span>
                                                            <span>{Math.round(qualitySettings.webp * 100)}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0.1"
                                                            max="1"
                                                            step="0.05"
                                                            value={qualitySettings.webp}
                                                            onChange={(event) =>
                                                                handleQualityChange("webp", parseFloat(event.target.value))
                                                            }
                                                            className="mt-2 w-full accent-[#A1E2F8]"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                                            <span>Geplante Exporte</span>
                                            <span className="font-semibold text-white">
                                                {previewVariantCount}
                                                {" "}
                                                {previewVariantCount === 1 ? "Datei" : "Dateien"}
                                            </span>
                                        </div>

                                        {dialogError && (
                                            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                                {dialogError}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsDownloadDialogOpen(false)}
                                            className="inline-flex justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:text-white/90"
                                        >
                                            Abbrechen
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleExport}
                                            disabled={!canConfirmExport || isExporting}
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#A1E2F8] px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-[#7dd6f1] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isExporting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Export läuft…
                                                </>
                                            ) : (
                                                <>
                                                    Export starten
                                                    {previewVariantCount > 0 && (
                                                        <span className="rounded-full bg-zinc-900/20 px-2 py-0.5 text-xs font-semibold text-zinc-900/80">
                                                            {previewVariantCount}x
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
};

export default CreatorPage;