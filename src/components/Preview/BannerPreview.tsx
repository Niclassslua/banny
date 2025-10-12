import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import {
  ImageLayer,
  LayerPosition,
  TextStyles,
  Pattern,
  TextLayer,
  CanvasSize,
} from "@/types";
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
  // Pattern / Hintergrund
  selectedPattern: Pattern;
  patternColor1: string;
  patternColor2: string;
  patternScale: number;

  // Text-Layer (relativ in %)
  layers: TextLayer[];
  selectedLayerId: string | null;
  previewRef: React.RefObject<HTMLDivElement>;
  onLayerContentChange: (layerId: string, newText: string) => void;
  onLayerPositionChange: (layerId: string, position: LayerPosition) => void;
  onSelectLayer: (layerId: string | null) => void;

  // Optional: zusätzlich zentrierter Freitext (falls benötigt)
  textContent?: string;
  textStyles?: TextStyles;
  onTextChange?: (newText: string) => void;

  // Bild-Layer (px-basiert)
  imageLayers: ImageLayer[];
  onImageLayerChange: (layerId: string, updates: Partial<ImageLayer>) => void;

  // Canvas-Größe (optional; mit aspect-ratio)
  canvasSize?: CanvasSize;

  // Drag&Drop Overlay für Uploads
  isDragActive?: boolean;

  // Export-Modus blendet UI-Hilfen aus
  isExportMode?: boolean;
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

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

const BannerPreview: React.FC<BannerPreviewProps> = ({
  selectedPattern,
  patternColor1,
  patternColor2,
  patternScale,

  // Text-Layer
  layers,
  selectedLayerId,
  previewRef,
  onLayerContentChange,
  onLayerPositionChange,
  onSelectLayer,

  // optionaler Freitext
  textContent,
  textStyles,
  onTextChange,

  // Bild-Layer
  imageLayers,
  onImageLayerChange,

  canvasSize,
  isDragActive,
  isExportMode = false,
}) => {
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number }>(() => ({
    width: canvasSize?.width ?? 0,
    height: canvasSize?.height ?? 0,
  }));

  useEffect(() => {
    const node = previewRef.current;
    if (!node) return;

    const updateSize = () => {
      setDisplaySize({ width: node.clientWidth, height: node.clientHeight });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [previewRef, canvasSize?.width, canvasSize?.height]);

  const previewWidth = displaySize.width || canvasSize?.width || 0;
  const previewHeight = displaySize.height || canvasSize?.height || 0;

  // ----- Bild-Layer Interaktion (px)
  const interactionRef = useRef<InteractionState | null>(null);
  const onImageLayerChangeRef = useRef(onImageLayerChange);
  useEffect(() => {
    onImageLayerChangeRef.current = onImageLayerChange;
  }, [onImageLayerChange]);

  const handleImagePointerMove = useCallback((event: PointerEvent) => {
    const interaction = interactionRef.current;
    if (!interaction) return;

    event.preventDefault();

    const deltaX = event.clientX - interaction.originX;
    const deltaY = event.clientY - interaction.originY;

    const container = previewRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;
    const deltaXPercent = (deltaX / width) * 100;
    const deltaYPercent = (deltaY / height) * 100;

    if (interaction.type === "move") {
      onImageLayerChangeRef.current?.(interaction.id, {
        x: interaction.startX + deltaXPercent,
        y: interaction.startY + deltaYPercent,
      });
      return;
    }

    const minWidthPercent = (32 / width) * 100;
    const minHeightPercent = (32 / height) * 100;
    let newX = interaction.startX;
    let newY = interaction.startY;
    let newWidth = interaction.startWidth;
    let newHeight = interaction.startHeight;

    const handle = interaction.handle ?? "se";

    if (handle.includes("e")) newWidth = Math.max(minWidthPercent, interaction.startWidth + deltaXPercent);
    if (handle.includes("s")) newHeight = Math.max(minHeightPercent, interaction.startHeight + deltaYPercent);
    if (handle.includes("w")) {
      newWidth = Math.max(minWidthPercent, interaction.startWidth - deltaXPercent);
      newX = interaction.startX + (interaction.startWidth - newWidth);
    }
    if (handle.includes("n")) {
      newHeight = Math.max(minHeightPercent, interaction.startHeight - deltaYPercent);
      newY = interaction.startY + (interaction.startHeight - newHeight);
    }

    onImageLayerChangeRef.current?.(interaction.id, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  }, [previewRef]);

  const endImageInteraction = useCallback(() => {
    interactionRef.current = null;
    window.removeEventListener("pointermove", handleImagePointerMove);
    window.removeEventListener("pointerup", endImageInteraction);
  }, [handleImagePointerMove]);

  const startImageInteraction = useCallback(
    (interaction: InteractionState) => {
      interactionRef.current = interaction;
      window.addEventListener("pointermove", handleImagePointerMove);
      window.addEventListener("pointerup", endImageInteraction);
    },
    [endImageInteraction, handleImagePointerMove],
  );

  useEffect(() => () => endImageInteraction(), [endImageInteraction]);

  const handleImageLayerPointerDown = useCallback(
    (layer: ImageLayer) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || isExportMode) return;

      event.preventDefault();
      event.stopPropagation();

      onSelectLayer(layer.id);

      startImageInteraction({
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
    [isExportMode, onSelectLayer, startImageInteraction],
  );

  const handleResizePointerDown = useCallback(
    (layer: ImageLayer, handle: ResizeHandle) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || isExportMode) return;

      event.preventDefault();
      event.stopPropagation();

      onSelectLayer(layer.id);

      startImageInteraction({
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
    [isExportMode, onSelectLayer, startImageInteraction],
  );

  // ----- Text-Layer Interaktion (%, relativ zum Container)
  const draggingTextRef = useRef<{ layerId: string; pointerId: number } | null>(null);

  const updateTextPositionFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingTextRef.current || draggingTextRef.current.pointerId !== event.pointerId) return;

    const container = previewRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const relativeX = ((event.clientX - rect.left) / rect.width) * 100;
    const relativeY = ((event.clientY - rect.top) / rect.height) * 100;

    onLayerPositionChange(draggingTextRef.current.layerId, {
      x: clampPercentage(relativeX),
      y: clampPercentage(relativeY),
    });
  };

  const handleTextPointerDown = (layerId: string) => (event: React.PointerEvent<HTMLDivElement>) => {
    if (isExportMode) return;

    onSelectLayer(layerId);

    const target = event.target as HTMLElement | null;
    // Nicht ziehen, wenn im editierbaren Bereich geklickt
    if (target && target.closest("[data-editable='true']")) return;

    draggingTextRef.current = { layerId, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleTextPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingTextRef.current || isExportMode) return;
    event.preventDefault();
    updateTextPositionFromPointer(event);
  };

  const handleTextPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingTextRef.current || draggingTextRef.current.pointerId !== event.pointerId) return;

    updateTextPositionFromPointer(event);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingTextRef.current = null;
  };

  // ----- Optionaler zentrierter Freitext (falls übergeben)
  const freeTextRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!freeTextRef.current) return;
    if (typeof textContent === "string" && freeTextRef.current.textContent !== textContent) {
      freeTextRef.current.textContent = textContent;
    }
  }, [textContent]);

  const freeTextStyle: React.CSSProperties = useMemo(() => {
    if (!textStyles) return { display: "none" };
    return {
      fontWeight: textStyles.bold ? "bold" : "normal",
      fontStyle: textStyles.italic ? "italic" : "normal",
      textDecoration: `${textStyles.underline ? "underline" : ""} ${
        textStyles.strikethrough ? "line-through" : ""
      }`.trim(),
      fontSize: `${textStyles.fontSize}px`,
      color: textStyles.textColor,
      textAlign: textStyles.alignment as "left" | "center" | "right" | "justify",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      outline: "none",
      whiteSpace: textStyles.noWrap ? "nowrap" : "normal",
      zIndex: 80,
      maxWidth: "90%",
      fontFamily: textStyles.fontFamily,
    };
  }, [textStyles]);

  // ----- Background Click: Auswahl aufheben
  const handleBackgroundPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (isExportMode) return;
      if (event.target === event.currentTarget) onSelectLayer(null);
    },
    [isExportMode, onSelectLayer],
  );

  // ----- Container-Style
  const containerStyle: React.CSSProperties = useMemo(() => {
    const base: React.CSSProperties = {
      ...parseCSS(selectedPattern.style, patternScale, patternColor1, patternColor2),
      position: "relative",
      width: "100%",
      overflow: "hidden",
    };

    if (canvasSize) {
      // Responsive mit aspect-ratio
      return {
        ...base,
        maxWidth: `${canvasSize.width}px`,
        aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
        height: "auto",
      };
    }

    // Fallback: feste Höhe wenn kein canvasSize
    return {
      ...base,
      height: "320px",
    };
  }, [selectedPattern.style, patternScale, patternColor1, patternColor2, canvasSize]);

  return (
    <div
      ref={previewRef}
      className="pattern-surface"
      onPointerDown={handleBackgroundPointerDown}
      style={containerStyle}
    >
      {/* Bild-Layer (prozentbasiert) */}
      {imageLayers.map((layer, index) => {
        if (!layer.visible) return null;
        const isSelected = layer.id === selectedLayerId;
        const topPx = (layer.y / 100) * previewHeight;
        const leftPx = (layer.x / 100) * previewWidth;
        const widthPx = (layer.width / 100) * previewWidth;
        const heightPx = (layer.height / 100) * previewHeight;

        return (
          <div
            key={layer.id}
            className={clsx(
              "absolute rounded-xl",
              !isExportMode && "cursor-move",
              !isExportMode &&
                (isSelected
                  ? "ring-2 ring-[#A1E2F8] bg-black/10"
                  : "ring-1 ring-white/10 bg-black/5"),
            )}
            style={{
              top: `${topPx}px`,
              left: `${leftPx}px`,
              width: `${widthPx}px`,
              height: `${heightPx}px`,
              zIndex: 10 + index,
              touchAction: "none",
              userSelect: "none",
              pointerEvents: isExportMode ? "none" : "auto",
            }}
            onPointerDown={handleImageLayerPointerDown(layer)}
          >
            <img
              src={layer.src}
              alt={layer.name}
              className="h-full w-full select-none rounded-lg object-contain"
              draggable={false}
            />

            {isSelected && !isExportMode &&
              RESIZE_HANDLES.map((handle) => (
                <div
                  key={handle}
                  className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-[#A1E2F8] shadow"
                  style={{ ...HANDLE_STYLES[handle], cursor: HANDLE_CURSORS[handle] }}
                  onPointerDown={handleResizePointerDown(layer, handle)}
                />
              ))}
          </div>
        );
      })}

      {/* Text-Layer (relativ in %) */}
      {layers.map((layer) => {
        const isActive = layer.id === selectedLayerId;
        const decoration = [
          layer.styles.underline ? "underline" : "",
          layer.styles.strikethrough ? "line-through" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={layer.id}
            className={clsx(
              "absolute -translate-x-1/2 -translate-y-1/2",
              !isExportMode && "cursor-grab",
            )}
            style={{
              top: `${layer.position.y}%`,
              left: `${layer.position.x}%`,
              zIndex: isActive ? 60 : 50,
              pointerEvents: isExportMode ? "none" : "auto",
            }}
            onPointerDown={handleTextPointerDown(layer.id)}
            onPointerMove={handleTextPointerMove}
            onPointerUp={handleTextPointerUp}
            onPointerCancel={handleTextPointerUp}
            data-layer-id={layer.id}
          >
            <div
              className={clsx(
                !isExportMode &&
                  "relative rounded-xl border px-4 py-3 shadow-sm transition",
                !isExportMode &&
                  (isActive
                    ? "border-[#A1E2F8]/80 bg-[#A1E2F8]/10 shadow-[0_0_0_1px_rgba(161,226,248,0.45)]"
                    : "border-white/10 bg-black/40 hover:border-[#A1E2F8]/50"),
              )}
              onClick={(e) => {
                if (isExportMode) return;
                e.stopPropagation();
                onSelectLayer(layer.id);
              }}
            >
              <div
                data-editable={!isExportMode}
                contentEditable={!isExportMode}
                suppressContentEditableWarning
                className={clsx(!isExportMode && "outline-none")}
                style={{
                  fontWeight: layer.styles.bold ? "bold" : "normal",
                  fontStyle: layer.styles.italic ? "italic" : "normal",
                  textDecoration: decoration,
                  fontSize: `${layer.styles.fontSize}px`,
                  color: layer.styles.textColor,
                  textAlign: layer.styles.alignment as React.CSSProperties["textAlign"],
                  whiteSpace: layer.styles.noWrap ? "nowrap" : "normal",
                  fontFamily: layer.styles.fontFamily,
                  cursor: isExportMode ? "default" : "text",
                  minWidth: "2ch",
                }}
                onInput={(event) =>
                  onLayerContentChange(layer.id, event.currentTarget.textContent || "")
                }
                onPaste={(event) => {
                  if (isExportMode) return;
                  // Plain-text paste
                  event.preventDefault();
                  const text = event.clipboardData.getData("text/plain");
                  if (document.queryCommandSupported("insertText")) {
                    document.execCommand("insertText", false, text);
                  } else {
                    const selection = window.getSelection();
                    if (!selection || !selection.rangeCount) return;
                    selection.deleteFromDocument();
                    selection.getRangeAt(0).insertNode(document.createTextNode(text));
                    selection.collapseToEnd();
                  }
                }}
              >
                {layer.content}
              </div>
            </div>
          </div>
        );
      })}

      {/* Optionaler zentrierter Freitext */}
      {textStyles && typeof onTextChange === "function" && (
        <>
          <style>{`.banner-text { font-family: ${textStyles.fontFamily} !important; }`}</style>
          <div
            className="banner-text"
            style={{
              ...freeTextStyle,
              cursor: isExportMode ? "default" : "text",
              pointerEvents: isExportMode ? "none" : "auto",
            }}
            ref={freeTextRef}
            contentEditable={!isExportMode}
            suppressContentEditableWarning
            onPointerDown={(e) => {
              if (isExportMode) return;
              e.stopPropagation();
            }}
            onInput={(e) => onTextChange(e.currentTarget.textContent || "")}
            onPaste={(event) => {
              if (isExportMode) return;
              event.preventDefault();
              const text = event.clipboardData.getData("text/plain");
              if (document.queryCommandSupported("insertText")) {
                document.execCommand("insertText", false, text);
              } else {
                const selection = window.getSelection();
                if (!selection || !selection.rangeCount) return;
                selection.deleteFromDocument();
                selection.getRangeAt(0).insertNode(document.createTextNode(text));
                selection.collapseToEnd();
              }
              onTextChange(freeTextRef.current?.textContent || "");
            }}
          >
            {textContent}
          </div>
        </>
      )}

      {isDragActive && !isExportMode && (
        <div className="pointer-events-none absolute inset-0 z-[120] flex items-center justify-center rounded-2xl border-2 border-dashed border-[#A1E2F8]/80 bg-black/60 text-sm font-semibold text-[#A1E2F8]">
          Bild hier ablegen
        </div>
      )}
    </div>
  );
};

export default BannerPreview;
