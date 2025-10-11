import React, { useEffect, useRef } from "react";
import clsx from "clsx";

import { LayerPosition, TextStyles, Pattern, TextLayer, CanvasSize } from "@/types";
import { parseCSS } from "@/utils/parseCSS";

interface BannerPreviewProps {
  selectedPattern: Pattern;
  patternColor1: string;
  patternColor2: string;
  patternScale: number;
  layers: TextLayer[];
  selectedLayerId: string | null;
  previewRef: React.RefObject<HTMLDivElement>;
  onLayerContentChange: (layerId: string, newText: string) => void;
  onLayerPositionChange: (layerId: string, position: LayerPosition) => void;
  onSelectLayer: (layerId: string) => void;
  onTextChange: (newText: string) => void; // bleibt erhalten, falls extern bereits verwendet; wird hier nicht genutzt
  canvasSize: CanvasSize;
}

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

const BannerPreview: React.FC<BannerPreviewProps> = ({
  selectedPattern,
  patternColor1,
  patternColor2,
  patternScale,
  layers,
  selectedLayerId,
  previewRef,
  onLayerContentChange,
  onLayerPositionChange,
  onSelectLayer,
  // onTextChange wird hier nicht benötigt, aber absichtlich beibehalten
  canvasSize,
}) => {
  const draggingRef = useRef<{ layerId: string; pointerId: number } | null>(null);

  const updatePositionFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || draggingRef.current.pointerId !== event.pointerId) return;

    const container = previewRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const relativeX = ((event.clientX - rect.left) / rect.width) * 100;
    const relativeY = ((event.clientY - rect.top) / rect.height) * 100;

    onLayerPositionChange(draggingRef.current.layerId, {
      x: clampPercentage(relativeX),
      y: clampPercentage(relativeY),
    });
  };

  const handlePointerDown = (layerId: string) => (event: React.PointerEvent<HTMLDivElement>) => {
    onSelectLayer(layerId);

    const target = event.target as HTMLElement | null;
    // Wenn innerhalb eines editierbaren Elements geklickt wird, nicht draggen
    if (target && target.closest("[data-editable='true']")) return;

    draggingRef.current = { layerId, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    event.preventDefault();
    updatePositionFromPointer(event);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || draggingRef.current.pointerId !== event.pointerId) return;

    updatePositionFromPointer(event);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingRef.current = null;
  };

  return (
    <div
      ref={previewRef}
      className="pattern-surface"
      style={{
        ...parseCSS(selectedPattern.style, patternScale, patternColor1, patternColor2),
        position: "relative",
        width: "100%",
        maxWidth: `${canvasSize.width}px`,
        aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
        height: "auto",
        overflow: "hidden",
      }}
    >
      {layers.map((layer) => {
        const isActive = layer.id === selectedLayerId;

        return (
          <div
            key={layer.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab"
            style={{
              top: `${layer.position.y}%`,
              left: `${layer.position.x}%`,
              zIndex: isActive ? 3 : 2,
            }}
            onPointerDown={handlePointerDown(layer.id)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            data-layer-id={layer.id}
          >
            <LayerContent
              layer={layer}
              isActive={isActive}
              onChange={(value) => onLayerContentChange(layer.id, value)}
              onSelect={() => onSelectLayer(layer.id)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default BannerPreview;

interface LayerContentProps {
  layer: TextLayer;
  isActive: boolean;
  onChange: (value: string) => void;
  onSelect: () => void;
}

const LayerContent: React.FC<LayerContentProps> = ({ layer, isActive, onChange, onSelect }) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;
    if (textRef.current.textContent !== layer.content) {
      textRef.current.textContent = layer.content;
    }
  }, [layer.content]);

  const decoration = [
    layer.styles.underline ? "underline" : "",
    layer.styles.strikethrough ? "line-through" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={clsx(
        "relative rounded-xl border px-4 py-3 shadow-sm transition",
        isActive
          ? "border-[#A1E2F8]/80 bg-[#A1E2F8]/10 shadow-[0_0_0_1px_rgba(161,226,248,0.45)]"
          : "border-white/10 bg-black/40 hover:border-[#A1E2F8]/50",
      )}
    >
      <div
        ref={textRef}
        data-editable="true"
        contentEditable
        suppressContentEditableWarning
        className="outline-none"
        style={{
          fontWeight: layer.styles.bold ? "bold" : "normal",
          fontStyle: layer.styles.italic ? "italic" : "normal",
          textDecoration: decoration,
          fontSize: `${layer.styles.fontSize}px`,
          color: layer.styles.textColor,
          textAlign: layer.styles.alignment as React.CSSProperties["textAlign"],
          whiteSpace: layer.styles.noWrap ? "nowrap" : "normal",
          fontFamily: layer.styles.fontFamily,
          cursor: "text",
          minWidth: "2ch",
        }}
        onInput={(event) => onChange(event.currentTarget.textContent || "")}
        onFocus={onSelect}
        onPaste={(event) => {
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
          onChange(textRef.current?.textContent || "");
        }}
      />
    </div>
  );
};