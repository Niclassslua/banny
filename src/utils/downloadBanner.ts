"use client";

import type { Options as HtmlToImageOptions } from "html-to-image";
import { toBlob, toCanvas, toSvg } from "html-to-image";
// GIF-Encoder: klein & zuverlässig
// npm i gifenc
type GifFrame = { imageData: ImageData; delayMs: number };

type DownloadBannerOptions = {
    animated: boolean;
    fileName: string;
    durationMs?: number;
    frameDelayMs?: number;
};

type GifPaletteEntry = [number, number, number] | [number, number, number, number];
type GifPalette = GifPaletteEntry[];

type GifEncoder = {
    writeFrame: (
        indexedPixels: Uint8Array,
        width: number,
        height: number,
        options: {
            palette: GifPalette;
            delay: number;
            transparent: number | null;
            disposal: number;
        },
    ) => void;
    finish: () => void;
    bytesView: () => Uint8Array;
    setRepeat?: (repeat: number) => void;
    setLoops?: (loops: number) => void;
};

type GifencModule = {
    GIFEncoder: (options?: { auto?: boolean }) => GifEncoder;
    quantize: (pixels: Uint8Array, maxColors?: number) => GifPalette;
    applyPalette: (
        pixels: Uint8Array | Uint8ClampedArray,
        palette: GifPalette,
        format?: "rgb565" | "rgb444" | "rgba4444",
    ) => Uint8Array;
};

const DEFAULT_DURATION = 2400;
const DEFAULT_DELAY = 40;   // ~25 FPS → flüssiger
const MIN_FRAMES = 24;      // mehr Frames → weniger Ruckeln
const MAX_FRAMES = 600;     // höheres Limit für längere/gleichmäßige Loops
const MIN_FRAME_DELAY = 10; // GIF-Spezifikation: mindestens 1/100 Sekunde

const RENDER_OPTIONS: HtmlToImageOptions = {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff", // fester BG für saubere Quantisierung
};

/* ───────── helpers ───────── */

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
        if (rect.width < 1) node.style.width = `${node.offsetWidth || 1}px`;
        if (rect.height < 1) node.style.height = `${node.offsetHeight || 1}px`;
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
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    await img.decode();

    const { width, height } = node.getBoundingClientRect();
    const ratio = RENDER_OPTIONS.pixelRatio ?? 1;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round((width || node.offsetWidth || 1) * ratio));
    canvas.height = Math.max(1, Math.round((height || node.offsetHeight || 1) * ratio));

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = RENDER_OPTIONS.backgroundColor ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
}

async function safeRenderToCanvas(node: HTMLElement): Promise<HTMLCanvasElement | null> {
    try {
        const c = await toCanvas(node, RENDER_OPTIONS);
        if (c && c.width > 0 && c.height > 0) return c;
    } catch {}
    try {
        const c = await renderViaSvg(node);
        if (c && c.width > 0 && c.height > 0) return c;
    } catch {}
    return null;
}

export function sanitizeFileName(name: string) {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    return normalized || "banny-banner";
}

/* ───── Frame-Aufbereitung ───── */

function msToCs(ms: number) { return Math.max(1, Math.round(ms / 10)); }

function hardenAlpha(imageData: ImageData): ImageData {
    const src = imageData.data;
    const buf = new Uint8ClampedArray(src.length);
    buf.set(src);
    for (let i = 3; i < buf.length; i += 4) buf[i] = 255; // volle Deckkraft
    return new ImageData(buf, imageData.width, imageData.height);
}

function normalizeToSize(img: ImageData, w: number, h: number): ImageData {
    if (img.width === w && img.height === h) return img;
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const c = cv.getContext("2d")!;
    const temp = document.createElement("canvas");
    temp.width = img.width; temp.height = img.height;
    temp.getContext("2d")!.putImageData(img, 0, 0);
    c.drawImage(temp, 0, 0, w, h);
    const out = c.getImageData(0, 0, w, h);
    cv.width = cv.height = 0; temp.width = temp.height = 0;
    return out;
}

/* ───── GIF-Encoding via gifenc mit globaler Palette ───── */

let gifencModulePromise: Promise<GifencModule | null> | null = null;

function coerceGifencModule(candidate: unknown): GifencModule | null {
    if (!candidate) return null;

    const collected: Partial<GifencModule> = {};
    const visited = new Set<unknown>();

    const visit = (value: unknown) => {
        if (!value || visited.has(value)) return;
        visited.add(value);

        if (typeof value === "function") {
            collected.GIFEncoder = value as GifencModule["GIFEncoder"];
            return;
        }

        if (typeof value !== "object") return;

        const obj = value as Record<string, unknown>;

        if (typeof obj.GIFEncoder === "function") {
            collected.GIFEncoder = obj.GIFEncoder as GifencModule["GIFEncoder"];
        }

        if (typeof obj.quantize === "function") {
            collected.quantize = obj.quantize as GifencModule["quantize"];
        }

        if (typeof obj.applyPalette === "function") {
            collected.applyPalette = obj.applyPalette as GifencModule["applyPalette"];
        }

        if ("default" in obj) {
            visit(obj.default);
        }
    };

    visit(candidate);

    return collected.GIFEncoder && collected.quantize && collected.applyPalette
        ? (collected as GifencModule)
        : null;
}

async function loadGifencFrom(loader: () => Promise<unknown>): Promise<GifencModule | null> {
    const imported = await loader();
    return coerceGifencModule(imported);
}

async function importGifenc(): Promise<GifencModule | null> {
    if (!gifencModulePromise) {
        gifencModulePromise = (async () => {
            const loaders: Array<() => Promise<unknown>> = [
                () => import("gifenc"),
                () => import("gifenc/dist/gifenc.esm.js"),
                () => import("gifenc/dist/gifenc.js"),
            ];

            let lastError: unknown;
            for (const loader of loaders) {
                try {
                    const mod = await loadGifencFrom(loader);
                    if (mod) {
                        return mod;
                    }
                    lastError = new Error("gifenc module missing required exports");
                } catch (error) {
                    lastError = error;
                }
            }

            if (process.env.NODE_ENV !== "production") {
                console.error("Failed to load gifenc via dynamic import", lastError);
            }

            return null;
        })();
    }

    const loaded = await gifencModulePromise;
    if (!loaded) {
        gifencModulePromise = null;
    }
    return loaded;
}

/** Baut eine globale Palette aus subsampelten Pixeln aller Frames → stabilere Farben */
function buildGlobalPalette(frames: GifFrame[], quantize: GifencModule["quantize"], maxColors = 256): GifPalette {
    // subsample: jedes n-te Pixel, um RAM/CPU zu schonen
    const sampleStride = 4 * 8; // ~ jede 8. RGBA-Zelle
    const buckets: number[] = [];
    for (const f of frames) {
        const d = f.imageData.data;
        for (let i = 0; i < d.length; i += sampleStride) {
            buckets.push(d[i], d[i + 1], d[i + 2], d[i + 3]);
        }
    }
    return quantize(new Uint8Array(buckets), maxColors);
}

async function encodeGifWithGifenc(frames: GifFrame[], fileName: string): Promise<void> {
    const mod = await importGifenc();
    if (!mod) throw new Error("gifenc not available");

    const { GIFEncoder, quantize, applyPalette } = mod;
    const W = frames[0].imageData.width;
    const H = frames[0].imageData.height;

    // 1) globale Palette
    const palette = buildGlobalPalette(frames, quantize, 256);

    // 2) Encoder anlegen + Loop=∞ (repeat=0)
    const encoder = GIFEncoder();
    if (typeof encoder.setRepeat === "function") encoder.setRepeat(0); // endlos
    // (manche Builds nutzen encoder.setLoops(0))
    if (typeof encoder.setLoops === "function") encoder.setLoops(0);

    // 3) Frames quantisieren (direkt mit RGBA-Daten für unverfälschte Farben)
    for (const f of frames) {
        const rgba = f.imageData.data;
        // gifenc erwartet RGBA-Daten; der rgb565-Pfad verfälscht Farben.
        const indexed = applyPalette(new Uint8Array(rgba), palette);
        encoder.writeFrame(indexed, W, H, {
            palette,
            delay: msToCs(f.delayMs), // 1/100 s
            transparent: null,        // explizit KEINE Transparenz
            disposal: 1,              // 'none' → volle Frames ohne Ghosting
        });
    }

    encoder.finish();
    const out = encoder.bytesView();
    triggerDownload(new Blob([out], { type: "image/gif" }), `${fileName}.gif`);
}

/* ───────── static ───────── */

async function downloadStatic(node: HTMLElement, fileName: string) {
    const blob = await withVisibleNode(node, async (n) => {
        const b = await toBlob(n, RENDER_OPTIONS);
        if (!b) throw new Error("Konnte kein Bild generieren (Blob null).");
        return b;
    });
    triggerDownload(blob, `${fileName}.png`);
}

/* ───────── animated ───────── */

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
    const clampedDelay = Math.max(MIN_FRAME_DELAY, desiredDelay);
    const minimumDuration = MIN_FRAME_DELAY * MIN_FRAMES;
    const scheduledDuration = Math.max(durationMs, minimumDuration);
    const provisionalCount = Math.max(MIN_FRAMES, Math.ceil(scheduledDuration / clampedDelay));
    const frameCount = Math.min(MAX_FRAMES, provisionalCount);
    const denominator = Math.max(1, frameCount - 1);

    const offsets: number[] = [];
    for (let i = 0; i < frameCount; i += 1) {
        if (i === frameCount - 1) {
            offsets.push(scheduledDuration);
        } else {
            offsets.push(Math.round((scheduledDuration * i) / denominator));
        }
    }

    return offsets;
}

async function downloadAnimated(
    node: HTMLElement,
    fileName: string,
    durationMs: number,
    frameDelayMs: number,
) {
    const desiredDelay = Math.max(MIN_FRAME_DELAY, frameDelayMs);
    const schedule = buildFrameSchedule(durationMs, desiredDelay);
    const plannedDuration = schedule[schedule.length - 1] ?? durationMs;
    const captured: Array<{ imageData: ImageData; offset: number }> = [];

    await withVisibleNode(node, async (n) => {
        const controller = createAnimationController(n);

        const captureFrame = async (offset: number): Promise<boolean> => {
            controller.seek(offset);
            await new Promise((resolve) => requestAnimationFrame(resolve));

    await withVisibleNode(node, async (n) => {
        const captureFrame = async (): Promise<boolean> => {
            const canvas = await safeRenderToCanvas(n);
            if (!canvas) return false;

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) {
                canvas.width = 0;
                canvas.height = 0;
                canvas.remove();
                return false;
            }

            // stabiler Weiß-BG → keine Alpha-Artefakte bei der Quantisierung
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            let imageData: ImageData;
            try {
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            } catch {
                canvas.width = 0;
                canvas.height = 0;
                canvas.remove();
                return false;
            }

            captured.push({ imageData, offset });

            canvas.width = 0;
            canvas.height = 0;
            canvas.remove();
            return true;
        };

        try {
            for (const offset of schedule) {
                let attempts = 0;
                let ok = false;
                while (attempts < 3 && !ok) {
                    ok = await captureFrame(offset);
                    attempts += 1;
                }
                if (!ok) continue;
            }
        } finally {
            controller.restore();
        }
        if (!frames.length) return;

        const start = performance.now();
        let previousTimestamp = start;
        let lastDelay = frames[frames.length - 1].delayMs;

        while (frames.length < targetFrameCount) {
            const timestamp = await nextFrame();
            const delta = Math.max(
                MIN_FRAME_DELAY,
                Math.round(timestamp - previousTimestamp) || MIN_FRAME_DELAY,
            );
            previousTimestamp = timestamp;
            lastDelay = delta;

            frames[frames.length - 1].delayMs = delta;

            const elapsed = timestamp - start;
            if (elapsed >= durationMs && frames.length >= MIN_FRAMES) {
                break;
            }

            const ok = await captureFrame();
            if (!ok) {
                break;
            }
        }

        frames[frames.length - 1].delayMs = Math.max(MIN_FRAME_DELAY, lastDelay);
    });

    if (!captured.length) throw new Error("Keine Frames für die Animation gesammelt.");

    const targetDurationMs = Math.max(
        durationMs,
        plannedDuration,
        captured.length * MIN_FRAME_DELAY,
    );

    const frames: GifFrame[] = captured.map((frame, index) => {
        const nextOffset = captured[index + 1]?.offset ?? targetDurationMs;
        const delta = Math.max(
            MIN_FRAME_DELAY,
            Math.round(nextOffset - frame.offset) || desiredDelay,
        );
        return {
            imageData: frame.imageData,
            delayMs: delta,
        };
    });

    let totalDelayMs = frames.reduce((sum, frame) => sum + frame.delayMs, 0);

    if (totalDelayMs <= 0) {
        const fallback = Math.max(MIN_FRAME_DELAY, Math.round(targetDurationMs / frames.length));
        frames.forEach((frame) => {
            frame.delayMs = fallback;
        });
        totalDelayMs = fallback * frames.length;
    }

    if (Math.abs(totalDelayMs - targetDurationMs) > MIN_FRAME_DELAY) {
        const scale = targetDurationMs / totalDelayMs;
        let accumulated = 0;
        for (let i = 0; i < frames.length - 1; i += 1) {
            const scaled = Math.max(MIN_FRAME_DELAY, Math.round(frames[i].delayMs * scale));
            frames[i].delayMs = scaled;
            accumulated += scaled;
        }
        frames[frames.length - 1].delayMs = Math.max(
            MIN_FRAME_DELAY,
            Math.round(targetDurationMs - accumulated),
        );
    }

    const targetDurationMs = Math.max(durationMs, frames.length * MIN_FRAME_DELAY);
    let totalDelayMs = frames.reduce((sum, frame) => sum + frame.delayMs, 0);

    if (totalDelayMs <= 0) {
        const fallback = Math.max(MIN_FRAME_DELAY, Math.round(targetDurationMs / frames.length));
        frames.forEach((frame) => {
            frame.delayMs = fallback;
        });
        totalDelayMs = fallback * frames.length;
    }

    if (Math.abs(totalDelayMs - targetDurationMs) > MIN_FRAME_DELAY) {
        const scale = targetDurationMs / totalDelayMs;
        let accumulated = 0;
        for (let i = 0; i < frames.length - 1; i += 1) {
            const scaled = Math.max(MIN_FRAME_DELAY, Math.round(frames[i].delayMs * scale));
            frames[i].delayMs = scaled;
            accumulated += scaled;
        }
        frames[frames.length - 1].delayMs = Math.max(
            MIN_FRAME_DELAY,
            Math.round(targetDurationMs - accumulated),
        );
    }

    // **einheitliche Größe + kein Alpha**
    const W = frames[0].imageData.width;
    const H = frames[0].imageData.height;
    const normalized = frames.map((f) => ({
        imageData: normalizeToSize(hardenAlpha(f.imageData), W, H),
        delayMs: f.delayMs,
    }));

    await encodeGifWithGifenc(normalized, fileName);
}

/* ───────── public API ───────── */

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
    if (active && node.contains(active)) active.blur();

    await new Promise((r) => requestAnimationFrame(r));

    if (animated) {
        await downloadAnimated(node, fileName, durationMs, frameDelayMs);
    } else {
        await downloadStatic(node, fileName);
    }
}