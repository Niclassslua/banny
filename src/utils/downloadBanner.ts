"use client";

import type { Options as HtmlToImageOptions } from "html-to-image";
import { toBlob, toJpeg, toPng, toSvg } from "html-to-image";

import type { CanvasSize } from "@/types";

export type BannerFormat = "png" | "jpg" | "jpeg" | "webp" | "svg";

export type BannerExportVariant = {
    format: BannerFormat;
    quality?: number;
    pixelRatio?: number;
    suffix?: string;
};

export type DownloadProgressEvent = {
    variant: BannerExportVariant;
    filename: string;
    index: number;
    total: number;
    success: boolean;
    error?: unknown;
};

type DownloadBannerOptions = {
    fileName: string;
    backgroundColor?: string;
    targetSize?: CanvasSize;
    variants: BannerExportVariant[];
    onProgress?: (event: DownloadProgressEvent) => void;
};

const BASE_RENDER_OPTIONS: HtmlToImageOptions = {
    pixelRatio: 2,
    cacheBust: true,
};

const DEFAULT_JPEG_QUALITY = 0.92;
const DEFAULT_WEBP_QUALITY = 0.95;

function clampQuality(value: number) {
    if (Number.isNaN(value)) {
        return DEFAULT_JPEG_QUALITY;
    }
    return Math.min(1, Math.max(0.1, value));
}

async function dataUrlToBlob(dataUrl: string, fallbackType: string) {
    if (dataUrl.startsWith("data:")) {
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error("Konnte Bilddaten nicht laden.");
        }
        return await response.blob();
    }

    return new Blob([dataUrl], { type: fallbackType });
}

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
        maxWidth: node.style.maxWidth,
        maxHeight: node.style.maxHeight,
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
        node.style.maxWidth = prev.maxWidth;
        node.style.maxHeight = prev.maxHeight;
    }
}

export function sanitizeFileName(name: string) {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    return normalized || "banny-banner";
}

type NormalizedFormat = "png" | "jpg" | "webp" | "svg";

function normalizeFormat(format: BannerFormat): NormalizedFormat {
    switch (format) {
        case "jpg":
        case "jpeg":
            return "jpg";
        case "png":
            return "png";
        case "webp":
            return "webp";
        case "svg":
            return "svg";
        default:
            return "png";
    }
}

function getExtension(format: BannerFormat) {
    const normalized = normalizeFormat(format);
    switch (normalized) {
        case "jpg":
            return "jpg";
        case "png":
            return "png";
        case "svg":
            return "svg";
        case "webp":
            return "webp";
        default:
            return normalized;
    }
}

function buildFileName(baseName: string, variant: BannerExportVariant, extension: string) {
    const safeBase = sanitizeFileName(baseName);
    const suffixParts: string[] = [];

    if (variant.suffix) {
        const sanitizedSuffix = sanitizeFileName(variant.suffix);
        if (sanitizedSuffix) {
            suffixParts.push(sanitizedSuffix);
        }
    }

    if (variant.pixelRatio && variant.pixelRatio !== 1) {
        const ratioLabel = `${variant.pixelRatio}x`;
        if (!suffixParts.includes(ratioLabel)) {
            suffixParts.push(ratioLabel);
        }
    }

    const suffix = suffixParts.length > 0 ? `-${suffixParts.join("-")}` : "";
    return `${safeBase}${suffix}.${extension}`;
}

async function renderVariant(
    node: HTMLElement,
    variant: BannerExportVariant,
    options: { backgroundColor?: string; targetSize?: CanvasSize },
) {
    const normalizedFormat = normalizeFormat(variant.format);
    const baseOptions: HtmlToImageOptions = {
        ...BASE_RENDER_OPTIONS,
        ...(options.backgroundColor ? { backgroundColor: options.backgroundColor } : {}),
        ...(options.targetSize
            ? {
                  width: options.targetSize.width,
                  height: options.targetSize.height,
                  canvasWidth: options.targetSize.width,
                  canvasHeight: options.targetSize.height,
              }
            : {}),
    };

    const renderOptions: HtmlToImageOptions = {
        ...baseOptions,
        pixelRatio: variant.pixelRatio ?? baseOptions.pixelRatio ?? 1,
    };

    switch (normalizedFormat) {
        case "png": {
            const dataUrl = await toPng(node, renderOptions);
            return await dataUrlToBlob(dataUrl, "image/png");
        }
        case "jpg": {
            const dataUrl = await toJpeg(node, {
                ...renderOptions,
                quality: clampQuality(variant.quality ?? DEFAULT_JPEG_QUALITY),
            });
            return await dataUrlToBlob(dataUrl, "image/jpeg");
        }
        case "svg": {
            const svgMarkup = await toSvg(node, renderOptions);
            return new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
        }
        case "webp": {
            const blob = await toBlob(node, {
                ...renderOptions,
                quality: clampQuality(variant.quality ?? DEFAULT_WEBP_QUALITY),
                type: "image/webp",
            });
            if (!blob) {
                throw new Error("Konnte kein WebP generieren.");
            }
            return blob;
        }
        default:
            throw new Error(`Nicht unterstütztes Export-Format: ${variant.format}`);
    }
}

async function waitForImages(node: HTMLElement) {
    const images = Array.from(node.querySelectorAll("img"));
    if (images.length === 0) {
        return;
    }

    await Promise.all(
        images.map(
            (image) =>
                new Promise<void>((resolve) => {
                    if (image.complete && image.naturalWidth !== 0) {
                        resolve();
                        return;
                    }

                    const handleLoad = () => {
                        cleanup();
                        resolve();
                    };

                    const handleError = () => {
                        cleanup();
                        resolve();
                    };

                    const cleanup = () => {
                        image.removeEventListener("load", handleLoad);
                        image.removeEventListener("error", handleError);
                    };

                    image.addEventListener("load", handleLoad, { once: true });
                    image.addEventListener("error", handleError, { once: true });
                }),
        ),
    );
}

export async function downloadBanner(node: HTMLElement, options: DownloadBannerOptions) {
    const { fileName, backgroundColor, targetSize, variants, onProgress } = options;
    if (!variants || variants.length === 0) {
        return [] as DownloadProgressEvent[];
    }

    const active = document.activeElement as HTMLElement | null;
    if (active && node.contains(active)) {
        active.blur();
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));

    await waitForImages(node);

    const results: DownloadProgressEvent[] = [];
    const total = variants.length;

    await withVisibleNode(node, async (visibleNode) => {
        if (targetSize) {
            visibleNode.style.width = `${targetSize.width}px`;
            visibleNode.style.height = `${targetSize.height}px`;
            visibleNode.style.maxWidth = `${targetSize.width}px`;
            visibleNode.style.maxHeight = `${targetSize.height}px`;
        }

        for (let index = 0; index < variants.length; index += 1) {
            const variant = variants[index];
            const extension = getExtension(variant.format);
            const filename = buildFileName(fileName, variant, extension);

            try {
                const blob = await renderVariant(visibleNode, variant, { backgroundColor, targetSize });
                triggerDownload(blob, filename);

                const event: DownloadProgressEvent = {
                    variant,
                    filename,
                    index,
                    total,
                    success: true,
                };
                results.push(event);
                onProgress?.(event);
            } catch (error) {
                const event: DownloadProgressEvent = {
                    variant,
                    filename,
                    index,
                    total,
                    success: false,
                    error,
                };
                results.push(event);
                onProgress?.(event);
            }
        }
    });

    return results;
}
