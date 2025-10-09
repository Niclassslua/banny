import { toBlob, toCanvas } from "html-to-image";

import { createGifFromFrames } from "@/utils/gifEncoder";
import type { GifFrame } from "@/utils/gifEncoder";

type DownloadBannerOptions = {
    animated: boolean;
    fileName: string;
    durationMs?: number;
    frameDelayMs?: number;
};

const DEFAULT_DURATION = 2400;
const DEFAULT_DELAY = 120;
const MIN_FRAMES = 6;
const MAX_FRAMES = 12;

const RENDER_OPTIONS = {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: null,
} as const;

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    anchor.rel = "noopener";

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

function wait(ms: number) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

export function sanitizeFileName(name: string) {
    const normalized = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "");

    return normalized || "banny-banner";
}

async function downloadStatic(node: HTMLElement, fileName: string) {
    const blob = await toBlob(node, RENDER_OPTIONS);

    if (!blob) {
        throw new Error("Konnte kein Bild generieren");
    }

    triggerDownload(blob, `${fileName}.png`);
}

async function downloadAnimated(
    node: HTMLElement,
    fileName: string,
    durationMs: number,
    frameDelayMs: number,
) {
    const frames: GifFrame[] = [];
    const estimatedSteps = Math.max(MIN_FRAMES, Math.ceil(durationMs / frameDelayMs));
    const steps = Math.min(MAX_FRAMES, estimatedSteps);
    const delayPerFrame = Math.max(20, Math.round(durationMs / steps));

    for (let index = 0; index < steps; index += 1) {
        if (index > 0) {
            await wait(delayPerFrame);
        }

        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

        const canvas = await toCanvas(node, RENDER_OPTIONS);

        const context = canvas.getContext("2d", { willReadFrequently: true });

        if (!context) {
            continue;
        }

        frames.push({
            imageData: context.getImageData(0, 0, canvas.width, canvas.height),
            delayMs: delayPerFrame,
        });

        canvas.width = 0;
        canvas.height = 0;
        canvas.remove();
    }

    if (!frames.length) {
        throw new Error("Keine Frames für die GIF-Erstellung gefunden");
    }

    const gifBinary = createGifFromFrames(frames, { loop: 0 });
    const gifBlob = new Blob([gifBinary], { type: "image/gif" });

    triggerDownload(gifBlob, `${fileName}.gif`);
}

export async function downloadBanner(
    node: HTMLElement,
    { animated, fileName, durationMs = DEFAULT_DURATION, frameDelayMs = DEFAULT_DELAY }: DownloadBannerOptions,
) {
    const active = document.activeElement as HTMLElement | null;

    if (active && node.contains(active)) {
        active.blur();
    }

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    if (animated) {
        await downloadAnimated(node, fileName, durationMs, frameDelayMs);
        return;
    }

    await downloadStatic(node, fileName);
}
