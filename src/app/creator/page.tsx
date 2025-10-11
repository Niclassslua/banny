"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Upload } from "lucide-react";

import Sidebar from "@/components/Sidebar/Sidebar";
import BannerPreview from "@/components/Preview/BannerPreview";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import ImageLayersPanel from "@/components/Settings/ImageLayersPanel";
import { patterns } from "@/constants/patterns";
import { ImageLayer, LayerPosition, CanvasPreset, CanvasSize, Pattern, TextLayer, TextStyles } from "@/types";
import { parseCSS } from "@/utils/parseCSS";
import { downloadBanner, sanitizeFileName } from "@/utils/downloadBanner";

const DEFAULT_TEXT_STYLES: TextStyles = {
    bold: true,
    italic: false,
    underline: false,
    strikethrough: false,
    noWrap: false,
    fontSize: 72,
    alignment: "center",
    textColor: "#FFFFFF",
    fontFamily: "Arial, sans-serif",
};

const DEFAULT_LAYER_POSITION: LayerPosition = {
    x: 50,
    y: 50,
};

type LayerOverrides = Partial<Omit<TextLayer, "styles" | "position">> & {
    styles?: Partial<TextStyles>;
    position?: Partial<LayerPosition>;
};

const generateLayerId = () => {
    if (typeof window !== "undefined" && typeof window.crypto?.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `layer-${Math.random().toString(36).slice(2, 11)}`;
};

const createTextLayer = (overrides: LayerOverrides = {}): TextLayer => ({
    id: overrides.id ?? generateLayerId(),
    content: overrides.content ?? "Text",
    styles: { ...DEFAULT_TEXT_STYLES, ...(overrides.styles ?? {}) },
    position: { ...DEFAULT_LAYER_POSITION, ...(overrides.position ?? {}) },
});

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

    const initialLayerRef = useRef<TextLayer | null>(null);
    if (!initialLayerRef.current) {
        initialLayerRef.current = createTextLayer();
    }

    const [layers, setLayers] = useState<TextLayer[]>(() => [initialLayerRef.current as TextLayer]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
        () => initialLayerRef.current?.id ?? null,
    );

    const activeLayer = useMemo(
        () => layers.find((layer) => layer.id === selectedLayerId) ?? layers[0] ?? null,
        [layers, selectedLayerId],
    );

    useEffect(() => {
        if (!selectedLayerId && layers.length > 0) {
            setSelectedLayerId(layers[0].id);
        }
    }, [layers, selectedLayerId]);

    const [selectedPattern, setSelectedPattern] = useState(() => patterns[0]);
    const [patternColor1, setPatternColor1] = useState("#131313");
    const [patternColor2, setPatternColor2] = useState("#b3b3c4");
    const [patternScale, setPatternScale] = useState(14);
    const [visiblePicker, setVisiblePicker] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const darkMode = true;
    const [isDownloading, setIsDownloading] = useState(false);
    const [imageLayers, setImageLayers] = useState<ImageLayer[]>([]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isImportingLayers, setIsImportingLayers] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef(0);

    const generateLayerId = useCallback(() => {
        if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
            return crypto.randomUUID();
        }
        return `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }, []);

    const readFileAsImageData = useCallback(
        (file: File) =>
            new Promise<{
                src: string;
                naturalWidth: number;
                naturalHeight: number;
                aspectRatio: number;
            }>((resolve, reject) => {
                if (!file.type.startsWith("image/")) {
                    reject(new Error("Nur Bilddateien können verwendet werden."));
                    return;
                }

                const reader = new FileReader();
                reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
                reader.onload = () => {
                    const result = reader.result;
                    if (typeof result !== "string") {
                        reject(new Error("Ungültiges Dateiformat."));
                        return;
                    }

                    const image = new Image();
                    image.onload = () => {
                        const naturalWidth = image.naturalWidth || image.width || 1;
                        const naturalHeight = image.naturalHeight || image.height || 1;
                        const aspectRatio = naturalWidth / (naturalHeight || 1) || 1;
                        resolve({
                            src: result,
                            naturalWidth,
                            naturalHeight,
                            aspectRatio,
                        });
                    };
                    image.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
                    image.src = result;
                };
                reader.readAsDataURL(file);
            }),
        [],
    );

    const createLayerFromFile = useCallback(
        async (file: File): Promise<ImageLayer> => {
            const { src, naturalWidth, aspectRatio } = await readFileAsImageData(file);
            const previewWidth = previewRef.current?.clientWidth ?? 800;
            const previewHeight = previewRef.current?.clientHeight ?? 320;

            const maxInitialWidth = Math.max(120, previewWidth * 0.65);
            const calculatedWidth = Math.min(naturalWidth || maxInitialWidth, maxInitialWidth);
            const width = Math.max(48, calculatedWidth);
            const height = width / (aspectRatio || 1);

            const x = Math.max(0, (previewWidth - width) / 2);
            const y = Math.max(0, (previewHeight - height) / 2);

            return {
                id: generateLayerId(),
                name: file.name,
                src,
                width,
                height,
                x,
                y,
                visible: true,
                aspectRatio: aspectRatio || 1,
            };
        },
        [generateLayerId, readFileAsImageData],
    );

    const handleAddFiles = useCallback(
        async (fileList: FileList | null) => {
            if (!fileList || fileList.length === 0) {
                return;
            }

            const candidates = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
            if (candidates.length === 0) {
                return;
            }

            setIsImportingLayers(true);

            try {
                const newLayers = await Promise.all(candidates.map((file) => createLayerFromFile(file)));
                if (newLayers.length === 0) {
                    return;
                }

                setImageLayers((prev) => [...prev, ...newLayers]);
                setSelectedLayerId(newLayers[newLayers.length - 1].id);
            } catch (error) {
                console.error("Konnte Bild-Layer nicht erstellen", error);
            } finally {
                setIsImportingLayers(false);
            }
        },
        [createLayerFromFile],
    );

    const handleFileInputChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            void handleAddFiles(event.target.files);
            event.target.value = "";
        },
        [handleAddFiles],
    );

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        dragCounterRef.current += 1;
        setIsDragActive(true);
    }, []);

    const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "copy";
        }
    }, []);

    const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
        if (dragCounterRef.current === 0) {
            setIsDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            dragCounterRef.current = 0;
            setIsDragActive(false);
            void handleAddFiles(event.dataTransfer?.files ?? null);
        },
        [handleAddFiles],
    );

    const handleLayerChange = useCallback((layerId: string, updates: Partial<ImageLayer>) => {
        setImageLayers((prev) =>
            prev.map((layer) => {
                if (layer.id !== layerId) {
                    return layer;
                }

                const next: ImageLayer = {
                    ...layer,
                    ...updates,
                };

                if (!Number.isFinite(next.width)) {
                    next.width = layer.width;
                }
                if (!Number.isFinite(next.height)) {
                    next.height = layer.height;
                }
                if (!Number.isFinite(next.x)) {
                    next.x = layer.x;
                }
                if (!Number.isFinite(next.y)) {
                    next.y = layer.y;
                }

                next.width = Math.max(32, next.width);
                next.height = Math.max(32, next.height);

                return next;
            }),
        );
    }, []);

    const handleMoveLayer = useCallback((layerId: string, direction: "up" | "down") => {
        setImageLayers((prev) => {
            const index = prev.findIndex((layer) => layer.id === layerId);
            if (index === -1) {
                return prev;
            }

            const targetIndex = direction === "up" ? index + 1 : index - 1;
            if (targetIndex < 0 || targetIndex >= prev.length) {
                return prev;
            }

            const reordered = [...prev];
            const [item] = reordered.splice(index, 1);
            reordered.splice(targetIndex, 0, item);
            return reordered;
        });
    }, []);

    const handleToggleLayerVisibility = useCallback((layerId: string) => {
        let wasHidden = false;
        setImageLayers((prev) =>
            prev.map((layer) => {
                if (layer.id !== layerId) {
                    return layer;
                }

                const nextVisible = !layer.visible;
                if (!nextVisible) {
                    wasHidden = true;
                }

                return {
                    ...layer,
                    visible: nextVisible,
                };
            }),
        );

        if (wasHidden) {
            setSelectedLayerId((current) => (current === layerId ? null : current));
        }
    }, [setSelectedLayerId]);

    const handleReplaceLayer = useCallback(
        async (layerId: string, file: File) => {
            try {
                const data = await readFileAsImageData(file);
                setImageLayers((prev) =>
                    prev.map((layer) => {
                        if (layer.id !== layerId) {
                            return layer;
                        }

                        const aspectRatio = data.aspectRatio || 1;
                        const centerX = layer.x + layer.width / 2;
                        const centerY = layer.y + layer.height / 2;
                        const width = Math.max(32, layer.width);
                        const height = Math.max(32, width / aspectRatio);
                        const x = Math.max(0, centerX - width / 2);
                        const y = Math.max(0, centerY - height / 2);

                        return {
                            ...layer,
                            src: data.src,
                            name: file.name,
                            aspectRatio,
                            width,
                            height,
                            x,
                            y,
                            visible: true,
                        };
                    }),
                );
                setSelectedLayerId(layerId);
            } catch (error) {
                console.error("Layer konnte nicht ersetzt werden", error);
            }
        },
        [readFileAsImageData],
    );

    const canvasPresets = useMemo<CanvasPreset[]>(
        () => [
            { label: "Twitter Header", width: 1500, height: 500 },
            { label: "LinkedIn Banner", width: 1584, height: 396 },
            { label: "YouTube Banner", width: 2048, height: 1152 },
        ],
        [],
    );

    const [canvasSize, setCanvasSize] = useState<CanvasSize>(() => ({
        width: canvasPresets[0].width,
        height: canvasPresets[0].height,
    }));

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

    const updateSelectedLayer = useCallback(
        (updater: (layer: TextLayer) => TextLayer) => {
            if (!selectedLayerId) {
                return;
            }

            setLayers((prevLayers) =>
                prevLayers.map((layer) => (layer.id === selectedLayerId ? updater(layer) : layer)),
            );
        },
        [selectedLayerId],
    );

    const toggleStyle = (style: "bold" | "italic" | "underline" | "strikethrough") =>
        updateSelectedLayer((layer) => ({
            ...layer,
            styles: { ...layer.styles, [style]: !layer.styles[style] },
        }));

    const changeFontSize = (size: number) =>
        updateSelectedLayer((layer) => ({
            ...layer,
            styles: { ...layer.styles, fontSize: size },
        }));

    const changeAlignment = (alignment: "left" | "center" | "right" | "justify") =>
        updateSelectedLayer((layer) => ({
            ...layer,
            styles: { ...layer.styles, alignment },
        }));

    const changeTextColor = (color: string) =>
        updateSelectedLayer((layer) => ({
            ...layer,
            styles: { ...layer.styles, textColor: color },
        }));

    const changeFontFamily = (fontFamily: string) =>
        updateSelectedLayer((layer) => ({
            ...layer,
            styles: { ...layer.styles, fontFamily },
        }));

    const toggleNoWrap = () =>
        updateSelectedLayer((layer) => ({
            ...layer,
            styles: { ...layer.styles, noWrap: !layer.styles.noWrap },
        }));

    const handleLayerContentChange = (layerId: string, content: string) => {
        setLayers((prevLayers) =>
            prevLayers.map((layer) => (layer.id === layerId ? { ...layer, content } : layer)),
        );
    };

    const handleLayerPositionChange = (layerId: string, position: LayerPosition) => {
        setLayers((prevLayers) =>
            prevLayers.map((layer) => (layer.id === layerId ? { ...layer, position } : layer)),
        );
    };

    const handleSelectLayer = (layerId: string) => {
        setSelectedLayerId(layerId);
    };

    const handleAddLayer = () => {
        const newLayer = createTextLayer();
        setLayers((prevLayers) => [...prevLayers, newLayer]);
        setSelectedLayerId(newLayer.id);
    };

    const handleDuplicateLayer = (layerId: string) => {
        const sourceLayer = layers.find((layer) => layer.id === layerId);
        if (!sourceLayer) {
            return;
        }

        const newLayer = createTextLayer({
            content: sourceLayer.content,
            styles: { ...sourceLayer.styles },
            position: {
                x: Math.min(100, sourceLayer.position.x + 5),
                y: Math.min(100, sourceLayer.position.y + 5),
            },
        });

        setLayers((prevLayers) => [...prevLayers, newLayer]);
        setSelectedLayerId(newLayer.id);
    };

    const handleDeleteLayer = (layerId: string) => {
        setLayers((prevLayers) => {
            if (prevLayers.length === 1) {
                const replacement = createTextLayer();
                setSelectedLayerId(replacement.id);
                return [replacement];
            }

            const filteredLayers = prevLayers.filter((layer) => layer.id !== layerId);
            setSelectedLayerId((currentId) => {
                if (currentId === layerId) {
                    return filteredLayers[filteredLayers.length - 1]?.id ?? null;
                }

                return currentId;
            });
            return filteredLayers;
        });
    };

    const togglePicker = (pickerId: string) =>
        setVisiblePicker((prev) => (prev === pickerId ? null : pickerId));

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
            activeLayer?.content.trim() || selectedPattern.name || "banny-banner",
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
                targetSize: canvasSize,
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
                                layers={layers}
                                activeLayerId={activeLayer?.id ?? null}
                                toggleStyle={toggleStyle}
                                changeFontSize={changeFontSize}
                                changeAlignment={changeAlignment}
                                currentFontSize={
                                    activeLayer?.styles.fontSize ?? DEFAULT_TEXT_STYLES.fontSize
                                }
                                changeTextColor={changeTextColor}
                                changeFontFamily={changeFontFamily}
                                noWrap={activeLayer?.styles.noWrap ?? DEFAULT_TEXT_STYLES.noWrap}
                                toggleNoWrap={toggleNoWrap}
                                textStyles={activeLayer?.styles ?? DEFAULT_TEXT_STYLES}
                                onAddLayer={handleAddLayer}
                                onSelectLayer={handleSelectLayer}
                                onDuplicateLayer={handleDuplicateLayer}
                                onDeleteLayer={handleDeleteLayer}
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
                                <div
                                    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 transition ${
                                        isDragActive
                                            ? "border-[#A1E2F8]/60 shadow-[0_0_0_4px_rgba(161,226,248,0.25)]"
                                            : ""
                                    }`}
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <BannerPreview
                                        selectedPattern={selectedPattern}
                                        patternColor1={patternColor1}
                                        patternColor2={patternColor2}
                                        patternScale={patternScale}
                                        layers={layers}
                                        selectedLayerId={activeLayer?.id ?? null}
                                        previewRef={previewRef}
                                        onLayerContentChange={handleLayerContentChange}
                                        onLayerPositionChange={handleLayerPositionChange}
                                        onSelectLayer={handleSelectLayer}
                                        onTextChange={setTextContent}
                                        imageLayers={imageLayers}
                                        onLayerChange={handleLayerChange}
                                        onSelectLayer={setSelectedLayerId}
                                        selectedLayerId={selectedLayerId}
                                        isDragActive={isDragActive}
                                        canvasSize={canvasSize}
                                    />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileInputChange}
                                    />
                                </div>
                                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span>
                                            Ziehe Bilder direkt in die Vorschau oder nutze den Upload-Button.
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleUploadClick}
                                            className="inline-flex items-center gap-2 rounded-xl border border-[#A1E2F8]/60 bg-[#A1E2F8]/15 px-4 py-2 text-sm font-semibold text-[#A1E2F8] transition hover:border-[#A1E2F8] hover:bg-[#A1E2F8]/30 hover:text-white"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Bilder hochladen
                                        </button>
                                    </div>
                                    {isImportingLayers && (
                                        <span className="text-xs text-[#A1E2F8]">Verarbeite Upload …</span>
                                    )}
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
                                        canvasSize={canvasSize}
                                        setCanvasSize={setCanvasSize}
                                        canvasPresets={canvasPresets}
                                    />
                                </div>

                                <ImageLayersPanel
                                    layers={imageLayers}
                                    selectedLayerId={selectedLayerId}
                                    onSelectLayer={setSelectedLayerId}
                                    onToggleVisibility={handleToggleLayerVisibility}
                                    onMoveLayer={handleMoveLayer}
                                    onReplaceLayer={handleReplaceLayer}
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