"use client";

import type { Options as HtmlToImageOptions } from "html-to-image";
import { toBlob, toCanvas, toSvg } from "html-to-image";
import CCapture from "ccapture.js";

type DownloadBannerOptions = {
    animated: boolean;
    fileName: string;
    durationMs?: number;
    frameDelayMs?: number;
};

const DEFAULT_DURATION = 2400;
const DEFAULT_DELAY = 40;
const MIN_FRAMES = 24;
const MIN_FRAME_DELAY = 10;

const RENDER_OPTIONS: HtmlToImageOptions = {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
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

async function renderViaSvg(node: HTMLElement): Promise<HTMLCanvasElement> {
    const svg = await toSvg(node, RENDER_OPTIONS);
    const img = new Image();
    img.decoding = "sync";
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode();

    const { width, height } = node.getBoundingClientRect();
    const ratio = RENDER_OPTIONS.pixelRatio ?? 1;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round((width || node.offsetWidth || 1) * ratio));
    canvas.height = Math.max(1, Math.round((height || node.offsetHeight || 1) * ratio));

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        canvas.remove();
        throw new Error("Canvas-Kontext konnte nicht erzeugt werden.");
    }

    ctx.fillStyle = RENDER_OPTIONS.backgroundColor ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return canvas;
}

async function safeRenderToCanvas(node: HTMLElement): Promise<HTMLCanvasElement | null> {
    try {
        const canvas = await toCanvas(node, RENDER_OPTIONS);
        if (canvas && canvas.width > 0 && canvas.height > 0) {
            return canvas;
        }
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("render via toCanvas fehlgeschlagen", error);
        }
    }

    try {
        const fallback = await renderViaSvg(node);
        if (fallback && fallback.width > 0 && fallback.height > 0) {
            return fallback;
        }
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("render via SVG fallback fehlgeschlagen", error);
        }
    }

    return null;
}

export function sanitizeFileName(name: string) {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    return normalized || "banny-banner";
}

type AnimationController = {
    seek: (offsetMs: number) => void;
    restore: () => void;
};

function createAnimationController(root: HTMLElement): AnimationController {
    const canAnimate = typeof root.getAnimations === "function";
    if (!canAnimate) {
        return {
            seek: () => {},
            restore: () => {},
        };
    }

    const animations = root.getAnimations({ subtree: true });
    if (!animations.length) {
        return {
            seek: () => {},
            restore: () => {},
        };
    }

    type Snapshot = {
        animation: Animation;
        currentTime: number;
        playbackRate: number;
        playState: AnimationPlayState;
    };

    const snapshots: Snapshot[] = animations.map((animation) => ({
        animation,
        currentTime: animation.currentTime ?? 0,
        playbackRate: animation.playbackRate,
        playState: animation.playState,
    }));

    animations.forEach((animation) => {
        try {
            animation.pause();
        } catch {}
    });

    const seek = (offsetMs: number) => {
        const offset = Number.isFinite(offsetMs) ? offsetMs : 0;
        snapshots.forEach(({ animation, currentTime, playbackRate }) => {
            try {
                const rate = playbackRate ?? 1;
                animation.currentTime = currentTime + offset * rate;
                animation.commitStyles?.();
            } catch {}
        });
    };

    const restore = () => {
        snapshots.forEach(({ animation, currentTime, playbackRate, playState }) => {
            try {
                animation.currentTime = currentTime;
                if (typeof playbackRate === "number") {
                    animation.playbackRate = playbackRate;
                }

                if (playState === "running") {
                    animation.play();
                } else if (playState === "finished") {
                    animation.finish();
                } else if (playState === "idle") {
                    animation.cancel();
                }
            } catch {}
        });
    };

    return { seek, restore };
}

function buildFrameSchedule(durationMs: number, desiredDelay: number) {
    const delay = Math.max(MIN_FRAME_DELAY, desiredDelay);
    const minimumDuration = Math.max(delay * MIN_FRAMES, durationMs);
    const frameCount = Math.max(MIN_FRAMES, Math.round(minimumDuration / delay));
    const step = minimumDuration / frameCount;

    const unique = new Set<number>();
    for (let i = 0; i < frameCount; i += 1) {
        unique.add(Math.round(i * step));
    }

    return Array.from(unique).sort((a, b) => a - b);
}

async function captureAnimationWithCCapture(
    node: HTMLElement,
    fileName: string,
    durationMs: number,
    frameDelayMs: number,
) {
    const desiredDelay = Math.max(MIN_FRAME_DELAY, frameDelayMs);
    const schedule = buildFrameSchedule(durationMs, desiredDelay);
    if (!schedule.length) {
        throw new Error("Kein gültiger Aufnahmeplan generiert.");
    }

    await withVisibleNode(node, async (n) => {
        const controller = createAnimationController(n);
        const fps = Math.max(1, Math.round(1000 / desiredDelay));
        const capturer = new CCapture({
            format: "gif",
            framerate: fps,
            quality: 100,
            name: fileName,
        });

        const rect = n.getBoundingClientRect();
        const ratio = RENDER_OPTIONS.pixelRatio ?? 1;
        const width = Math.max(1, Math.round((rect.width || n.offsetWidth || 1) * ratio));
        const height = Math.max(1, Math.round((rect.height || n.offsetHeight || 1) * ratio));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            canvas.remove();
            throw new Error("Konnte keinen Canvas-Kontext für die Aufnahme erzeugen.");
        }

        capturer.start();

        try {
            for (const offset of schedule) {
                controller.seek(offset);
                await new Promise((resolve) => requestAnimationFrame(resolve));

                const rendered = await safeRenderToCanvas(n);
                if (!rendered) {
                    continue;
                }

                ctx.save();
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
                ctx.drawImage(rendered, 0, 0, width, height);

                capturer.capture(canvas);

                rendered.width = 0;
                rendered.height = 0;
                rendered.remove();
            }
        } finally {
            controller.restore();
            capturer.stop();
        }

        const blob = await capturer.save();
        if (!blob) {
            throw new Error("GIF konnte nicht erzeugt werden.");
        }

        triggerDownload(blob, `${fileName}.gif`);

        canvas.width = canvas.height = 0;
        canvas.remove();
    });
}

async function downloadStatic(node: HTMLElement, fileName: string) {
    const blob = await withVisibleNode(node, async (n) => {
        const generated = await toBlob(n, RENDER_OPTIONS);
        if (!generated) {
            throw new Error("Konnte kein PNG generieren.");
        }
        return generated;
    });

    triggerDownload(blob, `${fileName}.png`);
}

export async function downloadBanner(
    node: HTMLElement,
    {
        animated,
        fileName,
        durationMs = DEFAULT_DURATION,
        frameDelayMs = DEFAULT_DELAY,
    }: DownloadBannerOptions,
) {
    const active = document.activeElement as HTMLElement | null;
    if (active && node.contains(active)) {
        active.blur();
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (animated) {
        await captureAnimationWithCCapture(node, fileName, durationMs, frameDelayMs);
    } else {
        await downloadStatic(node, fileName);
    }
}
