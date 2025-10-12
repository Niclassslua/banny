"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import clsx from "clsx";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Download, Loader2, Upload, X } from "lucide-react";

import Sidebar from "@/components/Sidebar/Sidebar";
import BannerPreview from "@/components/Preview/BannerPreview";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import ImageLayersPanel from "@/components/Settings/ImageLayersPanel";
import { Modal } from "@/components/overlays/Modal";
import { patterns } from "@/constants/patterns";
import { ImageLayer, LayerPosition, CanvasPreset, CanvasSize, Pattern, TextLayer, TextStyles } from "@/types";
import { parseCSS } from "@/utils/parseCSS";
import {
    downloadBanner,
    sanitizeFileName,
    type BannerExportVariant,
    type BannerFormat,
} from "@/utils/downloadBanner";
import { buttonClass } from "@/utils/buttonStyles";

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

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

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

const TOAST_STYLE_MAP: Record<"info" | "success" | "error", string> = {
    info: "border-white/15 bg-white/10 text-white",
    success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
    error: "border-red-500/40 bg-red-500/15 text-red-100",
};

const BUTTON_FOCUS_RING =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8]";

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
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isExportMode, setIsExportMode] = useState(false);
    const [snappingEnabled, setSnappingEnabled] = useState(true);
    const [selectedFormats, setSelectedFormats] = useState<BannerFormat[]>(["png"]);
    const [selectedResolutions, setSelectedResolutions] = useState<string[]>(["2x"]);
    const [lossyQuality, setLossyQuality] = useState(0.92);
    const [exportProgress, setExportProgress] = useState({ total: 0, completed: 0, failed: 0 });
    const [exportToast, setExportToast] = useState<
        | {
              type: "info" | "success" | "error";
              message: string;
          }
        | null
    >(null);
    const [imageLayers, setImageLayers] = useState<ImageLayer[]>([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isImportingLayers, setIsImportingLayers] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef(0);

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

    const getPreviewDimensions = useCallback(() => {
        const width = previewRef.current?.clientWidth ?? canvasSize.width;
        const height = previewRef.current?.clientHeight ?? canvasSize.height;
        return {
            width: Math.max(1, width),
            height: Math.max(1, height),
        };
    }, [canvasSize.height, canvasSize.width]);

    useEffect(() => {
        if (!exportToast) {
            return;
        }

        const timer = window.setTimeout(() => setExportToast(null), 4000);
        return () => window.clearTimeout(timer);
    }, [exportToast]);

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
            const { width: previewWidth, height: previewHeight } = getPreviewDimensions();

            const maxInitialWidth = Math.max(120, previewWidth * 0.65);
            const calculatedWidth = Math.min(naturalWidth || maxInitialWidth, maxInitialWidth);
            const minDimension = 48;

            let widthPx = Math.max(minDimension, Math.min(calculatedWidth, previewWidth));
            const safeAspect = aspectRatio || 1;
            let heightPx = Math.max(minDimension, widthPx / safeAspect);

            if (heightPx > previewHeight) {
                const scale = previewHeight / heightPx;
                heightPx = previewHeight;
                widthPx = Math.max(minDimension, widthPx * scale);
            }

            if (widthPx > previewWidth) {
                const scale = previewWidth / widthPx;
                widthPx = previewWidth;
                heightPx = Math.max(minDimension, heightPx * scale);
            }

            const xPx = Math.max(0, (previewWidth - widthPx) / 2);
            const yPx = Math.max(0, (previewHeight - heightPx) / 2);

            const rawWidthPercent = (widthPx / previewWidth) * 100;
            const rawHeightPercent = (heightPx / previewHeight) * 100;
            const safeWidthPercent = Number.isFinite(rawWidthPercent)
                ? Math.min(100, Math.max(0, rawWidthPercent))
                : 100;
            const safeHeightPercent = Number.isFinite(rawHeightPercent)
                ? Math.min(100, Math.max(0, rawHeightPercent))
                : 100;

            const rawXPercent = (xPx / previewWidth) * 100;
            const rawYPercent = (yPx / previewHeight) * 100;
            const safeXPercent = Number.isFinite(rawXPercent)
                ? Math.max(0, Math.min(100 - safeWidthPercent, rawXPercent))
                : 0;
            const safeYPercent = Number.isFinite(rawYPercent)
                ? Math.max(0, Math.min(100 - safeHeightPercent, rawYPercent))
                : 0;

            return {
                id: generateLayerId(),
                name: file.name,
                src,
                width: safeWidthPercent,
                height: safeHeightPercent,
                x: safeXPercent,
                y: safeYPercent,
                visible: true,
                aspectRatio: safeAspect,
            };
        },
        [generateLayerId, getPreviewDimensions, readFileAsImageData],
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

    const handleLayerChange = useCallback(
        (layerId: string, updates: Partial<ImageLayer>) => {
            const { width: previewWidth, height: previewHeight } = getPreviewDimensions();
            const minWidthPercent = Math.min(100, (32 / previewWidth) * 100);
            const minHeightPercent = Math.min(100, (32 / previewHeight) * 100);

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

                    next.width = Math.max(minWidthPercent, Math.min(100, next.width));
                    next.height = Math.max(minHeightPercent, Math.min(100, next.height));
                    next.x = Math.max(0, Math.min(100 - next.width, next.x));
                    next.y = Math.max(0, Math.min(100 - next.height, next.y));

                    return next;
                }),
            );
        },
        [getPreviewDimensions],
    );

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
                const { width: previewWidth, height: previewHeight } = getPreviewDimensions();
                const minWidthPercent = Math.min(100, (32 / previewWidth) * 100);
                const minHeightPercent = Math.min(100, (32 / previewHeight) * 100);

                setImageLayers((prev) =>
                    prev.map((layer) => {
                        if (layer.id !== layerId) {
                            return layer;
                        }

                        const aspectRatio = data.aspectRatio || 1;
                        const centerXPercent = layer.x + layer.width / 2;
                        const centerYPercent = layer.y + layer.height / 2;

                        const currentWidthPx = (layer.width / 100) * previewWidth;
                        const safeAspect = aspectRatio || 1;
                        let widthPx = Math.max(32, currentWidthPx);
                        let heightPx = Math.max(32, widthPx / safeAspect);

                        if (heightPx > previewHeight) {
                            const scale = previewHeight / heightPx;
                            heightPx = previewHeight;
                            widthPx = Math.max(32, widthPx * scale);
                        }

                        if (widthPx > previewWidth) {
                            const scale = previewWidth / widthPx;
                            widthPx = previewWidth;
                            heightPx = Math.max(32, heightPx * scale);
                        }

                        const widthPercent = Math.max(
                            minWidthPercent,
                            Math.min(100, (widthPx / previewWidth) * 100),
                        );
                        const heightPercent = Math.max(
                            minHeightPercent,
                            Math.min(100, (heightPx / previewHeight) * 100),
                        );

                        const xPercent = Math.max(
                            0,
                            Math.min(100 - widthPercent, centerXPercent - widthPercent / 2),
                        );
                        const yPercent = Math.max(
                            0,
                            Math.min(100 - heightPercent, centerYPercent - heightPercent / 2),
                        );

                        return {
                            ...layer,
                            src: data.src,
                            name: file.name,
                            aspectRatio: safeAspect,
                            width: widthPercent,
                            height: heightPercent,
                            x: xPercent,
                            y: yPercent,
                            visible: true,
                        };
                    }),
                );
                setSelectedLayerId(layerId);
            } catch (error) {
                console.error("Layer konnte nicht ersetzt werden", error);
            }
        },
        [getPreviewDimensions, readFileAsImageData],
    );

    const renderPatternButton = (pattern: Pattern) => {
        const isSelected = pattern.name === selectedPattern.name;
        return (
            <button
                key={pattern.name}
                type="button"
                onClick={() => setSelectedPattern(pattern)}
                className={`group relative overflow-hidden rounded-2xl border ${
                    isSelected ? "border-[#A1E2F8]" : "border-white/10"
                } bg-white/5 p-2.5 text-left transition hover:border-[#A1E2F8]/60 ${BUTTON_FOCUS_RING}`}
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

    const centerSelectedLayerHorizontally = useCallback(() => {
        updateSelectedLayer((layer) => ({
            ...layer,
            position: { ...layer.position, x: 50 },
        }));
    }, [updateSelectedLayer]);

    const centerSelectedLayerVertically = useCallback(() => {
        updateSelectedLayer((layer) => ({
            ...layer,
            position: { ...layer.position, y: 50 },
        }));
    }, [updateSelectedLayer]);

    const centerSelectedLayer = useCallback(() => {
        updateSelectedLayer((layer) => ({
            ...layer,
            position: { x: 50, y: 50 },
        }));
    }, [updateSelectedLayer]);

    const toggleSnapping = useCallback(() => {
        setSnappingEnabled((prev) => !prev);
    }, []);

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
            prevLayers.map((layer) =>
                layer.id === layerId
                    ? {
                          ...layer,
                          position: {
                              x: clampPercentage(position.x),
                              y: clampPercentage(position.y),
                          },
                      }
                    : layer,
            ),
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

    const handleOpenExportDialog = () => setIsExportDialogOpen(true);

    const handleCloseExportDialog = () => {
        if (!isExporting) {
            setIsExportDialogOpen(false);
        }
    };

    const handleStartExport = async () => {
        if (!previewRef.current) {
            return;
        }

        const activeFormats = formatOptions.filter((option) => selectedFormats.includes(option.value));
        const activeResolutions = resolutionOptions.filter((option) =>
            selectedResolutions.includes(option.id),
        );

        if (activeFormats.length === 0 || activeResolutions.length === 0) {
            setExportToast({
                type: "error",
                message: "Bitte mindestens ein Format und eine Auflösung auswählen.",
            });
            return;
        }

        const variants: BannerExportVariant[] = [];
        activeFormats.forEach((format) => {
            activeResolutions.forEach((resolution) => {
                const variant: BannerExportVariant = {
                    format: format.value,
                    suffix: resolution.suffix,
                };

                if (format.value !== "svg") {
                    variant.pixelRatio = resolution.pixelRatio;
                }

                if (format.value === "jpg" || format.value === "jpeg" || format.value === "webp") {
                    variant.quality = lossyQuality;
                }

                variants.push(variant);
            });
        });

        const totalJobs = variants.length;
        if (totalJobs === 0) {
            setExportToast({
                type: "error",
                message: "Keine Export-Variante ausgewählt.",
            });
            return;
        }

        const filenameBase = sanitizeFileName(
            activeLayer?.content.trim() || selectedPattern.name || "banny-banner",
        );

        setIsExportMode(true);
        await new Promise((resolve) => requestAnimationFrame(resolve));

        setIsExporting(true);
        setExportProgress({ total: totalJobs, completed: 0, failed: 0 });
        setExportToast({
            type: "info",
            message: `Export läuft (0/${totalJobs})`,
        });

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

            const results = await downloadBanner(previewRef.current, {
                fileName: filenameBase,
                backgroundColor: exportBackground,
                targetSize: canvasSize,
                variants,
                onProgress: (event) => {
                    setExportProgress((prev) => ({
                        total: event.total,
                        completed: event.index + 1,
                        failed: prev.failed + (event.success ? 0 : 1),
                    }));
                    setExportToast({
                        type: event.success ? "info" : "error",
                        message: event.success
                            ? `Export läuft (${event.index + 1}/${event.total})`
                            : `Export läuft (${event.index + 1}/${event.total}) – Fehler bei ${event.filename}`,
                    });
                },
            });

            const failed = results.filter((result) => !result.success);

            if (failed.length === 0) {
                setExportToast({
                    type: "success",
                    message: `Export abgeschlossen (${results.length} Datei${results.length === 1 ? "" : "en"})`,
                });
                setIsExportDialogOpen(false);
            } else if (failed.length === results.length) {
                setExportToast({
                    type: "error",
                    message: "Export fehlgeschlagen. Bitte erneut versuchen.",
                });
            } else {
                setExportToast({
                    type: "error",
                    message: `Export abgeschlossen mit ${failed.length} Fehler${failed.length === 1 ? "" : "n"}.`,
                });
            }
        } catch (error) {
            console.error("Export fehlgeschlagen", error);
            setExportToast({
                type: "error",
                message: "Export konnte nicht gestartet werden.",
            });
        } finally {
            setIsExporting(false);
            setIsExportMode(false);
        }
    };

    const navItems = useMemo(
        () => [
            { href: "/", label: "Landing" },
            { href: "/creator", label: "Creator" },
        ],
        [],
    );

    const formatOptions = useMemo(
        () => [
            {
                value: "png" as BannerFormat,
                label: "PNG",
                description: "Verlustfrei mit Transparenz",
            },
            {
                value: "jpg" as BannerFormat,
                label: "JPG",
                description: "Kompakt für universelle Nutzung",
            },
            {
                value: "webp" as BannerFormat,
                label: "WebP",
                description: "Moderne Kompression mit Transparenz",
            },
            {
                value: "svg" as BannerFormat,
                label: "SVG",
                description: "Vektor (Beta, experimentell)",
            },
        ],
        [],
    );

    const resolutionOptions = useMemo(
        () => [
            {
                id: "1x",
                label: "1× Original",
                description: "Standard-Auflösung",
                pixelRatio: 1,
                suffix: "1x",
            },
            {
                id: "2x",
                label: "2× Retina",
                description: "Doppelte Auflösung",
                pixelRatio: 2,
                suffix: "2x",
            },
            {
                id: "3x",
                label: "3× Ultra",
                description: "Maximale Schärfe",
                pixelRatio: 3,
                suffix: "3x",
            },
        ],
        [],
    );

    const requiresQualityControls = useMemo(
        () => selectedFormats.some((format) => format === "jpg" || format === "jpeg" || format === "webp"),
        [selectedFormats],
    );

    const totalSelectedJobs = useMemo(
        () => selectedFormats.length * selectedResolutions.length,
        [selectedFormats, selectedResolutions],
    );

    const selectedFormatLabels = useMemo(
        () =>
            formatOptions
                .filter((option) => selectedFormats.includes(option.value))
                .map((option) => option.label)
                .join(", "),
        [formatOptions, selectedFormats],
    );

    const selectedResolutionLabels = useMemo(
        () =>
            resolutionOptions
                .filter((option) => selectedResolutions.includes(option.id))
                .map((option) => option.label)
                .join(", "),
        [resolutionOptions, selectedResolutions],
    );

    const exportFileNamePreview = useMemo(
        () =>
            sanitizeFileName(
                (activeLayer?.content ?? "").trim() || selectedPattern.name || "banny-banner",
            ),
        [activeLayer?.content, selectedPattern.name],
    );

    const toggleFormat = (format: BannerFormat) => {
        setSelectedFormats((prev) => {
            if (prev.includes(format)) {
                return prev.filter((item) => item !== format);
            }
            return [...prev, format];
        });
    };

    const toggleResolution = (id: string) => {
        setSelectedResolutions((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            }
            return [...prev, id];
        });
    };

    const handleQualityChange = (event: ChangeEvent<HTMLInputElement>) => {
        setLossyQuality(Number(event.target.value));
    };

    

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-white">
            <Modal
                isOpen={isExportDialogOpen}
                onClose={handleCloseExportDialog}
                labelledBy="export-dialog-title"
                preventClose={isExporting}
            >
                <button
                    type="button"
                    onClick={handleCloseExportDialog}
                    disabled={isExporting}
                    className={clsx(buttonClass("icon"), "absolute right-4 top-4")}
                    aria-label="Dialog schließen"
                >
                    <X className="h-4 w-4" />
                </button>
                <div className="flex flex-col gap-6 p-6 sm:p-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-[0.35em] text-[#A1E2F8]">Export</span>
                        <h2
                            id="export-dialog-title"
                            className="text-2xl font-semibold text-white sm:text-3xl"
                        >
                            Banner exportieren
                        </h2>
                        <p className="text-sm text-white/60">
                            Wähle Formate und Auflösungen für deinen Download. Mehrere Varianten werden nacheinander exportiert.
                        </p>
                    </div>
                    <div className="grid gap-6">
                                <section className="grid gap-3">
                                    <h3 className="text-sm font-semibold text-white">Format</h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {formatOptions.map((option) => {
                                            const isSelected = selectedFormats.includes(option.value);
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => toggleFormat(option.value)}
                                                    disabled={isExporting}
                                                    className={clsx(
                                                        "group flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition",
                                                        isSelected
                                                            ? "border-[#A1E2F8] bg-[#A1E2F8]/15 text-white"
                                                            : "border-white/10 bg-white/5 text-white/70 hover:border-[#A1E2F8]/40 hover:text-white",
                                                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8] disabled:pointer-events-none disabled:opacity-50",
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-base font-semibold">{option.label}</span>
                                                        <span
                                                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                                                isSelected
                                                                    ? "border-[#A1E2F8] bg-[#A1E2F8]/80"
                                                                    : "border-white/20 bg-transparent"
                                                            }`}
                                                        >
                                                            {isSelected && <Check className="h-3 w-3 text-zinc-950" />}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-white/60 group-hover:text-white/70">{option.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                                <section className="grid gap-3">
                                    <h3 className="text-sm font-semibold text-white">Auflösung</h3>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {resolutionOptions.map((resolution) => {
                                            const isSelected = selectedResolutions.includes(resolution.id);
                                            return (
                                                <button
                                                    key={resolution.id}
                                                    type="button"
                                                    onClick={() => toggleResolution(resolution.id)}
                                                    disabled={isExporting}
                                                    className={clsx(
                                                        "group flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition",
                                                        isSelected
                                                            ? "border-[#A1E2F8] bg-[#A1E2F8]/15 text-white"
                                                            : "border-white/10 bg-white/5 text-white/70 hover:border-[#A1E2F8]/40 hover:text-white",
                                                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8] disabled:pointer-events-none disabled:opacity-50",
                                                    )}
                                                >
                                                    <div className="text-base font-semibold">{resolution.label}</div>
                                                    <p className="text-xs text-white/60 group-hover:text-white/70">{resolution.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                                {requiresQualityControls && (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-white">Qualität für JPG &amp; WebP</h3>
                                                <p className="text-xs text-white/60">
                                                    Höhere Werte bedeuten größere Dateien, niedrigere Werte sparen Speicher.
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold text-[#A1E2F8]">{Math.round(lossyQuality * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={0.5}
                                            max={1}
                                            step={0.05}
                                            value={lossyQuality}
                                            onChange={handleQualityChange}
                                            disabled={isExporting}
                                            className="mt-4 w-full accent-[#A1E2F8]"
                                        />
                                    </div>
                                )}
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-medium text-white">Geplante Exporte</span>
                                        <span className="font-semibold text-[#A1E2F8]">{totalSelectedJobs}</span>
                                    </div>
                                    <p className="mt-2 text-xs text-white/60">
                                        {selectedFormatLabels ? `Formate: ${selectedFormatLabels}.` : "Kein Format ausgewählt."}{" "}
                                        {selectedResolutionLabels
                                            ? `Auflösungen: ${selectedResolutionLabels}.`
                                            : "Keine Auflösung ausgewählt."}
                                    </p>
                                    <p className="mt-1 text-xs text-white/60">
                                        Dateiname-Basis: <span className="font-semibold text-white">{exportFileNamePreview}</span>
                                    </p>
                                    {isExporting && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-[#A1E2F8]">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Fortschritt {exportProgress.completed}/{exportProgress.total}
                                            {exportProgress.failed > 0 && (
                                                <span className="text-red-300"> · Fehler {exportProgress.failed}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-white/50">
                                    Tipp: Du kannst mehrere Varianten gleichzeitig exportieren. Die Dateien werden automatisch benannt.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseExportDialog}
                                        disabled={isExporting}
                                        className={buttonClass("secondary")}
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleStartExport}
                                        disabled={isExporting || totalSelectedJobs === 0}
                                        className={buttonClass("primary")}
                                    >
                                        {isExporting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Export läuft…
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4" />
                                                Export starten
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                </div>
            </Modal>
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
                            onClick={handleOpenExportDialog}
                            disabled={isExporting}
                            className={buttonClass("primary")}
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Export läuft…
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Exportieren
                                </>
                            )}
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
                                centerLayer={centerSelectedLayer}
                                centerLayerHorizontally={centerSelectedLayerHorizontally}
                                centerLayerVertically={centerSelectedLayerVertically}
                                snappingEnabled={snappingEnabled}
                                toggleSnapping={toggleSnapping}
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
                                        selectedLayerId={selectedLayerId}
                                        previewRef={previewRef}
                                        onLayerContentChange={handleLayerContentChange}
                                        onLayerPositionChange={handleLayerPositionChange}
                                        onSelectLayer={handleSelectLayer}
                                        imageLayers={imageLayers}
                                        onImageLayerChange={handleLayerChange}
                                        canvasSize={canvasSize}
                                        isDragActive={isDragActive}
                                        isExportMode={isExportMode}
                                        enableSnapping={snappingEnabled}
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
                                            className={`inline-flex items-center gap-2 rounded-xl border border-[#A1E2F8]/60 bg-[#A1E2F8]/15 px-4 py-2 text-sm font-semibold text-[#A1E2F8] transition hover:border-[#A1E2F8] hover:bg-[#A1E2F8]/30 hover:text-white ${BUTTON_FOCUS_RING}`}
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
                                    canvasSize={canvasSize}
                                />
                            </motion.div>
                        </div>
                    </div>
                </motion.section>
            </div>
            {exportToast && (
                <div
                    className={`fixed bottom-6 right-6 z-50 max-w-xs rounded-2xl border px-4 py-3 shadow-xl shadow-black/40 backdrop-blur ${TOAST_STYLE_MAP[exportToast.type]}`}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10">
                            {exportToast.type === "success" ? (
                                <Check className="h-4 w-4 text-emerald-300" />
                            ) : exportToast.type === "error" ? (
                                <X className="h-4 w-4 text-red-300" />
                            ) : (
                                <Loader2 className="h-4 w-4 animate-spin text-[#A1E2F8]" />
                            )}
                        </div>
                        <p className="text-sm font-medium leading-snug">{exportToast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatorPage;
