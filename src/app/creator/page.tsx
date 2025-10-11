"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

import Sidebar from "@/components/Sidebar/Sidebar";
import BannerPreview from "@/components/Preview/BannerPreview";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import TemplateManager from "@/components/Creator/TemplateManager";
import { patterns } from "@/constants/patterns";
import {
    CreatorShareMode,
    CreatorState,
    Pattern,
    SavedTemplate,
    TextStyles,
} from "@/types";
import { parseCSS } from "@/utils/parseCSS";
import { downloadBanner, sanitizeFileName } from "@/utils/downloadBanner";

const STORAGE_KEY = "banny-presets";
const STORAGE_VERSION = 1;
const CURRENT_SCHEMA_VERSION = 1;
const SHARE_QUERY_PARAM = "preset";

interface PresetStoragePayload {
    version: number;
    lastDraft?: CreatorState;
    templates: SavedTemplate[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isValidAlignment = (value: unknown): value is TextStyles["alignment"] =>
    value === "left" || value === "center" || value === "right" || value === "justify";

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value);

const isTextStyles = (value: unknown): value is TextStyles => {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.bold === "boolean" &&
        typeof value.italic === "boolean" &&
        typeof value.underline === "boolean" &&
        typeof value.strikethrough === "boolean" &&
        typeof value.noWrap === "boolean" &&
        isFiniteNumber(value.fontSize) &&
        isValidAlignment(value.alignment) &&
        typeof value.textColor === "string" &&
        typeof value.fontFamily === "string"
    );
};

const isCreatorState = (value: unknown): value is CreatorState => {
    if (!isRecord(value)) {
        return false;
    }

    if (!isFiniteNumber(value.schemaVersion) || typeof value.textContent !== "string") {
        return false;
    }

    if (!isRecord(value.pattern) || typeof value.pattern.name !== "string") {
        return false;
    }

    if (
        typeof value.patternColor1 !== "string" ||
        typeof value.patternColor2 !== "string" ||
        !isFiniteNumber(value.patternScale)
    ) {
        return false;
    }

    if (!isTextStyles(value.textStyles)) {
        return false;
    }

    if (!Array.isArray(value.elements)) {
        return false;
    }

    return value.elements.every(
        (element) =>
            isRecord(element) &&
            typeof element.id === "string" &&
            element.type === "text" &&
            typeof element.textContent === "string" &&
            isTextStyles(element.textStyles),
    );
};

const cloneCreatorState = (state: CreatorState): CreatorState => ({
    schemaVersion: state.schemaVersion,
    textContent: state.textContent,
    textStyles: { ...state.textStyles },
    elements: state.elements.map((element) => ({
        ...element,
        textStyles: { ...element.textStyles },
    })),
    pattern: { ...state.pattern },
    patternColor1: state.patternColor1,
    patternColor2: state.patternColor2,
    patternScale: state.patternScale,
});

const encodeStateForUrl = (state: CreatorState): string => {
    if (typeof window === "undefined") {
        throw new Error("Teilen ist nur im Browser verfügbar.");
    }

    const json = JSON.stringify(state);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(json);
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    const base64 = window.btoa(binary);
    return encodeURIComponent(base64);
};

const decodeStateFromUrl = (encoded: string): CreatorState | null => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const base64 = decodeURIComponent(encoded);
        const binary = window.atob(base64);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const decoder = new TextDecoder();
        const json = decoder.decode(bytes);
        const parsed = JSON.parse(json);
        return isCreatorState(parsed) ? parsed : null;
    } catch (error) {
        console.error("Fehler beim Dekodieren der geteilten Vorlage", error);
        return null;
    }
};

const copyToClipboard = async (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
};

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
    const [isDownloading, setIsDownloading] = useState(false);
    const [templates, setTemplates] = useState<SavedTemplate[]>([]);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const hasHydratedRef = useRef(false);

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

    const currentState = useMemo<CreatorState>(
        () => {
            const baseStyles = { ...textStyles };
            return {
                schemaVersion: CURRENT_SCHEMA_VERSION,
                textContent,
                textStyles: baseStyles,
                elements: [
                    {
                        id: "text-1",
                        type: "text",
                        textContent,
                        textStyles: { ...baseStyles },
                    },
                ],
                pattern: {
                    name: selectedPattern.name,
                },
                patternColor1,
                patternColor2,
                patternScale,
            };
        },
        [patternColor1, patternColor2, patternScale, selectedPattern.name, textContent, textStyles],
    );

    const applyCreatorState = useCallback(
        (state: CreatorState, contextLabel?: string) => {
            if (state.schemaVersion !== CURRENT_SCHEMA_VERSION) {
                setErrorMessage(
                    "Die Vorlage verwendet eine inkompatible Schema-Version und kann nicht geladen werden.",
                );
                return false;
            }

            const resolvedPattern = patterns.find((pattern) => pattern.name === state.pattern.name);

            if (!resolvedPattern) {
                setErrorMessage(
                    "Das Pattern der Vorlage konnte nicht gefunden werden. Bitte aktualisiere deine gespeicherten Vorlagen.",
                );
                return false;
            }

            const resolvedTextStyles = isTextStyles(state.textStyles)
                ? state.textStyles
                : state.elements.find((element) => element.type === "text")?.textStyles;

            if (!resolvedTextStyles || !isTextStyles(resolvedTextStyles)) {
                setErrorMessage("Die Textstile der Vorlage sind ungültig.");
                return false;
            }

            setSelectedPattern(resolvedPattern);
            setPatternColor1(state.patternColor1);
            setPatternColor2(state.patternColor2);
            setPatternScale(state.patternScale);
            setTextContent(state.textContent);
            setTextStyles({ ...resolvedTextStyles });
            setErrorMessage(null);

            if (contextLabel) {
                setStatusMessage(contextLabel);
            }

            return true;
        },
        [],
    );

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);

            if (raw) {
                const parsed = JSON.parse(raw) as PresetStoragePayload;

                if (parsed.version === STORAGE_VERSION) {
                    if (Array.isArray(parsed.templates)) {
                        const validTemplates = parsed.templates.filter(
                            (entry): entry is SavedTemplate =>
                                isRecord(entry) &&
                                typeof entry.id === "string" &&
                                typeof entry.name === "string" &&
                                typeof entry.createdAt === "string" &&
                                isCreatorState(entry.state),
                        );

                        setTemplates(
                            validTemplates.map((template) => ({
                                ...template,
                                state: cloneCreatorState(template.state),
                            })),
                        );
                    }

                    if (parsed.lastDraft && isCreatorState(parsed.lastDraft)) {
                        applyCreatorState(parsed.lastDraft);
                    }
                } else {
                    setErrorMessage(
                        "Lokale Daten verwenden eine ältere Version und konnten nicht automatisch geladen werden.",
                    );
                }
            }
        } catch (error) {
            console.error("Fehler beim Laden der Presets", error);
            setErrorMessage("Vorlagen konnten nicht aus dem lokalen Speicher geladen werden.");
        }

        const params = new URLSearchParams(window.location.search);
        const sharedPreset = params.get(SHARE_QUERY_PARAM);

        if (sharedPreset) {
            const decodedState = decodeStateFromUrl(sharedPreset);

            if (decodedState) {
                const applied = applyCreatorState(
                    decodedState,
                    "Geteilte Vorlage erfolgreich angewendet.",
                );
                if (!applied) {
                    setErrorMessage("Die geteilte Vorlage konnte nicht angewendet werden.");
                }
            } else {
                setErrorMessage("Die geteilte Vorlage ist beschädigt oder inkompatibel.");
            }

            params.delete(SHARE_QUERY_PARAM);
            const newSearch = params.toString();
            const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}${window.location.hash}`;
            window.history.replaceState({}, "", newUrl);
        }

        hasHydratedRef.current = true;
    }, [applyCreatorState]);

    useEffect(() => {
        if (!hasHydratedRef.current || typeof window === "undefined") {
            return;
        }

        const payload: PresetStoragePayload = {
            version: STORAGE_VERSION,
            lastDraft: cloneCreatorState(currentState),
            templates: templates.map((template) => ({
                ...template,
                state: cloneCreatorState(template.state),
            })),
        };

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (error) {
            console.error("Fehler beim Speichern der Presets", error);
            setErrorMessage("Vorlagen konnten nicht gespeichert werden. Prüfe den verfügbaren Speicher.");
        }
    }, [currentState, templates]);

    useEffect(() => {
        if (!statusMessage || typeof window === "undefined") {
            return;
        }

        const timeout = window.setTimeout(() => setStatusMessage(null), 4000);
        return () => window.clearTimeout(timeout);
    }, [statusMessage]);

    useEffect(() => {
        if (!errorMessage || typeof window === "undefined") {
            return;
        }

        const timeout = window.setTimeout(() => setErrorMessage(null), 5000);
        return () => window.clearTimeout(timeout);
    }, [errorMessage]);

    const shareState = useCallback(
        async (state: CreatorState, mode: CreatorShareMode, context: string) => {
            try {
                if (mode === "json") {
                    await copyToClipboard(JSON.stringify(state, null, 2));
                    setStatusMessage(`${context} als JSON kopiert.`);
                } else {
                    const encoded = encodeStateForUrl(state);
                    const shareUrl = `${window.location.origin}${window.location.pathname}?${SHARE_QUERY_PARAM}=${encoded}`;
                    await copyToClipboard(shareUrl);
                    setStatusMessage(`${context} als Link kopiert.`);
                }
                setErrorMessage(null);
            } catch (error) {
                console.error("Fehler beim Teilen der Vorlage", error);
                setErrorMessage("Die Vorlage konnte nicht geteilt werden.");
            }
        },
        [],
    );

    const handleSaveTemplate = useCallback<(name: string) => boolean>(
        (name) => {
            const trimmedName = name.trim();

            if (!trimmedName) {
                setErrorMessage("Bitte gib einen Namen für die Vorlage ein.");
                setStatusMessage(null);
                return false;
            }

            const nameExists = templates.some(
                (template) => template.name.toLowerCase() === trimmedName.toLowerCase(),
            );

            if (nameExists) {
                setErrorMessage(
                    `Eine Vorlage mit dem Namen "${trimmedName}" existiert bereits. Wähle einen anderen Namen.`,
                );
                setStatusMessage(null);
                return false;
            }

            const id =
                typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

            const newTemplate: SavedTemplate = {
                id,
                name: trimmedName,
                createdAt: new Date().toISOString(),
                state: cloneCreatorState(currentState),
            };

            setTemplates((prev) => [...prev, newTemplate]);
            setStatusMessage(`Vorlage "${trimmedName}" gespeichert.`);
            setErrorMessage(null);
            return true;
        },
        [currentState, templates],
    );

    const handleApplyTemplate = useCallback(
        (templateId: string) => {
            const template = templates.find((item) => item.id === templateId);

            if (!template) {
                setErrorMessage("Die ausgewählte Vorlage wurde nicht gefunden.");
                return;
            }

            applyCreatorState(template.state, `Vorlage "${template.name}" geladen.`);
        },
        [applyCreatorState, templates],
    );

    const handleDeleteTemplate = useCallback((templateId: string) => {
        setTemplates((prev) => {
            const template = prev.find((item) => item.id === templateId);
            if (template) {
                setStatusMessage(`Vorlage "${template.name}" gelöscht.`);
            }
            return prev.filter((item) => item.id !== templateId);
        });
    }, []);

    const handleShareTemplate = useCallback(
        (templateId: string, mode: CreatorShareMode) => {
            const template = templates.find((item) => item.id === templateId);

            if (!template) {
                setErrorMessage("Die ausgewählte Vorlage wurde nicht gefunden.");
                return;
            }

            void shareState(template.state, mode, `Vorlage "${template.name}"`);
        },
        [shareState, templates],
    );

    const handleShareCurrent = useCallback(
        (mode: CreatorShareMode) => {
            void shareState(currentState, mode, "Aktueller Entwurf");
        },
        [currentState, shareState],
    );

    const navItems = useMemo(
        () => [
            { href: "/", label: "Landing" },
            { href: "/creator", label: "Creator" },
        ],
        [],
    );

    const handleDownload = async () => {
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
        } finally {
            setIsDownloading(false);
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
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-2 rounded-full border border-[#A1E2F8]/60 bg-[#A1E2F8]/15 px-4 py-2 font-semibold text-[#A1E2F8] transition hover:border-[#A1E2F8] hover:bg-[#A1E2F8]/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Download className="h-4 w-4" />
                            {isDownloading ? "Bereite Download vor…" : "Download PNG"}
                        </button>
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
                                <TemplateManager
                                    templates={templates}
                                    onSaveTemplate={handleSaveTemplate}
                                    onApplyTemplate={handleApplyTemplate}
                                    onDeleteTemplate={handleDeleteTemplate}
                                    onShareTemplate={handleShareTemplate}
                                    onShareCurrent={handleShareCurrent}
                                    statusMessage={statusMessage}
                                    errorMessage={errorMessage}
                                />
                            </motion.div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default CreatorPage;