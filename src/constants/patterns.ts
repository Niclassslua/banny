import { Pattern } from "@/types";

export function addAlpha(color: string, alpha: number | string): string {
    const aHex = typeof alpha === "number" ? alphaToHex(alpha) : normalizeHexAlpha(alpha);
    const aDec = hexAlphaToDecimal(aHex); // 0..1

    if (!color) return color;

    const c = color.trim();

    // 1) CSS variable: use color-mix to keep it composable
    if (c.startsWith("var(")) {
        const pct = Math.round(aDec * 100);
        // "pct% of color, rest transparent" approximates alpha blending
        return `color-mix(in srgb, ${c} ${pct}%, transparent)`;
    }

    // 2) Hex colors
    if (c.startsWith("#")) {
        const hex = c.slice(1);
        if (hex.length === 3 || hex.length === 4) {
            const [r, g, b] = hex.split("");
            const rr = r + r, gg = g + g, bb = b + b;
            // replace alpha if provided in 4-digit form
            return `#${rr}${gg}${bb}${aHex}`;
        }
        if (hex.length === 6) return `#${hex}${aHex}`;
        if (hex.length === 8) return `#${hex.slice(0, 6)}${aHex}`;
        // Fallback: leave untouched
        return c;
    }

    // 3) rgb()/rgba()
    const rgb = c.match(/^rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (rgb) {
        const [, r, g, b] = rgb;
        return `rgba(${clamp255(+r)}, ${clamp255(+g)}, ${clamp255(+b)}, ${round2(aDec)})`;
    }

    // 4) hsl()/hsla()
    const hsl = c.match(/^hsla?\s*\(\s*([\d.]+)(deg|rad|turn)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (hsl) {
        const [, h, unit = "deg", s, l] = hsl;
        return `hsla(${h}${unit}, ${clampPct(+s)}%, ${clampPct(+l)}%, ${round2(aDec)})`;
    }

    // 5) Named colors or anything else → use color-mix as generic fallback
    const pct = Math.round(aDec * 100);
    return `color-mix(in srgb, ${c} ${pct}%, transparent)`;
}

// ───────────────────────── helpers
function alphaToHex(a: number): string {
    const v = Math.round(clamp01(a) * 255);
    return v.toString(16).padStart(2, "0");
}
function normalizeHexAlpha(a: string): string {
    const s = a.trim().replace(/^#/,"");
    if (/^[0-9a-fA-F]{2}$/.test(s)) return s.toLowerCase();
    // allow "f" or "F" shorthand
    if (/^[0-9a-fA-F]{1}$/.test(s)) return (s + s).toLowerCase();
    // if it's a percentage like "70%" → convert
    const pct = s.endsWith("%") ? parseFloat(s) : NaN;
    if (!Number.isNaN(pct)) return alphaToHex(pct / 100);
    // fallback: assume 1 (opaque)
    return "ff";
}
function hexAlphaToDecimal(hex: string): number {
    const v = parseInt(hex, 16);
    return isFinite(v) ? clamp01(v / 255) : 1;
}
function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
function clamp255(x: number) { return Math.max(0, Math.min(255, Math.round(x))); }
function clampPct(x: number) { return Math.max(0, Math.min(100, Math.round(x))); }
function round2(x: number) { return Math.round(x * 100) / 100; }

function colorMix(colorA: string, weightA: number, colorB: string): string {
    const clamped = Math.max(0, Math.min(100, Math.round(weightA)));
    return `color-mix(in srgb, ${colorA} ${clamped}%, ${colorB})`;
}

function tint(color: string, weight = 75): string {
    return colorMix(color, weight, "white");
}

function shade(color: string, weight = 65): string {
    return colorMix(color, weight, "black");
}

function blend(colorA: string, colorB: string, weight = 50): string {
    return colorMix(colorA, weight, colorB);
}

function createPalette(color1: string, color2: string) {
    const accent = color1;
    const base = color2;
    const accentLight = tint(accent, 70);
    const accentLighter = tint(accent, 85);
    const accentDark = shade(accent, 70);
    const baseLight = tint(base, 72);
    const baseLighter = tint(base, 88);
    const baseDark = shade(base, 68);
    const baseDarker = shade(base, 80);
    const accentMuted = blend(accent, base, 40);
    const baseAccentBlend = blend(base, accent, 60);

    return {
        accent,
        accentLight,
        accentLighter,
        accentDark,
        accentMuted,
        base,
        baseLight,
        baseLighter,
        baseDark,
        baseDarker,
        baseAccentBlend,
    };
}

export const patterns: Pattern[] = [
    {
        name: "Crimson Depth",
        style: (scale: number, color1: string, color2: string) => {
            const base = color2;
            const shadow = addAlpha(color2, "dd");
            const accent = addAlpha(color1, "f2");
            const gradientSize = 110 + Math.max(scale - 10, 0) * 2.5;

            return `
      background: radial-gradient(${gradientSize}% ${gradientSize}% at 50% 100%, ${shadow} 40%, ${accent} 100%);
      background-color: ${base};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Radial Cross",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale, 8);
            // squash growth for big scales: sqrt mapping
            const sEff = Math.sqrt(s * 10); // smoothens large values

            const tile   = Math.max(80, Math.round(sEff * 14));
            const stripe = Math.max(18, Math.round(tile / 4.6667));
            const offset = Math.round(tile / 2);

            const accent = addAlpha(color1, "ff");
            // keep your original % logic, but it's now tamed by sEff
            const g = `#0000 52%, ${accent} 54% 57%, #0000 59%`;

            return `
      background:
        radial-gradient(farthest-side at -33.33% 50%,  ${g}) 0 ${offset}px,
        radial-gradient(farthest-side at  50% 133.33%, ${g}) ${offset}px 0,
        radial-gradient(farthest-side at 133.33% 50%,  ${g}),
        radial-gradient(farthest-side at  50% -33.33%, ${g}),
        ${color2};
      background-size: ${stripe}px ${tile}px, ${tile}px ${stripe}px;
      background-color: ${color2};
      background-repeat: repeat;
      opacity: 1;
    `;
        },
    },
    {
        name: "Dark Frame",
        style: (scale: number, color1: string, color2: string) => {
            // Original --sz = 4px  → hier linear skalieren
            const sz = Math.max(scale, 2);                 // Basiseinheit
            const tile = `50% / ${sz * 17.5}px ${sz * 29.5}px`;   // --ts

            /* Farb-Mapping:
               b1,b2,b3,b4 = dunkle Töne (nehmen color2),
               c1           = Akzent (nehmen color1)
               Wer mehr Nuancen möchte, kann mit Alpha-Suffixen experimentieren. */
            const b1 = color2;
            const b2 = color2;
            const b3 = color2;
            const b4 = addAlpha(color2, "e0");   // 0xE0 ≈ 88 % Deckkraft

            return `
      background:
        radial-gradient(circle at 50% 50% , ${b4} ${sz}px, transparent ${sz * 8}px) ${tile},
        radial-gradient(circle at 0%   0% , ${b4} ${sz}px, transparent ${sz * 8}px) ${tile},
        radial-gradient(circle at 0% 100% , ${b4} ${sz}px, transparent ${sz * 8}px) ${tile},
        radial-gradient(circle at 100% 0% , ${b4} ${sz}px, transparent ${sz * 8}px) ${tile},
        radial-gradient(circle at 100% 100%, ${b4} ${sz}px, transparent ${sz * 8}px) ${tile},
        /* Rand-Conics */ 
        conic-gradient(from  90deg at 97.5% 67% , ${color1} 0 88deg, transparent 0 100%) ${tile},
        conic-gradient(from 182.5deg at 2.5%  67%, transparent 0 0deg, ${color1} .5deg 90deg, transparent 0 100%) ${tile},
        conic-gradient(from 270deg  at 2.5%  33%, ${color1} 0 88deg, transparent 0 100%) ${tile},
        conic-gradient(from   2.5deg at 97.5% 33%, transparent 0 0deg, ${color1} .5deg 90deg, transparent 0 100%) ${tile},
        /* Top / Bottom */ 
        conic-gradient(from 116.5deg at 50% 85.5%, ${b1} 0 127deg, transparent 0 100%) ${tile},
        conic-gradient(from -63.5deg at 50% 14.5%, ${b1} 0 127deg, transparent 0 100%) ${tile},
        /* Mittlerer Kranz */ 
        conic-gradient(
          from 0deg at 50% 50%,
          transparent 0 2deg,
          ${b2} 2.5deg 57.5deg,
          transparent 58deg 62.5deg,
          ${b1} 63deg 117.5deg,
          transparent 118deg 122.5deg,
          ${b3} 123deg 177.5deg,
          transparent 178deg 182deg,
          ${b2} 182.5deg 237.5deg,
          transparent 238deg 242.5deg,
          ${b1} 243deg 297.5deg,
          transparent 298deg 302.5deg,
          ${b3} 303deg 357.5deg,
          transparent 358deg 360deg
        ) ${tile},
        ${color1};   /* Grundfarbe */
      background-repeat: repeat;
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Hex Flower",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 8, 16);       // Original --s = 84px
            const c1 = color1;                       // hell
            const c2 = color2;                       // mittel
            const c3 = addAlpha(color2, "cc");               // dunkel ≈ 80 % Alpha

            const _g = "0 120deg, transparent 0";
            return `
      background:
        conic-gradient( from   0deg at calc(500%/6) calc(100%/3), ${c3} ${_g}),
        conic-gradient( from -120deg at calc(100%/6) calc(100%/3), ${c2} ${_g}),
        conic-gradient( from  120deg at calc(100%/3) calc(500%/6), ${c1} ${_g}),
        conic-gradient( from  120deg at calc(200%/3) calc(500%/6), ${c1} ${_g}),
        conic-gradient( from -180deg at calc(100%/3) 50%,          ${c2} 60deg, ${c1} ${_g}),
        conic-gradient( from   60deg at calc(200%/3) 50%,          ${c1} 60deg, ${c3} ${_g}),
        conic-gradient( from  -60deg at 50% calc(100%/3),          ${c1} 120deg, ${c2} 0 240deg, ${c3} 0);
      background-size: calc(${s}px * 1.732) ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Retro Dots",
        style: (scale: number, color1: string, color2: string) => {
            const sz  = Math.max(scale * 1.5, 6);           // Original --sz = 15px
            const ts  = `50% / ${sz * 8}px ${sz * 16}px`;   // --ts
            const c0  = color2;                             // dunkle Streifen
            const c1  = color1;                             // pinke Punkte

            const dot      = `${c1} 0 ${sz * 0.78}px, transparent ${sz * 0.78 + 1}px 100%`;
            const dotLayer = (x: number, y: number) =>
                `radial-gradient(circle at ${x}% ${y}% , ${dot}) ${ts}`;

            return `
      background:
        /* obere Reihe */ ${dotLayer(90, 0)}, ${dotLayer(65, 0)}, ${dotLayer(40, 0)}, ${dotLayer(15, 0)},
        /* mittlere Reihe */ ${dotLayer(90, 12.5)}, ${dotLayer(65, 25)}, ${dotLayer(40, 37.5)}, ${dotLayer(15, 50)},
        /* untere Reihe + Spiegellungen */ ${dotLayer(90, 100)}, ${dotLayer(65, 100)}, ${dotLayer(40, 100)}, ${dotLayer(15, 100)},
        /* schräge Conic-Kacheln */ 
        conic-gradient(from -90deg at 5%   51%, ${c0} 0 90deg, transparent 0 100%) ${ts},
        conic-gradient(from -90deg at 25%  50%, ${c1} 0 90deg, transparent 0 100%) ${ts},
        conic-gradient(from -90deg at 30%  38.5%,${c0} 0 90deg, transparent 0 100%) ${ts},
        conic-gradient(from -90deg at 50%  37.5%,${c1} 0 90deg, transparent 0 100%) ${ts},
        conic-gradient(from -90deg at 55%  26%,  ${c0} 0 90deg, transparent 0 100%) ${ts},
        conic-gradient(from -90deg at 75%  25%,  ${c1} 0 90deg, transparent 0 100%) ${ts},
        conic-gradient(from -90deg at 80%  13.5%,${c0} 0 90deg, transparent 0 100%) ${ts},
        conic-gradient(from -90deg at 100% 12.5%,${c1} 0 90deg, transparent 0 100%) ${ts},
        /* diagonale Highlights & Zebra-Streifen */ 
        linear-gradient(-45deg, transparent 0 32.25%, #0002 50%, ${c0} 77.5%) ${ts},
        linear-gradient(-45deg, transparent 0 32.25%, ${c0} 60%)               ${ts},
        repeating-linear-gradient(90deg, ${c0} 0 5%, ${c1} 0 25%)              ${ts};
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Concentric Grid",
        style: (scale: number, color1: string, color2: string) => {
            const s = scale * 6; // 10 → 60 px (wie im Original‐Snippet)
            return `
      background-color: ${color2};
      opacity: 1.0;

      background:
        radial-gradient(25% 25% at 25% 25%, ${color1} 99%, transparent 101%) ${s}px ${s}px / ${s * 2}px ${s * 2}px,
        radial-gradient(25% 25% at 25% 25%, ${color1} 99%, transparent 101%) 0 0 / ${s * 2}px ${s * 2}px,
        radial-gradient(50% 50%, ${color2} 98%, transparent) 0 0 / ${s}px ${s}px,
        repeating-conic-gradient(${color2} 0 50%, ${color1} 0 100%) ${s / 2}px 0 / ${s * 2}px ${s}px;
    `;
        },
    },
    {
        name: "Origami Tiles",
        style: (scale: number, color1: string, color2: string) => {
            // Original-Snippet arbeitet mit --u = 5px → wir skalieren:
            const u = Math.max(scale, 2);           // Basiseinheit
            const gp = `50% / ${u * 16.9}px ${u * 12.8}px`;
            const c1 = color2;                      // hell
            const c2 = color1;                      // dunkel 1
            const c3 = `${color1}cc`;              // dunkel 2 (halbtransparent)
            return `
      background:
        conic-gradient(from 122deg at 50% 85.15%, ${c2} 0 58deg, ${c3} 0 116deg, transparent 0 100%) ${gp},
        conic-gradient(from 122deg at 50% 72.5%,  ${c1} 0 116deg, transparent 0 100%)               ${gp},
        conic-gradient(from 58deg  at 82.85% 50%, ${c3} 0 64deg, transparent 0 100%)               ${gp},
        conic-gradient(from 58deg  at 66.87% 50%, ${c1} 0 64deg, ${c2} 0 130deg, transparent 0 100%) ${gp},
        conic-gradient(from 238deg at 17.15% 50%, ${c2} 0 64deg, transparent 0 100%)               ${gp},
        conic-gradient(from 172deg at 33.13% 50%, ${c3} 0 66deg, ${c1} 0 130deg, transparent 0 100%) ${gp},
        linear-gradient(98deg , ${c3} 0 15%, transparent calc(15% + 1px) 100%)                     ${gp},
        linear-gradient(-98deg, ${c2} 0 15%, transparent calc(15% + 1px) 100%)                     ${gp};
      background-color: ${color2};
      background-repeat: repeat;
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Radial Diamonds",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 20);          // --s aus Vorlage (100px) → skaliert
            const g = `
      ${color2} 4% 14%, ${color1} 14% 24%, ${color2} 22% 34%, ${color1} 34% 44%,
      ${color2} 44% 56%, ${color1} 56% 66%, ${color2} 66% 76%, ${color1} 76% 86%,
      ${color2} 86% 96%
    `;
            return `
      background:
        radial-gradient(100% 100% at 100% 0, ${color1} 4%, ${g}, #0008 96%, transparent)
          ,radial-gradient(100% 100% at 0 100%, transparent, #0008 4%, ${g}, ${color1} 96%) ${color1};
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Diamond Checker",
        style: (scale: number, color1: string, color2: string) => {
            const size = scale * 9;           // Original 90px → scale-abhängig
            const offset = (size * 1.5).toFixed(2);
            return `
      background-image:
        linear-gradient(45deg , ${color2} 25%, transparent 25%, transparent 75%, ${color2} 75%, ${color2}),
        linear-gradient(135deg, ${color2} 25%, ${color1} 25%, ${color1} 75%, ${color2} 75%, ${color2});
      background-size: ${size}px ${size}px;
      background-position: 0 0, ${offset}px ${offset}px;
      background-color: ${color1};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Wavy",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: repeating-radial-gradient(circle at 0 0, transparent 0, ${color2} ${scale * 10}px), 
                         repeating-linear-gradient(${color1}55, ${color1});`,
    },
    {
        name: "Rhombus",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: linear-gradient(135deg, ${color1} 25%, transparent 25%), 
                         linear-gradient(225deg, ${color1} 25%, transparent 25%), 
                         linear-gradient(45deg, ${color1} 25%, transparent 25%), 
                         linear-gradient(315deg, ${color1} 25%, ${color2} 25%);
       background-position: ${scale * 10}px 0, ${scale * 10}px 0, 0 0, 0 0; 
       background-size: ${scale * 20}px ${scale * 20}px; 
       background-repeat: repeat;`,
    },
    {
        name: "ZigZag",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: linear-gradient(135deg, ${color1} 25%, transparent 25%), 
                         linear-gradient(225deg, ${color1} 25%, transparent 25%), 
                         linear-gradient(45deg, ${color1} 25%, transparent 25%), 
                         linear-gradient(315deg, ${color1} 25%, ${color2} 25%);
       background-size: ${scale * 20}px ${scale * 20}px;`,
    },
    {
        name: "ZigZag 3D",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background: linear-gradient(135deg, ${color1}55 25%, transparent 25%) ${-scale * 10}px 0 / ${scale * 20}px ${scale * 20}px, 
                  linear-gradient(225deg, ${color1} 25%, transparent 25%) ${-scale * 10}px 0 / ${scale * 20}px ${scale * 20}px, 
                  linear-gradient(315deg, ${color1}55 25%, transparent 25%) 0 0 / ${scale * 20}px ${scale * 20}px, 
                  linear-gradient(45deg, ${color1} 25%, ${color2} 25%) 0 0 / ${scale * 20}px ${scale * 20}px;`,
    },
    {
        name: "Moon",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: radial-gradient(ellipse farthest-corner at 10px 10px , ${color1}, ${color1} 50%, ${color2} 50%); 
       background-size: ${scale * 10}px ${scale * 10}px;`,
    },
    {
        name: "Circles",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: radial-gradient(circle at center center, ${color1}, ${color2}), 
                         repeating-radial-gradient(circle at center center, ${color1}, ${color1} ${scale * 10}px, transparent ${scale * 20}px); 
       background-blend-mode: multiply;`,
    },
    {
        name: "Diagonal",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background: repeating-linear-gradient(45deg, ${color1}, ${color1} ${scale * 5}px, ${color2} ${scale * 5}px, ${color2} ${scale * 20}px);`,
    },
    {
        name: "Diagonal V2",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background: repeating-linear-gradient(-45deg, ${color1}, ${color1} ${scale * 5}px, ${color2} ${scale * 5}px, ${color2} ${scale * 20}px);`,
    },
    {
        name: "Triangle",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: linear-gradient(45deg, ${color1} 50%, ${color2} 50%); 
       background-size: ${scale * 10}px ${scale * 10}px;`,
    },
    {
        name: "Triangle v2",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: linear-gradient(-45deg, ${color2}, ${color2} 50%, ${color1} 50%, ${color1}); 
       background-size: ${scale * 10}px ${scale * 10}px;`,
    },
    {
        name: "Rectangles",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: repeating-linear-gradient(45deg, ${color1} 25%, transparent 25%, transparent 75%, ${color1} 75%, ${color1}), 
                         repeating-linear-gradient(45deg, ${color1} 25%, ${color2} 25%, ${color2} 75%, ${color1} 75%, ${color1}); 
       background-position: 0 0, ${scale * 5}px ${scale * 5}px; 
       background-size: ${scale * 10}px ${scale * 10}px;`,
    },
    {
        name: "Cubes Illusion",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 14.2857, 66.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
      --c3: ${palette.baseAccentBlend};
        background:
          repeating-conic-gradient(from 30deg,#0000 0 120deg,var(--c3) 0 50%)
           calc(var(--s)/2) calc(var(--s)*tan(30deg)/2),
          repeating-conic-gradient(from 30deg,var(--c1) 0 60deg,var(--c2) 0 120deg,var(--c3) 0 50%);
        background-size: var(--s) calc(var(--s)*tan(30deg));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Curved Lines",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
      --c3: ${palette.baseAccentBlend};
        --_g: 50%,#0000 37%,var(--c1) 39% 70%,#0000 72%;
        --_t: 50%,var(--c2) 40deg,var(--c3) 0 140deg,var(--c2) 0 180deg,#0000 0;
        --_s: 47% 50% at;
        background:
          radial-gradient(var(--_s) -10% var(--_g)) 0 calc(var(--s)/2),
          radial-gradient(var(--_s) -10% var(--_g)) calc(var(--s)/2) 0,
          radial-gradient(var(--_s) 110% var(--_g)),
          radial-gradient(var(--_s) 110% var(--_g)) calc(var(--s)/2) calc(var(--s)/2),
          conic-gradient(from   0deg at 55% var(--_t)) calc(var(--s)/4) 0,
          conic-gradient(from 180deg at 45% var(--_t)) calc(var(--s)/4) 0,
          var(--c2);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Overlapping Circles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 10.7143, 50.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g:
           var(--c1) 0%  5% ,var(--c2) 6%  15%,var(--c1) 16% 25%,var(--c2) 26% 35%,var(--c1) 36% 45%,
           var(--c2) 46% 55%,var(--c1) 56% 65%,var(--c2) 66% 75%,var(--c1) 76% 85%,var(--c2) 86% 95%,
           #0000 96%;
        background:
          radial-gradient(50% 50% at 100% 0,var(--_g)),
          radial-gradient(50% 50% at 0 100%,var(--_g)),
          radial-gradient(50% 50%,var(--_g)),
          radial-gradient(50% 50%,var(--_g)) calc(var(--s)/2) calc(var(--s)/2)
          var(--c1);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Triangles 3D Effect",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.5, 35.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
      --c3: ${palette.baseAccentBlend};
        background:
          conic-gradient(from 75deg,var(--c1)   15deg ,var(--c2) 0 30deg ,#0000 0 180deg,
                                    var(--c2) 0 195deg,var(--c1) 0 210deg,#0000 0)
             calc(var(--s)/2) calc(.5*var(--s)/tan(30deg)),
          conic-gradient(var(--c1)   30deg ,var(--c3) 0 75deg ,var(--c1) 0 90deg, var(--c2) 0 105deg,
                         var(--c3) 0 150deg,var(--c2) 0 180deg,var(--c3) 0 210deg,var(--c1) 0 256deg,
                         var(--c2) 0 270deg,var(--c1) 0 286deg,var(--c2) 0 331deg,var(--c3) 0);
        background-size: var(--s) calc(var(--s)/tan(30deg));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Parallelograms",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        background:
          linear-gradient(atan(-.5),var(--c1) 33%,var(--c2) 33.5% 66.5%,var(--c1) 67%)
          0/var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Diagonal squares",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: var(--c1) 0 25%,#0000 0 50%;
        background:
         repeating-conic-gradient(at 33% 33%,var(--_g)),
         repeating-conic-gradient(at 66% 66%,var(--_g)),
         var(--c2);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Hearts",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 8.5714, 40.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: 80%,var(--c1) 25.4%,#0000 26%;
        background:
         radial-gradient(at 80% var(--_g)),
         radial-gradient(at 20% var(--_g)),
         conic-gradient(from -45deg at 50% 41%,var(--c1) 90deg,var(--c2) 0)
            calc(var(--s)/2) 0;
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Stars",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 6.4286, 30.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --d: calc(var(--s)/10);
        --_g: var(--c1) 36deg, #0000 0;
        background:
          conic-gradient(from 162deg at calc(var(--s) * .5)  calc(var(--s) * .68), var(--_g)),
          conic-gradient(from 18deg  at calc(var(--s) * .19) calc(var(--s) * .59), var(--_g)),
          conic-gradient(from 306deg at calc(var(--s) * .81) calc(var(--s) * .59), var(--_g)),
          var(--c2);
        background-position: 0 calc(var(--s) * 0.35);
        background-size: calc(var(--s) + var(--d)) calc(var(--s) + var(--d));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Equal Sign",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 14.2857, 66.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: #0000 8%,var(--c1) 0 17%,#0000 0 58%;
        background:
          linear-gradient(135deg,#0000 20.5%,var(--c1) 0 29.5%,#0000 0) 0 calc(var(--s)/4),
          linear-gradient( 45deg,var(--_g)) calc(var(--s)/2) 0,
          linear-gradient(135deg,var(--_g),var(--c1) 0 67%,#0000 0),
          linear-gradient( 45deg,var(--_g),var(--c1) 0 67%,#0000 0 83%,var(--c1) 0 92%,#0000 0),
          var(--c2);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Triangles & Chevrons",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 4.5714, 21.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: 90deg,#0000 0;
        background:
          conic-gradient(from 135deg,var(--c1) var(--_g)) var(--s) calc(var(--s)/2),
          conic-gradient(from 135deg,var(--c2) var(--_g)),
          conic-gradient(from 135deg at 50% 0,var(--c1) var(--_g)) var(--c2);
        background-size: calc(2*var(--s)) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Rhombus & Stripes",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 4.5714, 21.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        background:
          conic-gradient(from -45deg,var(--c1) 90deg,#0000 0 180deg,var(--c2) 0 270deg,#0000 0)
            0 calc(var(--s)/2)/var(--s) var(--s),
          conic-gradient(from 135deg at 50% 0,var(--c1) 90deg,var(--c2) 0)
            0 0/calc(2*var(--s)) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Mosaic Triangles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 2.5714, 12.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
      --c3: ${palette.baseAccentBlend};
        --_g: calc(2*var(--s)*1.732) calc(2*var(--s))
          conic-gradient(from 60deg at 62.5% 50%,var(--c3) 60deg,#0000 0);
        background:
             calc( 2.598*var(--s)/2) calc(var(--s)/ 2)/var(--_g),
             calc(-0.866*var(--s)/2) calc(var(--s)/-2)/var(--_g),
          repeating-conic-gradient(var(--c2) 0 90deg,#0000 0 180deg)
             0 0/calc(2*var(--s)*1.732) calc(2*var(--s)),
          repeating-conic-gradient(from 60deg,var(--c1) 0 60deg,var(--c2) 0 180deg)
             0 0/calc(var(--s)*1.732) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Mosaic Parallelograms",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 8.9286, 41.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: var(--c1) 90deg,var(--c2) 0 135deg,#0000 0;
        background:
          conic-gradient(from  -45deg at calc(100%/3)   calc(100%/3)  ,var(--c1) 90deg,#0000 0 ),
          conic-gradient(from -135deg at calc(100%/3)   calc(2*100%/3),var(--_g)),
          conic-gradient(from  135deg at calc(2*100%/3) calc(2*100%/3),var(--_g)),
          conic-gradient(from   45deg at calc(2*100%/3) calc(100%/3)  ,var(--_g),var(--c1) 0 225deg,var(--c2) 0);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Meander",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 8.5714, 40.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_c: var(--c1) 25%,#0000 0;
        --_g1: conic-gradient(at 62.5% 12.5%,var(--_c));
        --_g2: conic-gradient(at 87.5% 62.5%,var(--_c));
        --_g3: conic-gradient(at 25%   12.5%,var(--_c));
        background:
          var(--_g1) calc( var(--s)/-8) calc(var(--s)/2),var(--_g1) calc(-3*var(--s)/8) calc(var(--s)/4),
          var(--_g2) calc(3*var(--s)/8) calc(var(--s)/4),var(--_g2) calc(  var(--s)/-8) 0,
          var(--_g3) 0 calc(var(--s)/-4),var(--_g3) calc(var(--s)/-4) 0,
          conic-gradient(at 87.5% 87.5%,var(--_c)) calc(var(--s)/8) 0
          var(--c2);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Plus Sign",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 2.8571, 13.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_c: #0000 75%,var(--c1) 0;
        --_g1: conic-gradient(at 10% 50%,var(--_c));
        --_g2: conic-gradient(at 50% 10%,var(--_c));
        background:
          var(--_g1),
          var(--_g1) calc(1*var(--s)) calc(3*var(--s)),
          var(--_g1) calc(2*var(--s)) calc(1*var(--s)),
          var(--_g1) calc(3*var(--s)) calc(4*var(--s)),
          var(--_g1) calc(4*var(--s)) calc(2*var(--s)),
          var(--_g2) 0                calc(4*var(--s)),
          var(--_g2) calc(1*var(--s)) calc(2*var(--s)),
          var(--_g2) calc(2*var(--s)) 0,
          var(--_g2) calc(3*var(--s)) calc(3*var(--s)),
          var(--_g2) calc(4*var(--s)) calc(1*var(--s)),
          var(--c2);
        background-size: calc(5*var(--s)) calc(5*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Squares",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 3.5714, 16.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        background:
          conic-gradient(at 25% 25%,#0000 75%,var(--c1) 0) var(--s) var(--s),
          repeating-conic-gradient(at 25% 25%,var(--c1) 0 25%,var(--c2) 0 50%);
        background-size: calc(2*var(--s)) calc(2*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Nested Rhombus",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g1:
          var(--c1)   calc(25%/3) ,#0000 0 calc(50%/3),
          var(--c1) 0 25%         ,#0000 0 75%,
          var(--c1) 0 calc(250%/3),#0000 0 calc(275%/3),
          var(--c1) 0;
        --_g2:
          #0000   calc(25%/3) ,var(--c1) 0 calc(50%/3),
          #0000 0 calc(250%/3),var(--c1) 0 calc(275%/3),
          #0000 0;
        background:
          linear-gradient( 45deg,var(--_g2)),linear-gradient( 45deg,var(--_g1)),
          linear-gradient(-45deg,var(--_g2)),linear-gradient(-45deg,var(--_g1))
          var(--c2);
        background-position: 0 0,var(--s) var(--s);
        background-size: calc(2*var(--s)) calc(2*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Linked Squares",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_s: calc(2*var(--s)) calc(2*var(--s));
        --_g: var(--_s) conic-gradient(at 40% 40%,#0000 75%,var(--c1) 0);
        --_p: var(--_s) conic-gradient(at 20% 20%,#0000 75%,var(--c2) 0);
        background:
          calc( .9*var(--s)) calc( .9*var(--s))/var(--_p),
          calc(-.1*var(--s)) calc(-.1*var(--s))/var(--_p),
          calc( .7*var(--s)) calc( .7*var(--s))/var(--_g),
          calc(-.3*var(--s)) calc(-.3*var(--s))/var(--_g),
          conic-gradient(from 90deg at 20% 20%,var(--c2) 25%,var(--c1) 0)
           0 0/var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Z Shape",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.5714, 35.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        background:
          conic-gradient(from  30deg at 87.5% 75%,var(--c1)  60deg,var(--c2) 0 120deg,#0000 0) 0 calc(.2165*var(--s)),
          conic-gradient(from -90deg at 50%   25%,var(--c2)  60deg,var(--c1) 0 180deg,#0000 0),
          conic-gradient(from  90deg at 50%   75%,var(--c2) 120deg,var(--c1) 0 180deg,#0000 0),
          conic-gradient(from -30deg at 87.5% 50%,var(--c2) 120deg,var(--c1) 0 240deg,#0000 0),
          conic-gradient(from  90deg at 37.5% 50%,var(--c2) 120deg,var(--c1) 0 180deg,var(--c2) 0 240deg,var(--c1) 0);
        background-size: var(--s) calc(.866*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Quatrefoils",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 4.2857, 20.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: #0000 83%,var(--c1) 85% 99%,#0000 101%;
        background:
          radial-gradient(27% 29% at right ,var(--_g)) calc(var(--s)/ 2) var(--s),
          radial-gradient(27% 29% at left  ,var(--_g)) calc(var(--s)/-2) var(--s),
          radial-gradient(29% 27% at top   ,var(--_g)) 0 calc(var(--s)/ 2),
          radial-gradient(29% 27% at bottom,var(--_g)) 0 calc(var(--s)/-2)
          var(--c2);
        background-size: calc(2*var(--s)) calc(2*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Loop Circles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 10.7143, 50.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: var(--c1)        6.1%,var(--c2)  6.4% 18.6%,var(--c1) 18.9% 31.1%,
              var(--c2) 31.4% 43.6%,var(--c1) 43.9% 56.1%,var(--c2) 56.4% 68.6%,#0000 68.9%;
        background:
          radial-gradient(var(--s) at 100% 0   ,var(--_g)),
          radial-gradient(var(--s) at 0    0   ,var(--_g)),
          radial-gradient(var(--s) at 0    100%,var(--_g)),
          radial-gradient(var(--s) at 100% 100%,var(--_g)) var(--c1);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Rotated squares",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 10.7143, 50.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: #0000 90deg,var(--c1) 0;
        background:
          conic-gradient(from 116.56deg at calc(100%/3) 0   ,var(--_g)),
          conic-gradient(from -63.44deg at calc(200%/3) 100%,var(--_g))
          var(--c2);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Stairs pattern",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 3.5714, 16.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
      --c3: ${palette.baseAccentBlend};
        --_g: conic-gradient(at 50% 25%,#0000 75%,var(--c1) 0);
        background:
          var(--_g),var(--_g) var(--s) var(--s),
          var(--_g) calc(2*var(--s)) calc(2*var(--s)),
          var(--_g) calc(3*var(--s)) calc(3*var(--s)),
          repeating-linear-gradient(135deg,var(--c2) 0 12.5%,var(--c3) 0 25%);
        background-size: calc(4*var(--s)) calc(4*var(--s))
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Circles & squares",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: var(--c1) 0 100%,#0000 102%;
        background:
          conic-gradient(#0000 75%,var(--_g)) calc(var(--s)/4) calc(var(--s)/4),
          radial-gradient(65% 65% at 50% -50%,var(--_g)),
          radial-gradient(65% 65% at -50% 50%,var(--_g)),
          radial-gradient(65% 65% at 50% 150%,var(--_g)),
          radial-gradient(65% 65% at 150% 50%,var(--_g))
          var(--c2);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Striped circles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 5.4286, 25.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: conic-gradient(var(--c1) 25%,#0000 0) 0 0;
        background:
          var(--_g)/calc(2*var(--s)) calc(var(--s)/9.5),
          var(--_g)/calc(var(--s)/9.5) calc(2*var(--s)),
          repeating-conic-gradient(#0000 0 25%,var(--c1) 0 50%)
           var(--s) 0 /calc(2*var(--s)) calc(2*var(--s)),
          radial-gradient(50% 50%,var(--c2) 98%,var(--c1))
           0 0/var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Flower petals",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 4.2857, 20.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: radial-gradient(25% 25% at 25% 25%,var(--c1) 99%,#0000 101%);
        background:
         var(--_g) var(--s) var(--s)/calc(2*var(--s)) calc(2*var(--s)),
         var(--_g) 0 0/calc(2*var(--s)) calc(2*var(--s)),
         radial-gradient(50% 50%,var(--c2) 98%,#0000) 0 0/var(--s) var(--s),
         repeating-conic-gradient(var(--c2) 0 25%,var(--c1) 0 50%)
           calc(.5*var(--s)) 0/calc(2*var(--s)) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Circles & Curved lines",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 5.0, 23.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_l: #0000 46%,var(--c1) 47% 53%,#0000 54%;
        background:
          radial-gradient(100% 100% at 100% 100%,var(--_l)) var(--s) var(--s),
          radial-gradient(100% 100% at 0    0   ,var(--_l)) var(--s) var(--s),
          radial-gradient(100% 100%,#0000 22%,var(--c1) 23% 29%, #0000 30% 34%,var(--c1) 35% 41%,#0000 42%),
          var(--c2);
        background-size: calc(var(--s)*2) calc(var(--s)*2);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Wavy Pattern",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g:
           var(--c2) 6%  14%,var(--c1) 16% 24%,var(--c2) 26% 34%,var(--c1) 36% 44%,
           var(--c2) 46% 54%,var(--c1) 56% 64%,var(--c2) 66% 74%,var(--c1) 76% 84%,var(--c2) 86% 94%;
        background:
          radial-gradient(100% 100% at 100% 0,var(--c1) 4%,var(--_g),#0008 96%,#0000),
          radial-gradient(100% 100% at 0 100%,#0000, #0008 4%,var(--_g),var(--c1) 96%)
          var(--c1);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Quarter Circles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 4.5714, 21.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: var(--c1) 35%, #0000 36%;
        background:
          radial-gradient(at 100% 100%, var(--_g)),
          radial-gradient(at 0    0   , var(--_g))
          var(--c2);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Nested Rhombus",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 5.7143, 26.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g:
          #0000 calc(-650%/13) calc(50%/13),var(--c1) 0 calc(100%/13),
          #0000 0 calc(150%/13),var(--c1) 0 calc(200%/13),
          #0000 0 calc(250%/13),var(--c1) 0 calc(300%/13);
        --_g0: repeating-linear-gradient( 45deg,var(--_g));
        --_g1: repeating-linear-gradient(-45deg,var(--_g));
        background:
          var(--_g0),var(--_g0) var(--s) var(--s),
          var(--_g1),var(--_g1) var(--s) var(--s) var(--c2);
        background-size: calc(2*var(--s)) calc(2*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Lollipop",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 4.0, 18.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_c1: var(--c1) 99%,#0000 101%;
        --_c2: var(--c2) 99%,#0000 101%;
        --r:calc(var(--s)*.866);
        --g0:radial-gradient(var(--s),var(--_c1));
        --g1:radial-gradient(var(--s),var(--_c2));
        --f:radial-gradient(var(--s) at calc(100% + var(--r)) 50%,var(--_c1));
        --p:radial-gradient(var(--s) at 100% 50%,var(--_c2));
        background:
          var(--f) 0 calc(-5*var(--s)/2),
          var(--f) calc(-2*var(--r)) calc(var(--s)/2),
          var(--p) 0 calc(-2*var(--s)),
          var(--g0) var(--r) calc(-5*var(--s)/2),
          var(--g1) var(--r) calc( 5*var(--s)/2),
          radial-gradient(var(--s) at 100% 100%,var(--_c1)) 0 calc(-1*var(--s)),
          radial-gradient(var(--s) at 0%   50% ,var(--_c1)) 0 calc(-4*var(--s)),
          var(--g1) calc(-1*var(--r)) calc(-7*var(--s)/2),
          var(--g0) calc(-1*var(--r)) calc(-5*var(--s)/2),
          var(--p) calc(-2*var(--r)) var(--s),
          var(--g0) calc(-1*var(--r)) calc(var(--s)/ 2),
          var(--g1) calc(-1*var(--r)) calc(var(--s)/-2),
          var(--g0) 0 calc(-1*var(--s)),
          var(--g1) var(--r) calc(var(--s)/-2),
          var(--g0) var(--r) calc(var(--s)/ 2)
          var(--c2);
        background-size: calc(4*var(--r)) calc(6*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Semi circles & full circles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 3.5714, 16.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: radial-gradient(var(--c2) 49%,#0000 50%);
        background:
         var(--_g) calc(var(--s)/-2) calc(var(--s)/2),
         repeating-conic-gradient(from 45deg,var(--c1) 0 25%,#0000 0 50%)
           calc(var(--s)/2) calc(var(--s)/2),
         var(--_g),var(--_g) var(--s) var(--s) var(--c1);
        background-size: calc(2*var(--s)) calc(2*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Diagonal rectangles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 10.7143, 50.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        background:
          linear-gradient(135deg,#0000 18.75%,var(--c1) 0 31.25%,#0000 0),
          repeating-linear-gradient(45deg,var(--c1) -6.25% 6.25%,var(--c2) 0 18.75%);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Rhombus & Octagons",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 8.5714, 40.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g:var(--c1) 15%,var(--c2) 0 28%,#0000 0 72%,var(--c2) 0 85%,var(--c1) 0;
        background:
          conic-gradient(from 90deg at 2px 2px,#0000 25%,var(--c1) 0) -1px -1px,
          linear-gradient(-45deg,var(--_g)),linear-gradient(45deg,var(--_g)),
          conic-gradient(from 90deg at 40% 40%,var(--c1) 25%,var(--c2) 0)
           calc(var(--s)/-5) calc(var(--s)/-5);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Pill Shapes",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 2.4286, 12.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: radial-gradient(calc(var(--s)/2),var(--c1) 97%,#0000);
        background:
          var(--_g),var(--_g) calc(2*var(--s)) calc(2*var(--s)),
          repeating-conic-gradient(from 45deg,#0000 0 25%,var(--c2) 0 50%) calc(-.707*var(--s)) calc(-.707*var(--s)),
          repeating-linear-gradient(135deg,var(--c1) calc(var(--s)/-2) calc(var(--s)/2),var(--c2) 0 calc(2.328*var(--s)));
        background-size: calc(4*var(--s)) calc(4*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Half Circles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 5.0714, 23.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        background:
          radial-gradient(36% 72% at 25% -50%,var(--c2) 98%,#0000)
           0 0/calc(2*var(--s)) var(--s),
          radial-gradient(36% 72% at 75% 150%,var(--c2) 98%,#0000)
           0 0/calc(2*var(--s)) var(--s),
          radial-gradient(72% 36% at 150% 25%,var(--c2) 98%,#0000)
           0 0/var(--s) calc(2*var(--s)),
          radial-gradient(72% 36% at -50% 75%,var(--c2) 98%,#0000)
           0 0/var(--s) calc(2*var(--s)),
          repeating-conic-gradient(var(--c2) 0 45deg,var(--c1) 0 25%)
           0 0/calc(2*var(--s)) calc(2*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Curved Segments",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 4.2857, 20.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_c: var(--c1) calc(100% - var(--s)/2) 99%,#0000;
        --_g: var(--s),#0000 calc(99% - var(--s)/2),var(--_c);
        background:
          radial-gradient(var(--s) at 100% var(--_g)),
          radial-gradient(calc(var(--s)/4) at 50% calc(100%/3),var(--_c)) var(--s) 0,
          radial-gradient(var(--s) at   0% var(--_g)) 0 calc(3*var(--s))
          var(--c2);
        background-size:
          calc(2*var(--s)) calc(9*var(--s)/4),
          calc(2*var(--s)) calc(3*var(--s)/4);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Waves",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 2.1429, 12.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_s:37.5% 12.5% at 62.5%;
        --_g:34% 99%,#0000 101%;
        --g1:radial-gradient(var(--_s) 100%,#0000 32%,var(--c1) var(--_g));
        --g2:radial-gradient(var(--_s) 0   ,#0000 32%,var(--c1) var(--_g));
        --g3:radial-gradient(var(--_s) 100%,#0000 32%,var(--c2) var(--_g));
        --g4:radial-gradient(var(--_s) 0   ,#0000 32%,var(--c2) var(--_g));
        background:
          var(--g1),
          var(--g2) 0                calc(3*var(--s)),
          var(--g3) var(--s)         calc(3*var(--s)),
          var(--g4) var(--s)         calc(6*var(--s)),
          var(--g1) calc(2*var(--s)) calc(6*var(--s)),
          var(--g2) calc(2*var(--s)) calc(9*var(--s)),
          var(--g3) calc(3*var(--s)) calc(9*var(--s)),
          var(--g4) calc(3*var(--s)) 0,
          repeating-linear-gradient(var(--c1) 0 25%,var(--c2) 0 50%);
        background-size: calc(4*var(--s)) calc(12*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Arrows",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        background:
          conic-gradient(#0000 75%,var(--c1) 0) 0 calc(var(--s)/4),
          conic-gradient(from 45deg,var(--c1) 25%,var(--c2) 0);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Irregular Zig-Zag",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 4.7143, 22.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --c: var(--c1) 25%;
        background:
          conic-gradient(from -45deg at 75% 12.5%,var(--c),#0000 0),
          conic-gradient(from 135deg at 25% 87.5%,var(--c),#0000 0)
           0 calc(var(--s)/2),
          conic-gradient(from 180deg at 50% 75%,#0000 62.5%,var(--c)),
          conic-gradient(            at 50% 25%,#0000 62.5%,var(--c))
           0 calc(var(--s)/2) var(--c2);
        background-size: var(--s) calc(2*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Outline Circles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 15.7143, 73.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g:radial-gradient(#0000 60%,var(--c1) 61% 63%,#0000 64% 77%,var(--c1) 78% 80%,#0000 81%);
        --_c:,#0000 75%,var(--c2) 0;
        background:
          conic-gradient(at 12% 20% var(--_c)) calc(var(--s)* .44) calc(.9*var(--s)),
          conic-gradient(at 12% 20% var(--_c)) calc(var(--s)*-.06) calc(.4*var(--s)),
          conic-gradient(at 20% 12% var(--_c)) calc(.9*var(--s)) calc(var(--s)* .44),
          conic-gradient(at 20% 12% var(--_c)) calc(.4*var(--s)) calc(var(--s)*-.06),
          var(--_g),var(--_g) calc(var(--s)/2) calc(var(--s)/2) var(--c2);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Zig-Zag & Rectangles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --g: var(--c1)    3.125%,var(--c2) 0 9.375%,
             var(--c1) 0 15.625%,var(--c2) 0 21.875%,
             var(--c1) 0 28.125%,#0000 0;
        background:
          linear-gradient(225deg,#0000    3.125%,var(--c2) 0 9.375%,
                                 #0000 0 78.125%,var(--c2) 0 84.375%,#0000 0)
           0 calc(var(--s)/2),
          linear-gradient( 45deg,var(--g)) 0 var(--s),
          linear-gradient( 45deg,var(--g)) calc(var(--s)/-2) calc(var(--s)/-2),
          linear-gradient(225deg,var(--g)) var(--s) 0,
          linear-gradient(225deg,var(--g)) calc(var(--s)/2) var(--s),
          repeating-linear-gradient(-45deg,var(--c1) -3.125% 3.125%,var(--c2) 0 9.375%);
        background-size: calc(2*var(--s)) calc(2*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Right Triangles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 5.0, 23.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g:,#0000 75%,var(--c1) 0;
        background:
          linear-gradient(-45deg var(--_g)),
          linear-gradient( 45deg var(--_g))
           0 calc(var(--s)/2) var(--c2);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Thick Wavy Lines",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 3.5714, 16.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: calc(2*var(--s)) calc(2*var(--s))
          radial-gradient(25% 25%,var(--c1) 99%,#0000 101%);
        background:
          0 var(--s)/var(--_g),var(--s) 0/var(--_g),
          radial-gradient(50% 50%,var(--c2) 97%,#0000)
           calc(var(--s)/2) calc(var(--s)/2)/var(--s) var(--s),
          linear-gradient(90deg,var(--c1) 50%,var(--c2) 0)
           0 0/calc(2*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Diagonal Wavy Lines",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: #0000 24%,
          var(--c2) 26% 34%,var(--c1) 36% 44%,
          var(--c2) 46% 54%,var(--c1) 56% 64%,
          var(--c2) 66% 74%,#0000 76%;
        background:
          radial-gradient(100% 100% at 100% 0,var(--_g)),
          radial-gradient(100% 100% at 0 100%,var(--_g)),
          radial-gradient(var(--c2) 14%,var(--c1) 16%)
           calc(var(--s)/2) calc(var(--s)/2);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Outline Ovals",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 2.0714, 12.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --g:#0000 calc(100% - var(--s)/3 - 1px),var(--c1)
            calc(100% - var(--s)/3) calc(100% - 1px),#0000;
        --r:calc(2.414*var(--s));
        --p:calc(1.414*var(--s));
        background:
          radial-gradient(var(--r) at 0    0   ,var(--g)) var(--r) var(--r),
          radial-gradient(var(--s) at 0    0   ,var(--g)) var(--p) var(--p),
          radial-gradient(var(--r) at 0    100%,var(--g)) 0 var(--p),
          radial-gradient(var(--s) at 0    100%,var(--g)) calc(-1*var(--s)) var(--r),
          radial-gradient(var(--r) at 100% 0   ,var(--g)) var(--p) 0,
          radial-gradient(var(--s) at 100% 0   ,var(--g)) var(--r) calc(-1*var(--s)),
          radial-gradient(var(--r) at 100% 100%,var(--g)) calc(-1*var(--s)) calc(-1*var(--s)),
          radial-gradient(var(--s) at 100% 100%,var(--g)) var(--c2);
        background-size: calc(2*var(--r)) calc(2*var(--r));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Wave & Circles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 11.4286, 53.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --_g: var(--s) var(--s)
          radial-gradient(var(--c1) 17%,var(--c2) 18% 35%,#0000 36.5%);
        background:
          calc(var(--s)/-4) calc(var(--s)/-4)/var(--_g),
          calc(var(--s)/ 4) calc(var(--s)/ 4)/var(--_g),
          radial-gradient(var(--c2) 34%,var(--c1) 36% 68%,#0000 70%)
           0 0/calc(var(--s)/2) calc(var(--s)/2),
          repeating-linear-gradient(45deg,var(--c1) -12.5% 12.5%,var(--c2) 0 37.5%)
           0 0/var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Tetris Style",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 7.1429, 33.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        background:
          conic-gradient(at 50% 25%,var(--c2) 25%,#0000 0)
           calc(var(--s)/-4) calc(var(--s)/-2),
          conic-gradient(at 25% 25%,var(--c1) 25%,#0000 0 75%,var(--c2) 0)
           calc(var(--s)/4) calc(var(--s)/-4),
          conic-gradient(from -90deg at 75% 25%,var(--c2) 75%,var(--c1) 0);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Connected Squares",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 11.4286, 53.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        background:
          conic-gradient(at 25% 25%,#0000 75%,var(--c1) 0)
           0 calc(3*var(--s)/4),
          conic-gradient(#0000 75%,var(--c2) 0)
           calc(var(--s)/-8) calc(5*var(--s)/8),
          conic-gradient(at 25% 75%,var(--c1) 25%,var(--c2) 0);
        background-size: var(--s) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Honeycomb",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 2.6429, 12.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --c:#0000,var(--c1) .5deg 119.5deg,#0000 120deg;
        --g1:conic-gradient(from  60deg at 56.25% calc(425%/6),var(--c));
        --g2:conic-gradient(from 180deg at 43.75% calc(425%/6),var(--c));
        --g3:conic-gradient(from -60deg at 50%   calc(175%/12),var(--c));
        background:
          var(--g1),var(--g1) var(--s) calc(1.73*var(--s)),
          var(--g2),var(--g2) var(--s) calc(1.73*var(--s)),
          var(--g3) var(--s) 0,var(--g3) 0 calc(1.73*var(--s))
          var(--c2);
        background-size: calc(2*var(--s)) calc(3.46*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Hexagons",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 5.4286, 25.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        background:
          conic-gradient(from 30deg at 80%,
             var(--c1) 60deg,var(--c2) 0 120deg,#0000 0),
          conic-gradient(from -30deg,
            var(--c2)   120deg,var(--c1) 0 240deg,
            var(--c2) 0 300deg,var(--c1) 0);
        background-size: calc(3*var(--s)/2) var(--s);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Intersecting Wavy Lines",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 0.4286, 12.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --g:#0000 66%,var(--c1) 68% 98%,#0000;
        background:
          radial-gradient(30% 30% at 0%   30%,var(--g))
           var(--s) calc(9*var(--s)),
          radial-gradient(30% 30% at 100% 30%,var(--g))
           var(--s) calc(-1*var(--s)),
          radial-gradient(30% 30% at 30% 100%,var(--g))
           calc(10*var(--s)) 0,
          radial-gradient(30% 30% at 30% 0%  ,var(--g))
           var(--c2);
        background-size: calc(20*var(--s)) calc(20*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Diagonal Lines",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 6.1429, 28.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --g:#0000 45%,var(--c1) 46% 54%,#0000 55%;
        background:
          linear-gradient( 60deg,var(--g)),
          linear-gradient(-60deg,var(--g)) var(--c2);
        background-size: var(--s) calc(tan(60deg)*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Octagons & Squares",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 1.4286, 12.0);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --c:#0000 46.46%,var(--c1) 0 53.53%,#0000 0;
        --d:calc(10*var(--s)) calc(10*var(--s));
        --g:/var(--d) conic-gradient(at 40% 40%,#0000 75%,var(--c1) 0);
        background:
          conic-gradient(at 40% 40%,#0000 75%,var(--c2) 0)
           calc(9*var(--s)) calc(9*var(--s))/
           calc(5*var(--s)) calc(5*var(--s)),
          calc(8*var(--s)) calc(8*var(--s)) var(--g),
          calc(3*var(--s)) calc(3*var(--s)) var(--g),
          linear-gradient( 45deg,var(--c)) 0 0/var(--d),
          linear-gradient(-45deg,var(--c)) 0 0/var(--d) var(--c2);
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Outline Triangles",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 8.0, 37.33);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --g1:conic-gradient(from -45deg at 60%,#0000 75%,var(--c1) 0);
        --g2:conic-gradient(from -45deg at 30%,#0000 75%,var(--c2) 0);
        background:
          var(--g2) calc(var(--s)/8) 0,var(--g2) calc(5*var(--s)/8) var(--s),
          var(--g1),var(--g1) calc(var(--s)/2) var(--s) var(--c2);
        background-size: var(--s) calc(2*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

    {
        name: "Herringbone",
        style: (scale: number, color1: string, color2: string) => {
            const palette = createPalette(color1, color2);
            const size = Math.max(scale * 3.5714, 16.67);
            return `
      --s: ${size}px;
      --c1: ${palette.accent};
      --c2: ${palette.base};
        --c:#0000 75%,var(--c1) 0;
        --g1:conic-gradient(at 78% 3%,var(--c));
        --g2:conic-gradient(at 3% 78%,var(--c));
        background:
          var(--g1),
          var(--g1) var(--s) var(--s),
          var(--g1) calc(2*var(--s)) calc(2*var(--s)),
          var(--g1) calc(3*var(--s)) calc(3*var(--s)),
          var(--g2) 0 calc(3*var(--s)),
          var(--g2) var(--s) 0,
          var(--g2) calc(2*var(--s)) var(--s),
          var(--g2) calc(3*var(--s)) calc(2*var(--s))
          var(--c2);
        background-size: calc(4*var(--s)) calc(4*var(--s));
      background-color: ${palette.base};
      opacity: 1.0;
    `;
        },
    },

];
