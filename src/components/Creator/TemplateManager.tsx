"use client";

import { FormEvent, useMemo, useState } from "react";
import { ClipboardCopy, LinkIcon, Save, Share2, Trash2 } from "lucide-react";

import { CreatorShareMode, SavedTemplate } from "@/types";

interface TemplateManagerProps {
    templates: SavedTemplate[];
    onSaveTemplate: (name: string) => boolean;
    onApplyTemplate: (templateId: string) => void;
    onDeleteTemplate: (templateId: string) => void;
    onShareTemplate: (templateId: string, mode: CreatorShareMode) => void;
    onShareCurrent: (mode: CreatorShareMode) => void;
    statusMessage: string | null;
    errorMessage: string | null;
}

const TemplateManager = ({
    templates,
    onSaveTemplate,
    onApplyTemplate,
    onDeleteTemplate,
    onShareTemplate,
    onShareCurrent,
    statusMessage,
    errorMessage,
}: TemplateManagerProps) => {
    const [templateName, setTemplateName] = useState("");

    const sortedTemplates = useMemo(
        () =>
            [...templates].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            ),
        [templates],
    );

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const success = onSaveTemplate(templateName);
        if (success) {
            setTemplateName("");
        }
    };

    return (
        <div className="rounded-3xl border border-[#A1E2F8]/15 bg-white/5 p-6 backdrop-blur-xl shadow-[0_25px_70px_-30px_rgba(192,230,244,0.45)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Vorlagen verwalten</h2>
                    <p className="mt-1 text-sm text-white/60">
                        Speichere deine Banner-Entwürfe als Vorlagen, lade sie erneut und teile sie mit deinem Team.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <input
                        type="text"
                        value={templateName}
                        onChange={(event) => setTemplateName(event.target.value)}
                        placeholder="Vorlagenname"
                        className="w-full rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none transition focus:border-[#A1E2F8] sm:w-48"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#A1E2F8]/60 bg-[#A1E2F8]/15 px-4 py-2 text-sm font-semibold text-[#A1E2F8] transition hover:border-[#A1E2F8] hover:bg-[#A1E2F8]/30 hover:text-white"
                    >
                        <Save className="h-4 w-4" />
                        Speichern
                    </button>
                </form>
            </div>

            <div className="mt-4 space-y-2 text-sm">
                {errorMessage ? (
                    <p className="text-red-400">{errorMessage}</p>
                ) : null}
                {statusMessage ? (
                    <p className="text-emerald-300">{statusMessage}</p>
                ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sortedTemplates.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/60">
                        Noch keine Vorlagen gespeichert. Speichere deinen aktuellen Entwurf, um ihn später erneut zu verwenden.
                    </div>
                ) : (
                    sortedTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-4"
                        >
                            <div>
                                <h3 className="text-base font-semibold text-white">{template.name}</h3>
                                <p className="text-xs text-white/50">
                                    Gespeichert am {new Date(template.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="mt-auto flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => onApplyTemplate(template.id)}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#A1E2F8]/40 bg-[#A1E2F8]/10 px-3 py-2 text-xs font-semibold text-[#A1E2F8] transition hover:border-[#A1E2F8] hover:bg-[#A1E2F8]/25 hover:text-white"
                                >
                                    Anwenden
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onShareTemplate(template.id, "json")}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-[#A1E2F8]/40 hover:text-white"
                                >
                                    <ClipboardCopy className="h-3.5 w-3.5" />
                                    JSON
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onShareTemplate(template.id, "url")}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-[#A1E2F8]/40 hover:text-white"
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                    Link
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteTemplate(template.id)}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-red-300 transition hover:border-red-400 hover:text-red-200"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Löschen
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => onShareCurrent("json")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/70 transition hover:border-[#A1E2F8]/40 hover:text-white"
                >
                    <ClipboardCopy className="h-4 w-4" />
                    Aktuellen Entwurf als JSON kopieren
                </button>
                <button
                    type="button"
                    onClick={() => onShareCurrent("url")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/70 transition hover:border-[#A1E2F8]/40 hover:text-white"
                >
                    <LinkIcon className="h-4 w-4" />
                    Teilbaren Link kopieren
                </button>
            </div>
        </div>
    );
};

export default TemplateManager;

