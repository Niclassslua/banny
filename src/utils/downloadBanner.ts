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
const DEFAULT_DELAY = 80;   // kleiner = smoother
const MIN_FRAMES = 12;      // mehr Frames → weniger Ruckeln
const MAX_FRAMES = 32;

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

function wait(ms: number) {
    return new Promise((r) => window.setTimeout(r, ms));
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

type GifencImportShape = Partial<GifencModule> & { default?: Partial<GifencModule> };

let gifencModulePromise: Promise<GifencModule | null> | null = null;

async function loadGifencFrom(loader: () => Promise<GifencImportShape>): Promise<GifencModule | null> {
    const imported = await loader();
    const resolved = (imported.default ?? imported) as Partial<GifencModule>;

    if (!resolved.GIFEncoder || !resolved.quantize || !resolved.applyPalette) {
        return null;
    }

    return {
        GIFEncoder: resolved.GIFEncoder,
        quantize: resolved.quantize,
        applyPalette: resolved.applyPalette,
    };
}

async function importGifenc(): Promise<GifencModule | null> {
    if (!gifencModulePromise) {
        gifencModulePromise = (async () => {
            const loaders: Array<() => Promise<GifencImportShape>> = [
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

    // 3) Frames quantisieren (RGB565 liefert gute Ergebnisse bei voller Deckkraft)
    for (const f of frames) {
        const rgba = f.imageData.data;
        const indexed = applyPalette(rgba, palette, "rgb565");
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

async function downloadAnimated(
    node: HTMLElement,
    fileName: string,
    durationMs: number,
    frameDelayMs: number,
) {
    const frames: GifFrame[] = [];
    // mehr Frames → smoother; konstante Steps erzwingen
    const steps = Math.max(MIN_FRAMES, Math.min(MAX_FRAMES, Math.round(durationMs / Math.max(40, frameDelayMs))));
    const delayPerFrame = Math.max(20, Math.round(durationMs / steps));

    await withVisibleNode(node, async (n) => {
        for (let index = 0; index < steps; index += 1) {
            if (index > 0) await wait(delayPerFrame);
            await new Promise((r) => requestAnimationFrame(r));

            const canvas = await safeRenderToCanvas(n);
            if (!canvas) continue;

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) continue;

            // **stabiler Weiß-BG** (kein Alpha, bessere Quantisierung)
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            let imageData: ImageData;
            try {
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            } catch {
                continue;
            }

            frames.push({ imageData, delayMs: delayPerFrame });

            canvas.width = 0;
            canvas.height = 0;
            canvas.remove();
        }
    });

    if (!frames.length) throw new Error("Keine Frames für die Animation gesammelt.");

    // **einheitliche Größe + kein Alpha**
    const W = frames[0].imageData.width;
    const H = frames[0].imageData.height;
    const normalized = frames.map(f => ({
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