"use client";

import React from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, Eye, EyeOff, RefreshCcw } from "lucide-react";

import { CanvasSize, ImageLayer } from "@/types";

import { Button } from "@/components/ui/Button";

interface ImageLayersPanelProps {
    layers: ImageLayer[];
    selectedLayerId: string | null;
    onSelectLayer: (layerId: string | null) => void;
    onToggleVisibility: (layerId: string) => void;
    onMoveLayer: (layerId: string, direction: "up" | "down") => void;
    onReplaceLayer: (layerId: string, file: File) => void;
    canvasSize: CanvasSize;
}

const ImageLayersPanel: React.FC<ImageLayersPanelProps> = ({
                                                              layers,
                                                              selectedLayerId,
                                                              onSelectLayer,
                                                              onToggleVisibility,
                                                              onMoveLayer,
                                                              onReplaceLayer,
                                                              canvasSize,
                                                          }) => {
    const handleReplaceChange = (layerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onReplaceLayer(layerId, file);
        }
        event.target.value = "";
    };

    return (
        <div className="rounded-3xl border border-[#A1E2F8]/15 bg-white/5 p-6 backdrop-blur-xl shadow-[0_25px_70px_-30px_rgba(192,230,244,0.45)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Grafik-Layer</h2>
                    <p className="mt-2 text-sm text-white/60">
                        Steuere Sichtbarkeit, Reihenfolge und tausche Bilder flexibel aus.
                    </p>
                </div>
            </div>

            {layers.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/50">
                    Noch keine Bild-Layer vorhanden. Lade Grafiken hoch, um sie hier zu verwalten.
                </p>
            ) : (
                <ul className="mt-5 flex flex-col gap-3">
                    {[...layers].reverse().map((layer, reversedIndex) => {
                        const index = layers.length - 1 - reversedIndex;
                        const isSelected = layer.id === selectedLayerId;
                        const replaceInputId = `replace-${layer.id}`;
                        const widthPx = Math.round((layer.width / 100) * canvasSize.width);
                        const heightPx = Math.round((layer.height / 100) * canvasSize.height);

                        return (
                            <li
                                key={layer.id}
                                className={`group relative rounded-2xl border ${
                                    isSelected
                                        ? "border-[#A1E2F8]/70 bg-[#A1E2F8]/10"
                                        : "border-white/10 bg-black/30 hover:border-[#A1E2F8]/40"
                                } transition`}
                            >
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onSelectLayer(isSelected ? null : layer.id)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            onSelectLayer(isSelected ? null : layer.id);
                                        }
                                    }}
                                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#A1E2F8]/60"
                                >
                                    <Button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onToggleVisibility(layer.id);
                                        }}
                                        variant="icon"
                                        size="icon"
                                        className={clsx(!layer.visible && "opacity-70")}
                                        aria-label={layer.visible ? "Layer ausblenden" : "Layer einblenden"}
                                    >
                                        {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </Button>

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                        <img
                                            src={layer.src}
                                            alt={layer.name}
                                            className="h-full w-full object-contain"
                                            draggable={false}
                                        />
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate text-sm font-medium text-white">{layer.name}</span>
                                        <span className="text-xs text-white/50">
                                            {widthPx} × {heightPx} px
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center gap-1">
                                        <Button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onMoveLayer(layer.id, "up");
                                            }}
                                            disabled={index === layers.length - 1}
                                            variant="iconSmall"
                                            size="iconSmall"
                                            aria-label="Layer nach vorne"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onMoveLayer(layer.id, "down");
                                            }}
                                            disabled={index === 0}
                                            variant="iconSmall"
                                            size="iconSmall"
                                            aria-label="Layer nach hinten"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="ml-2 flex items-center">
                                        <Button
                                            as="label"
                                            htmlFor={replaceInputId}
                                            onClick={(event) => event.stopPropagation()}
                                            variant="secondary"
                                            size="sm"
                                            className="cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold"
                                        >
                                            <RefreshCcw className="h-3.5 w-3.5" />
                                            Tauschen
                                        </Button>
                                        <input
                                            id={replaceInputId}
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(event) => handleReplaceChange(layer.id, event)}
                                        />
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default ImageLayersPanel;

