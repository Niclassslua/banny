// components/Preview/BannerPreview.tsx
import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { ImageLayer, Pattern, TextStyles } from "@/types";
import { parseCSS } from "@/utils/parseCSS";

type ResizeHandle = "nw" | "ne" | "se" | "sw";

const RESIZE_HANDLES: ResizeHandle[] = ["nw", "ne", "se", "sw"];

const HANDLE_STYLES: Record<ResizeHandle, React.CSSProperties> = {
    nw: { top: 0, left: 0, transform: "translate(-50%, -50%)" },
    ne: { top: 0, left: "100%", transform: "translate(-50%, -50%)" },
    se: { top: "100%", left: "100%", transform: "translate(-50%, -50%)" },
    sw: { top: "100%", left: 0, transform: "translate(-50%, -50%)" },
};

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
    nw: "nwse-resize",
    ne: "nesw-resize",
    se: "nwse-resize",
    sw: "nesw-resize",
};

interface BannerPreviewProps {
    selectedPattern: Pattern;
    patternColor1: string;
    patternColor2: string;
    patternScale: number;
    textContent: string;
    textStyles: TextStyles;
    previewRef: React.RefObject<HTMLDivElement>;
    onTextChange: (newText: string) => void;
    imageLayers: ImageLayer[];
    onLayerChange: (layerId: string, updates: Partial<ImageLayer>) => void;
    onSelectLayer: (layerId: string | null) => void;
    selectedLayerId: string | null;
    isDragActive: boolean;
}

type InteractionState = {
    id: string;
    type: "move" | "resize";
    handle?: ResizeHandle;
    originX: number;
    originY: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
};

const BannerPreview: React.FC<BannerPreviewProps> = ({
                                                         selectedPattern,
                                                         patternColor1,
                                                         patternColor2,
                                                         patternScale,
                                                         textContent,
                                                         textStyles,
                                                         previewRef,
                                                         onTextChange,
                                                         imageLayers,
                                                         onLayerChange,
                                                         onSelectLayer,
                                                         selectedLayerId,
                                                         isDragActive,
                                                     }) => {
    const textRef = useRef<HTMLDivElement>(null);
    const interactionRef = useRef<InteractionState | null>(null);
    const onLayerChangeRef = useRef(onLayerChange);

    useEffect(() => {
        onLayerChangeRef.current = onLayerChange;
    }, [onLayerChange]);

    useEffect(() => {
        if (!textRef.current) {
            return;
        }

        if (textRef.current.textContent !== textContent) {
            textRef.current.textContent = textContent;
        }
    }, [textContent]);

    const handlePointerMove = useCallback((event: PointerEvent) => {
        const interaction = interactionRef.current;
        if (!interaction) {
            return;
        }

        event.preventDefault();

        const deltaX = event.clientX - interaction.originX;
        const deltaY = event.clientY - interaction.originY;

        if (interaction.type === "move") {
            onLayerChangeRef.current?.(interaction.id, {
                x: interaction.startX + deltaX,
                y: interaction.startY + deltaY,
            });
            return;
        }

        const minSize = 32;
        let newX = interaction.startX;
        let newY = interaction.startY;
        let newWidth = interaction.startWidth;
        let newHeight = interaction.startHeight;

        const handle = interaction.handle ?? "se";

        if (handle.includes("e")) {
            newWidth = Math.max(minSize, interaction.startWidth + deltaX);
        }
        if (handle.includes("s")) {
            newHeight = Math.max(minSize, interaction.startHeight + deltaY);
        }
        if (handle.includes("w")) {
            newWidth = Math.max(minSize, interaction.startWidth - deltaX);
            newX = interaction.startX + (interaction.startWidth - newWidth);
        }
        if (handle.includes("n")) {
            newHeight = Math.max(minSize, interaction.startHeight - deltaY);
            newY = interaction.startY + (interaction.startHeight - newHeight);
        }

        onLayerChangeRef.current?.(interaction.id, {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
        });
    }, []);

    const endInteraction = useCallback(() => {
        if (interactionRef.current) {
            interactionRef.current = null;
        }
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", endInteraction);
    }, [handlePointerMove]);

    const startInteraction = useCallback(
        (interaction: InteractionState) => {
            interactionRef.current = interaction;
            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", endInteraction);
        },
        [endInteraction, handlePointerMove],
    );

    useEffect(() => () => endInteraction(), [endInteraction]);

    const handleLayerPointerDown = useCallback(
        (layer: ImageLayer) => (event: React.PointerEvent<HTMLDivElement>) => {
            if (event.button !== 0) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            onSelectLayer(layer.id);

            startInteraction({
                id: layer.id,
                type: "move",
                originX: event.clientX,
                originY: event.clientY,
                startX: layer.x,
                startY: layer.y,
                startWidth: layer.width,
                startHeight: layer.height,
            });
        },
        [onSelectLayer, startInteraction],
    );

    const handleResizePointerDown = useCallback(
        (layer: ImageLayer, handle: ResizeHandle) => (event: React.PointerEvent<HTMLDivElement>) => {
            if (event.button !== 0) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            onSelectLayer(layer.id);

            startInteraction({
                id: layer.id,
                type: "resize",
                handle,
                originX: event.clientX,
                originY: event.clientY,
                startX: layer.x,
                startY: layer.y,
                startWidth: layer.width,
                startHeight: layer.height,
            });
        },
        [onSelectLayer, startInteraction],
    );

    const handleBackgroundPointerDown = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) {
                onSelectLayer(null);
            }
        },
        [onSelectLayer],
    );

    const textStyle: React.CSSProperties = useMemo(
        () => ({
            fontWeight: textStyles.bold ? "bold" : "normal",
            fontStyle: textStyles.italic ? "italic" : "normal",
            textDecoration: `${textStyles.underline ? "underline" : ""} ${textStyles.strikethrough ? "line-through" : ""}`.trim(),
            fontSize: `${textStyles.fontSize}px`,
            color: textStyles.textColor,
            textAlign: textStyles.alignment as "left" | "center" | "right" | "justify",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            cursor: "text",
            outline: "none",
            whiteSpace: textStyles.noWrap ? "nowrap" : "normal",
            zIndex: 80,
            maxWidth: "90%",
        }),
        [textStyles],
    );

    return (
        <div
            ref={previewRef}
            className="pattern-surface"
            onPointerDown={handleBackgroundPointerDown}
            style={{
                ...parseCSS(selectedPattern.style, patternScale, patternColor1, patternColor2),
                position: "relative",
                width: "100%",
                height: "320px",
                overflow: "hidden",
            }}
        >
            <style>
                {`
                  .banner-text {
                    font-family: ${textStyles.fontFamily} !important;
                  }
                `}
            </style>

            {imageLayers.map((layer, index) => {
                if (!layer.visible) {
                    return null;
                }

                const isSelected = layer.id === selectedLayerId;

                return (
                    <div
                        key={layer.id}
                        className={`absolute rounded-xl cursor-move ${
                            isSelected
                                ? "ring-2 ring-[#A1E2F8] bg-black/10"
                                : "ring-1 ring-white/10 bg-black/5"
                        }`}
                        style={{
                            top: layer.y,
                            left: layer.x,
                            width: layer.width,
                            height: layer.height,
                            zIndex: 10 + index,
                            touchAction: "none",
                            userSelect: "none",
                        }}
                        onPointerDown={handleLayerPointerDown(layer)}
                    >
                        <img
                            src={layer.src}
                            alt={layer.name}
                            className="h-full w-full select-none rounded-lg object-contain"
                            draggable={false}
                        />

                        {isSelected && (
                            <>
                                {RESIZE_HANDLES.map((handle) => (
                                    <div
                                        key={handle}
                                        className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-[#A1E2F8] shadow"
                                        style={{
                                            ...HANDLE_STYLES[handle],
                                            cursor: HANDLE_CURSORS[handle],
                                        }}
                                        onPointerDown={handleResizePointerDown(layer, handle)}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                );
            })}

            <div
                className="banner-text"
                style={textStyle}
                ref={textRef}
                contentEditable
                suppressContentEditableWarning
                onPointerDown={(event) => event.stopPropagation()}
                onInput={(event) => onTextChange(event.currentTarget.textContent || "")}
                onPaste={(event) => {
                    event.preventDefault();
                    const text = event.clipboardData.getData("text/plain");
                    if (document.queryCommandSupported("insertText")) {
                        document.execCommand("insertText", false, text);
                    } else {
                        const selection = window.getSelection();
                        if (!selection || !selection.rangeCount) {
                            return;
                        }
                        selection.deleteFromDocument();
                        selection.getRangeAt(0).insertNode(document.createTextNode(text));
                        selection.collapseToEnd();
                    }
                }}
            />

            {isDragActive && (
                <div className="pointer-events-none absolute inset-0 z-[120] flex items-center justify-center rounded-2xl border-2 border-dashed border-[#A1E2F8]/80 bg-black/60 text-sm font-semibold text-[#A1E2F8]">
                    Bild hier ablegen
                </div>
            )}
        </div>
    );
};

export default BannerPreview;