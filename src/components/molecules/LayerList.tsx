"use client";

import React from "react";
import clsx from "clsx";
import { Copy, Plus, Trash2 } from "lucide-react";

import { TextLayer } from "@/types";
import { buttonClass } from "@/utils/buttonStyles";

const focusRingClass =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8]";

interface LayerListProps {
    layers: TextLayer[];
    activeLayerId: string | null;
    onSelectLayer: (id: string) => void;
    onAddLayer: () => void;
    onDuplicateLayer: (id: string) => void;
    onDeleteLayer: (id: string) => void;
}

export const LayerList: React.FC<LayerListProps> = ({
    layers,
    activeLayerId,
    onSelectLayer,
    onAddLayer,
    onDuplicateLayer,
    onDeleteLayer,
}) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, id: string) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelectLayer(id);
        }
    };

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A1E2F8]">
                    Text-Layer
                </h2>
                <button
                    type="button"
                    onClick={onAddLayer}
                    className={buttonClass(
                        "secondary",
                        "sm",
                        "px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                    )}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Hinzufügen
                </button>
            </div>

            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                {layers.map((layer, index) => {
                    const isActive = layer.id === activeLayerId;

                    return (
                        <div
                            key={layer.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelectLayer(layer.id)}
                            onKeyDown={(event) => handleKeyDown(event, layer.id)}
                            className={clsx(
                                "group flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition",
                                isActive
                                    ? "border-[#A1E2F8]/70 bg-[#A1E2F8]/15 text-white"
                                    : "border-white/10 bg-white/5 text-white/80 hover:border-[#A1E2F8]/40 hover:text-white",
                            )}
                        >
                            <div className="flex min-w-0 flex-1 flex-col">
                                <span className="text-[0.65rem] uppercase tracking-[0.24em] text-white/50">
                                    Layer {index + 1}
                                </span>
                                <span className="truncate text-sm font-medium text-white">
                                    {layer.content.trim() || "Leerer Text"}
                                </span>
                            </div>
                            <div className="flex flex-none items-center gap-1">
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onDuplicateLayer(layer.id);
                                    }}
                                    className={buttonClass("iconSmall", "none", "p-1.5")}
                                    aria-label="Layer duplizieren"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onDeleteLayer(layer.id);
                                    }}
                                    className={buttonClass("iconDanger", "none", "p-1.5")}
                                    aria-label="Layer löschen"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
