const MIN_FRAME_DELAY = 10;

function msToCs(ms: number) {
    return Math.max(1, Math.round(ms / 10));
}

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

async function loadGifenc(): Promise<GifencModule | null> {
    const candidates: Array<() => Promise<unknown>> = [
        () => import("gifenc"),
        () => import("gifenc/dist/gifenc.esm.js"),
        () => import("gifenc/dist/gifenc.js"),
    ];

    for (const loader of candidates) {
        try {
            const mod = await loader();
            const coerced = coerceGifencModule(mod);
            if (coerced) {
                return coerced;
            }
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                console.warn("ccapture shim: failed to load gifenc candidate", error);
            }
        }
    }

    return null;
}

function coerceGifencModule(candidate: unknown): GifencModule | null {
    if (!candidate || typeof candidate !== "object") {
        return null;
    }

    const visited = new Set<unknown>();
    const collected: Partial<GifencModule> = {};

    const visit = (value: unknown) => {
        if (!value || visited.has(value)) {
            return;
        }
        visited.add(value);

        if (typeof value === "function") {
            collected.GIFEncoder = value as GifencModule["GIFEncoder"];
            return;
        }

        if (typeof value !== "object") {
            return;
        }

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

function hardenAlpha(imageData: ImageData): ImageData {
    const src = imageData.data;
    const buf = new Uint8ClampedArray(src.length);
    buf.set(src);
    for (let i = 3; i < buf.length; i += 4) {
        buf[i] = 255;
    }
    return new ImageData(buf, imageData.width, imageData.height);
}

function normalizeToSize(imageData: ImageData, width: number, height: number): ImageData {
    if (imageData.width === width && imageData.height === height) {
        return imageData;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        canvas.remove();
        return imageData;
    }

    const temp = document.createElement("canvas");
    temp.width = imageData.width;
    temp.height = imageData.height;
    temp.getContext("2d")?.putImageData(imageData, 0, 0);

    ctx.drawImage(temp, 0, 0, width, height);
    const normalized = ctx.getImageData(0, 0, width, height);

    canvas.width = canvas.height = 0;
    canvas.remove();
    temp.width = temp.height = 0;
    temp.remove();

    return normalized;
}

function buildGlobalPalette(frames: ImageData[], quantize: GifencModule["quantize"], maxColors = 256): GifPalette {
    const stride = 4 * 8;
    const buckets: number[] = [];

    frames.forEach((frame) => {
        const data = frame.data;
        for (let i = 0; i < data.length; i += stride) {
            buckets.push(data[i], data[i + 1], data[i + 2], data[i + 3]);
        }
    });

    return quantize(new Uint8Array(buckets), maxColors);
}

type CCaptureOptions = {
    format: "gif";
    framerate?: number;
    quality?: number;
    name?: string;
};

type SaveCallback = (blob: Blob) => void;

export default class CCapture {
    private readonly options: CCaptureOptions;
    private readonly delayMs: number;
    private frames: ImageData[] = [];
    private recording = false;

    constructor(options: CCaptureOptions) {
        this.options = options;
        const fps = Math.max(1, Math.round(options.framerate ?? 60));
        this.delayMs = Math.max(MIN_FRAME_DELAY, Math.round(1000 / fps));
    }

    start() {
        this.frames = [];
        this.recording = true;
    }

    capture(canvas: HTMLCanvasElement) {
        if (!this.recording) {
            return;
        }

        if (!canvas.width || !canvas.height) {
            return;
        }

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
            return;
        }

        try {
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this.frames.push(frame);
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                console.warn("ccapture shim: failed to read canvas frame", error);
            }
        }
    }

    stop() {
        this.recording = false;
    }

    async save(callback?: SaveCallback): Promise<Blob | null> {
        if (!this.frames.length) {
            return null;
        }

        const mod = await loadGifenc();
        if (!mod) {
            throw new Error("gifenc konnte nicht geladen werden");
        }

        const { GIFEncoder, quantize, applyPalette } = mod;
        const width = this.frames[0].width;
        const height = this.frames[0].height;

        const normalized = this.frames.map((frame) => normalizeToSize(hardenAlpha(frame), width, height));
        const palette = buildGlobalPalette(normalized, quantize, 256);

        const encoder = GIFEncoder();
        encoder.setRepeat?.(0);
        encoder.setLoops?.(0);

        normalized.forEach((frame) => {
            const indexed = applyPalette(new Uint8Array(frame.data), palette);
            encoder.writeFrame(indexed, width, height, {
                palette,
                delay: msToCs(this.delayMs),
                transparent: null,
                disposal: 1,
            });
        });

        encoder.finish();
        const bytes = encoder.bytesView();
        const blob = new Blob([bytes], { type: "image/gif" });

        if (callback) {
            callback(blob);
        }

        return blob;
    }
}
