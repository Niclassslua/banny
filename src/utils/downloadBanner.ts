"use client";

import type { Options as HtmlToImageOptions } from "html-to-image";
import { toJpeg, toPng, toSvg, toWebp } from "html-to-image";

export type ExportFormat = "png" | "jpeg" | "webp" | "svg";

export type ExportVariant = {
    format: ExportFormat;
    pixelRatio?: number;
    quality?: number;
    /**
     * Optional suffix that will be appended to the generated file name
     * (before the extension). This is mainly used internally to add
     * semantic hints such as the resolution label.
     */
    suffix?: string;
};

export type DownloadResult = {
    variant: ExportVariant;
    fileName: string;
    success: boolean;
    error?: unknown;
};

export type DownloadSummary = {
    total: number;
    succeeded: number;
    failed: DownloadResult[];
    results: DownloadResult[];
};

type DownloadBannerOptions = {
    fileName: string;
    backgroundColor?: string;
    variants: ExportVariant[];
    onProgress?: (current: number, total: number) => void;
};

const BASE_RENDER_OPTIONS: HtmlToImageOptions = {
    pixelRatio: 1,
    cacheBust: true,
};

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function withVisibleNode<T>(node: HTMLElement, fn: (n: HTMLElement) => Promise<T>) {
    const prev = {
        position: node.style.position,
        opacity: node.style.opacity,
        transform: node.style.transform,
        width: node.style.width,
        height: node.style.height,
    };

    try {
        node.style.position = node.style.position || "relative";
        node.style.opacity = "1";
        node.style.transform = "none";

        const rect = node.getBoundingClientRect();
        if (rect.width < 1) {
            node.style.width = `${node.offsetWidth || 1}px`;
        }
        if (rect.height < 1) {
            node.style.height = `${node.offsetHeight || 1}px`;
        }

        return await fn(node);
    } finally {
        node.style.position = prev.position;
        node.style.opacity = prev.opacity;
        node.style.transform = prev.transform;
        node.style.width = prev.width;
        node.style.height = prev.height;
    }
}

export function sanitizeFileName(name: string) {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    return normalized || "banny-banner";
}

async function dataUrlToBlob(dataUrl: string) {
    const response = await fetch(dataUrl);
    return await response.blob();
}

function svgStringToBlob(svgMarkup: string) {
    return new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
}

function buildFileName(baseName: string, variant: ExportVariant) {
    const extension = variant.format === "jpeg" ? "jpg" : variant.format;
    const labelParts = [baseName, extension];

    if (variant.pixelRatio) {
        labelParts.push(`${variant.pixelRatio}x`);
    } else if (variant.format !== "svg") {
        labelParts.push("1x");
    }

    if (variant.suffix) {
        labelParts.push(variant.suffix);
    }

    return `${labelParts.join("-")}.${extension}`;
}

async function renderVariant(
    node: HTMLElement,
    variant: ExportVariant,
    backgroundColor?: string,
) {
    const renderOptions: HtmlToImageOptions = {
        ...BASE_RENDER_OPTIONS,
        ...(variant.pixelRatio !== undefined ? { pixelRatio: variant.pixelRatio } : {}),
        ...(backgroundColor ? { backgroundColor } : {}),
        ...(variant.quality !== undefined ? { quality: variant.quality } : {}),
    };

    switch (variant.format) {
        case "png":
            return await dataUrlToBlob(await toPng(node, renderOptions));
        case "jpeg":
            return await dataUrlToBlob(await toJpeg(node, renderOptions));
        case "webp":
            return await dataUrlToBlob(await toWebp(node, renderOptions));
        case "svg":
            return svgStringToBlob(await toSvg(node, renderOptions));
        default:
            throw new Error(`Nicht unterstütztes Exportformat: ${variant.format}`);
    }
}

export async function downloadBanner(
    node: HTMLElement,
    { fileName, backgroundColor, variants, onProgress }: DownloadBannerOptions,
): Promise<DownloadSummary> {
    const active = document.activeElement as HTMLElement | null;
    if (active && node.contains(active)) {
        active.blur();
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (!variants || variants.length === 0) {
        throw new Error("Keine Exportvarianten angegeben.");
    }

    return await withVisibleNode(node, async (visibleNode) => {
        const results: DownloadResult[] = [];
        const total = variants.length;
        let processed = 0;

        for (const variant of variants) {
            const filename = buildFileName(fileName, variant);

            try {
                const blob = await renderVariant(visibleNode, variant, backgroundColor);
                triggerDownload(blob, filename);
                results.push({
                    variant,
                    fileName: filename,
                    success: true,
                });
            } catch (error) {
                results.push({
                    variant,
                    fileName: filename,
                    success: false,
                    error,
                });
            } finally {
                processed += 1;
                onProgress?.(processed, total);
            }
        }

        const failed = results.filter((result) => !result.success);

        return {
            total,
            succeeded: total - failed.length,
            failed,
            results,
        } satisfies DownloadSummary;
    });
}
