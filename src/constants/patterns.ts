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
        name: "Aurora Dream Corner Whispers",
        style: (scale: number, color1: string, color2: string) => {
            const accentStrong = addAlpha(color1, "88");
            const accentSoft = addAlpha(color1, "55");
            const glow = addAlpha(color2, "70");
            const glowSoft = addAlpha(color2, "45");
            const base = color2;
            const baseHighlight = addAlpha(color2, "35");
            const ellipseX = 80 + Math.max(scale - 10, 0) * 1.2;
            const ellipseY = 60 + Math.max(scale - 10, 0);

            return `
      background:
        radial-gradient(ellipse ${ellipseX}% ${ellipseY}% at 8% 8%, ${accentSoft}, transparent 60%),
        radial-gradient(ellipse ${ellipseX - 10}% ${ellipseY - 5}% at 75% 35%, ${glow}, transparent 62%),
        radial-gradient(ellipse ${ellipseX - 15}% ${ellipseY - 5}% at 15% 80%, ${accentStrong}, transparent 62%),
        radial-gradient(ellipse ${ellipseX - 5}% ${ellipseY - 5}% at 92% 92%, ${glowSoft}, transparent 62%),
        linear-gradient(180deg, ${baseHighlight} 0%, ${base} 100%);
      background-color: ${base};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Aurora Dream Soft Harmony",
        style: (scale: number, color1: string, color2: string) => {
            const accentStrong = addAlpha(color1, "7f");
            const accentSoft = addAlpha(color1, "55");
            const glow = addAlpha(color2, "70");
            const glowSoft = addAlpha(color2, "45");
            const base = color2;
            const baseHighlight = addAlpha(color2, "40");
            const ellipseX = 75 + Math.max(scale - 10, 0) * 1.1;
            const ellipseY = 58 + Math.max(scale - 10, 0) * 0.9;

            return `
      background:
        radial-gradient(ellipse ${ellipseX}% ${ellipseY}% at 60% 20%, ${accentStrong}, transparent 65%),
        radial-gradient(ellipse ${ellipseX - 12}% ${ellipseY - 5}% at 20% 80%, ${accentSoft}, transparent 65%),
        radial-gradient(ellipse ${ellipseX - 20}% ${ellipseY - 8}% at 60% 65%, ${glow}, transparent 62%),
        radial-gradient(ellipse ${ellipseX - 15}% ${ellipseY - 10}% at 50% 60%, ${glowSoft}, transparent 68%),
        linear-gradient(180deg, ${baseHighlight} 0%, ${base} 100%);
      background-color: ${base};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Aurora Dream Vivid Bloom",
        style: (scale: number, color1: string, color2: string) => {
            const accentStrong = addAlpha(color1, "c0");
            const accent = addAlpha(color1, "90");
            const glow = addAlpha(color2, "b0");
            const glowSoft = addAlpha(color2, "55");
            const base = color2;
            const baseHighlight = addAlpha(color2, "50");
            const ellipseX = 78 + Math.max(scale - 10, 0) * 1.1;
            const ellipseY = 60 + Math.max(scale - 10, 0);

            return `
      background:
        radial-gradient(ellipse ${ellipseX}% ${ellipseY}% at 70% 20%, ${accentStrong}, transparent 68%),
        radial-gradient(ellipse ${ellipseX - 10}% ${ellipseY - 4}% at 20% 80%, ${accent}, transparent 68%),
        radial-gradient(ellipse ${ellipseX - 18}% ${ellipseY - 6}% at 60% 65%, ${glow}, transparent 68%),
        radial-gradient(ellipse ${ellipseX - 12}% ${ellipseY - 8}% at 50% 60%, ${glowSoft}, transparent 68%),
        linear-gradient(180deg, ${baseHighlight} 0%, ${base} 100%);
      background-color: ${base};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Diagonal Grid with Light",
        style: (scale: number, color1: string, color2: string) => {
            const lineColor = addAlpha(color1, "33");
            const highlight = addAlpha(color1, "18");
            const size = Math.max(scale * 3, 18);

            return `
      background-color: ${color2};
      background-image:
        repeating-linear-gradient(45deg, ${lineColor} 0, ${lineColor} 1px, transparent 1px, transparent ${size}px),
        repeating-linear-gradient(-45deg, ${highlight} 0, ${highlight} 1px, transparent 1px, transparent ${size}px);
      background-size: ${size}px ${size}px;
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Dark Grid with White Dots",
        style: (scale: number, color1: string, color2: string) => {
            const grid = addAlpha(color1, "25");
            const dots = addAlpha(color1, "80");
            const size = Math.max(scale * 1.5, 16);

            return `
      background: ${color2};
      background-image:
        linear-gradient(to right, ${grid} 1px, transparent 1px),
        linear-gradient(to bottom, ${grid} 1px, transparent 1px),
        radial-gradient(circle, ${dots} 1px, transparent 1px);
      background-size: ${size}px ${size}px, ${size}px ${size}px, ${size}px ${size}px;
      background-position: 0 0, 0 0, 0 0;
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Gradient Diagonal Lines",
        style: (scale: number, color1: string, color2: string) => {
            const accent = addAlpha(color1, "40");
            const accentSoft = addAlpha(color1, "25");
            const spacing = Math.max(scale * 1.2, 10);
            const fineSpacing = Math.max(spacing / 3, 4);

            return `
      background-color: ${color2};
      background-image:
        repeating-linear-gradient(45deg, ${accent} 0, ${accent} 1px, transparent 1px, transparent ${spacing}px),
        repeating-linear-gradient(-45deg, ${accentSoft} 0, ${accentSoft} 1px, transparent 1px, transparent ${spacing}px),
        repeating-linear-gradient(90deg, ${addAlpha(color1, "12")} 0, ${addAlpha(color1, "12")} 1px, transparent 1px, transparent ${fineSpacing}px);
      background-size: ${spacing * 2}px ${spacing * 2}px, ${spacing * 2}px ${spacing * 2}px, ${fineSpacing}px ${fineSpacing}px;
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Dark Noise Colors",
        style: (scale: number, color1: string, color2: string) => {
            const accentA = addAlpha(color1, "33");
            const accentB = addAlpha(color1, "22");
            const accentC = addAlpha(color2, "28");
            const size = Math.max(scale * 1.4, 18);
            const offset = Math.round(size / 2);
            const offsetAltX = Math.round(size / 1.5);
            const offsetAltY = Math.round(size / 3);

            return `
      background: ${color2};
      background-image:
        radial-gradient(circle at 1px 1px, ${accentA} 1px, transparent 0),
        radial-gradient(circle at 1px 1px, ${accentB} 1px, transparent 0),
        radial-gradient(circle at 1px 1px, ${accentC} 1px, transparent 0);
      background-size: ${size}px ${size}px, ${size * 1.5}px ${size * 1.5}px, ${size * 1.25}px ${size * 1.25}px;
      background-position: 0 0, ${offset}px ${offset}px, ${offsetAltX}px ${offsetAltY}px;
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Top Glow Midnight",
        style: (scale: number, color1: string, color2: string) => {
            const glow = addAlpha(color1, "40");
            const spread = 70 + Math.max(scale - 10, 0) * 1.8;

            return `
      background: radial-gradient(ellipse 80% ${spread}% at 50% 0%, ${glow}, transparent 70%), ${color2};
      background-color: ${color2};
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
        name: "Candy Stripes",
        style: (scale: number, color1: string, color2: string) => {
            // Ausgangs-Design: --color,  background-size: 10px 40px
            const sX = scale;          // Breite der Streifen
            const sY = scale * 4;      // Höhe des Stripe-Blocks
            return `
      background-color: ${color2};
      opacity: 1.0;
      background:
        linear-gradient(45deg, ${color1} 25%, transparent 25%) -${sX * 5}px 0,
        linear-gradient(-45deg, ${color1} 25%, transparent 25%) -${sX * 5}px 0,
        linear-gradient(45deg, transparent 75%, ${color1} 75%) -${sX * 5}px 0,
        linear-gradient(-45deg, transparent 75%, ${color1} 75%) -${sX * 5}px 0;
      background-size: ${sX}px ${sY}px;
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
        name: "Paper",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: linear-gradient(${color1} ${scale * 2}px, transparent ${scale * 2}px), 
                         linear-gradient(90deg, ${color1} ${scale * 2}px, transparent ${scale * 2}px), 
                         linear-gradient(${color1} ${scale}px, transparent ${scale}px), 
                         linear-gradient(90deg, ${color1} ${scale}px, ${color2} ${scale}px);
       background-size: ${scale * 50}px ${scale * 50}px, ${scale * 50}px ${scale * 50}px, ${scale * 10}px ${scale * 10}px, ${scale * 10}px ${scale * 10}px;
       background-position: -${scale}px -${scale}px, -${scale}px -${scale}px, -${scale * 2}px -${scale * 2}px, -${scale * 2}px -${scale * 2}px;`,
    },
    {
        name: "Isometric",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: linear-gradient(30deg, ${color1} 12%, transparent 12.5%, transparent 87%, ${color1} 87.5%, ${color1}), 
                         linear-gradient(150deg, ${color1} 12%, transparent 12.5%, transparent 87%, ${color1} 87.5%, ${color1}); 
       background-size: ${scale * 20}px ${scale * 35}px;`,
    },
    {
        name: "Polka",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: radial-gradient(${color1} 2.5px, ${color2} 2.5px); 
       background-size: ${scale * 10}px ${scale * 10}px;`,
    },
    {
        name: "Polka v2",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: radial-gradient(${color1} 2.5px, transparent 2.5px), 
                         radial-gradient(${color1} 2.5px, ${color2} 2.5px); 
       background-size: ${scale * 20}px ${scale * 20}px; 
       background-position: 0 0, ${scale * 10}px ${scale * 10}px;`,
    },
    {
        name: "Lines v3",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-size: ${scale * 20}px ${scale * 20}px; 
       background-image: repeating-linear-gradient(0deg, ${color1}, ${color1} 3.2px, ${color2} 3.2px, ${color2});`,
    },
    {
        name: "Lines v4",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-size: ${scale * 20}px ${scale * 20}px; 
       background-image: repeating-linear-gradient(to right, ${color1}, ${color1} 3.2px, ${color2} 3.2px, ${color2});`,
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
        name: "Cross",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2};
       opacity: 1.0;
       background: radial-gradient(circle, transparent 20%, ${color2} 20%, ${color2} 80%, transparent 80%, transparent),
                  radial-gradient(circle, transparent 20%, ${color2} 20%, ${color2} 80%, transparent 80%, transparent) ${scale * 12.5}px ${scale * 12.5}px,
                  linear-gradient(${color1} ${scale}px, transparent ${scale}px) 0 -1px,
                  linear-gradient(90deg, ${color1} ${scale}px, ${color2} ${scale}px) -1px 0;
       background-size: ${scale * 25}px ${scale * 25}px, ${scale * 25}px ${scale * 25}px, ${scale * 12.5}px ${scale * 12.5}px, ${scale * 12.5}px ${scale * 12.5}px;`,
    },
    {
        name: "Cubes Illusion",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 20, 100);
            const tan30 = Math.tan((30 * Math.PI) / 180);
            const highlight = addAlpha(color2, "f0");
            const mid = addAlpha(color2, "c0");
            const shade = addAlpha(color1, "b0");

            return `
      background:
        repeating-conic-gradient(from 30deg, #0000 0 120deg, ${shade} 0 50%) ${s / 2}px ${(s * tan30) / 2}px,
        repeating-conic-gradient(from 30deg, ${highlight} 0 60deg, ${mid} 0 120deg, ${shade} 0 50%);
      background-size: ${s}px ${s * tan30}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Curved Lines",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 60);
            const light = addAlpha(color2, "33");
            const accent = addAlpha(color1, "cc");
            const softAccent = addAlpha(color1, "88");

            return `
      background:
        radial-gradient(47% 50% at -10% 50%, #0000 37%, ${light} 39% 70%, #0000 72%) 0 ${s / 2}px,
        radial-gradient(47% 50% at -10% 50%, #0000 37%, ${light} 39% 70%, #0000 72%) ${s / 2}px 0,
        radial-gradient(47% 50% at 110% 50%, #0000 37%, ${light} 39% 70%, #0000 72%),
        radial-gradient(47% 50% at 110% 50%, #0000 37%, ${light} 39% 70%, #0000 72%) ${s / 2}px ${s / 2}px,
        conic-gradient(from 0deg at 55% 50%, ${accent} 40deg, ${softAccent} 0 140deg, ${accent} 0 180deg, #0000 0) ${s / 4}px 0,
        conic-gradient(from 180deg at 45% 50%, ${accent} 40deg, ${softAccent} 0 140deg, ${accent} 0 180deg, #0000 0) ${s / 4}px 0,
        ${color2};
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Overlapping Circles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 15, 80);
            const accent = addAlpha(color1, "e6");
            const shade = addAlpha(color2, "cc");

            const gradientStops = `
      ${accent} 0% 5%, ${shade} 6% 15%, ${accent} 16% 25%, ${shade} 26% 35%, ${accent} 36% 45%,
      ${shade} 46% 55%, ${accent} 56% 65%, ${shade} 66% 75%, ${accent} 76% 85%, ${shade} 86% 95%,
      #0000 96%
    `;

            return `
      background:
        radial-gradient(50% 50% at 100% 0, ${gradientStops}),
        radial-gradient(50% 50% at 0 100%, ${gradientStops}),
        radial-gradient(50% 50%, ${gradientStops}),
        radial-gradient(50% 50%, ${gradientStops}) ${s / 2}px ${s / 2}px ${accent};
      background-size: ${s}px ${s}px;
      background-color: ${color1};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Triangles 3D Effect",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10.5, 60);
            const tan30 = Math.tan((30 * Math.PI) / 180);
            const highlight = addAlpha(color2, "f0");
            const mid = addAlpha(color2, "cc");
            const shade = addAlpha(color1, "c0");

            return `
      background:
        conic-gradient(from 75deg, ${shade} 15deg, ${mid} 0 30deg, #0000 0 180deg, ${mid} 0 195deg, ${shade} 0 210deg, #0000 0)
          ${s / 2}px ${(0.5 * s) / tan30}px,
        conic-gradient(${shade} 30deg, ${highlight} 0 75deg, ${shade} 0 90deg, ${mid} 0 105deg,
                       ${highlight} 0 150deg, ${mid} 0 180deg, ${highlight} 0 210deg, ${shade} 0 256deg,
                       ${mid} 0 270deg, ${shade} 0 286deg, ${mid} 0 331deg, ${highlight} 0);
      background-size: ${s}px ${s / tan30}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Parallelograms",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 50);
            const highlight = addAlpha(color1, "cc");
            const shade = addAlpha(color2, "d9");

            return `
      background: linear-gradient(${Math.atan(-0.5)}rad, ${highlight} 33%, ${shade} 33.5% 66.5%, ${highlight} 67%)
        0 / ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Diagonal Squares",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 60);
            const accent = addAlpha(color1, "d9");

            return `
      background:
        repeating-conic-gradient(at 33% 33%, ${accent} 0 25%, #0000 0 50%),
        repeating-conic-gradient(at 66% 66%, ${accent} 0 25%, #0000 0 50%),
        ${color2};
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Hearts",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 12, 60);
            const accent = addAlpha(color1, "ee");
            const base = addAlpha(color2, "dd");

            return `
      background:
        radial-gradient(at 80% 80%, ${accent} 25.4%, #0000 26%),
        radial-gradient(at 20% 80%, ${accent} 25.4%, #0000 26%),
        conic-gradient(from -45deg at 50% 41%, ${accent} 90deg, ${base} 0) ${s / 2}px 0;
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Stars",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 9, 54);
            const d = s / 10;
            const star = `${color1} 36deg, #0000 0`;

            return `
      background:
        conic-gradient(from 162deg at ${s * 0.5}px ${s * 0.68}px, ${star}),
        conic-gradient(from 18deg at ${s * 0.19}px ${s * 0.59}px, ${star}),
        conic-gradient(from 306deg at ${s * 0.81}px ${s * 0.59}px, ${star}),
        ${color2};
      background-position: 0 ${s * 0.35}px;
      background-size: ${s + d}px ${s + d}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Equal Sign",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 20, 100);
            const accent = addAlpha(color1, "f2");
            const glow = addAlpha(color1, "bb");

            const band = `#0000 8%, ${accent} 0 17%, #0000 0 58%`;

            return `
      background:
        linear-gradient(135deg, #0000 20.5%, ${accent} 0 29.5%, #0000 0) 0 ${s / 4}px,
        linear-gradient(45deg, ${band}) ${s / 2}px 0,
        linear-gradient(135deg, ${band}, ${accent} 0 67%, #0000 0),
        linear-gradient(45deg, ${band}, ${accent} 0 67%, #0000 0 83%, ${accent} 0 92%, #0000 0),
        ${glow};
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Triangles & Chevrons",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 6.4, 40);
            const accent = addAlpha(color1, "dd");
            const shade = addAlpha(color2, "f0");

            return `
      background:
        conic-gradient(from 135deg, ${accent} 90deg, #0000 0) ${s}px ${s / 2}px,
        conic-gradient(from 135deg, ${shade} 90deg, #0000 0),
        conic-gradient(from 135deg at 50% 0, ${accent} 90deg, #0000 0) ${color2};
      background-size: ${s * 2}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Rhombus & Stripes",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 6.4, 40);
            const accent = addAlpha(color1, "e0");
            const shade = addAlpha(color2, "f0");

            return `
      background:
        conic-gradient(from -45deg, ${accent} 90deg, #0000 0 180deg, ${shade} 0 270deg, #0000 0)
          0 ${s / 2}px / ${s}px ${s}px,
        conic-gradient(from 135deg at 50% 0, ${accent} 90deg, ${shade} 0) 0 0 / ${s * 2}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Mosaic Triangles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 3.6, 24);
            const accent = addAlpha(color1, "dd");
            const base = color2;
            const deep = addAlpha(color1, "f5");

            const g = `calc(2*${s}px*1.732) calc(2*${s}px) conic-gradient(from 60deg at 62.5% 50%, ${deep} 60deg, #0000 0)`;

            return `
      background:
        ${2.598 * s / 2}px ${s / 2}px / ${g},
        ${-0.866 * s / 2}px ${-s / 2}px / ${g},
        repeating-conic-gradient(${base} 0 90deg, #0000 0 180deg)
          0 0 / ${2 * s * 1.732}px ${2 * s}px,
        repeating-conic-gradient(from 60deg, ${accent} 0 60deg, ${base} 0 180deg)
          0 0 / ${s * 1.732}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Mosaic Parallelograms",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 12.5, 80);
            const accent = addAlpha(color1, "ee");
            const shade = addAlpha(color2, "f0");

            const g = `${accent} 90deg, ${shade} 0 135deg, #0000 0`;

            return `
      background:
        conic-gradient(from -45deg at calc(100% / 3) calc(100% / 3), ${accent} 90deg, #0000 0),
        conic-gradient(from -135deg at calc(100% / 3) calc(2 * 100% / 3), ${g}),
        conic-gradient(from 135deg at calc(2 * 100% / 3) calc(2 * 100% / 3), ${g}),
        conic-gradient(from 45deg at calc(2 * 100% / 3) calc(100% / 3), ${g}, ${accent} 0 225deg, ${shade} 0);
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Meander",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 12, 60);
            const accent = addAlpha(color1, "cc");

            const pattern = `radial-gradient(at 62.5% 12.5%, ${accent} 25%, #0000 0)`;
            const pattern2 = `radial-gradient(at 87.5% 62.5%, ${accent} 25%, #0000 0)`;
            const pattern3 = `radial-gradient(at 25% 12.5%, ${accent} 25%, #0000 0)`;

            return `
      background:
        ${pattern} ${s / -8}px ${s / 2}px,
        ${pattern} ${(-3 * s) / 8}px ${s / 4}px,
        ${pattern2} ${(3 * s) / 8}px ${s / 4}px,
        ${pattern2} ${s / -8}px 0,
        ${pattern3} 0 ${-s / 4}px,
        ${pattern3} ${-s / 4}px 0,
        radial-gradient(at 87.5% 87.5%, ${accent} 25%, #0000 0) ${s / 8}px 0,
        ${color2};
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Plus Sign",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 4, 32);
            const accent = addAlpha(color1, "dd");

            const g1 = `conic-gradient(at 10% 50%, #0000 75%, ${accent} 0)`;
            const g2 = `conic-gradient(at 50% 10%, #0000 75%, ${accent} 0)`;

            return `
      background:
        ${g1},
        ${g1} ${s}px ${3 * s}px,
        ${g1} ${2 * s}px ${s}px,
        ${g1} ${3 * s}px ${4 * s}px,
        ${g1} ${4 * s}px ${2 * s}px,
        ${g2} 0 ${4 * s}px,
        ${g2} ${s}px ${2 * s}px,
        ${g2} ${2 * s}px 0,
        ${g2} ${3 * s}px ${3 * s}px,
        ${g2} ${4 * s}px ${s}px,
        ${color2};
      background-size: ${5 * s}px ${5 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Squares",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 5, 40);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "cc");

            return `
      background:
        conic-gradient(at 25% 25%, #0000 75%, ${accent} 0) ${s}px ${s}px,
        repeating-conic-gradient(at 25% 25%, ${accent} 0 25%, ${shade} 0 50%);
      background-size: ${2 * s}px ${2 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Nested Rhombus Soft",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 60);
            const accent = addAlpha(color1, "cc");
            const transparentAccent = addAlpha(color1, "44");

            return `
      background:
        linear-gradient(45deg,
          #0000 calc(25% / 3), ${accent} 0 calc(50% / 3),
          #0000 0 25%, ${accent} 0 75%,
          #0000 0 calc(250% / 3), ${accent} 0 calc(275% / 3),
          #0000 0),
        linear-gradient(45deg,
          ${transparentAccent} calc(25% / 3), #0000 0 calc(50% / 3),
          ${transparentAccent} 0 calc(250% / 3), #0000 0 calc(275% / 3),
          ${transparentAccent} 0),
        linear-gradient(-45deg,
          #0000 calc(25% / 3), ${accent} 0 calc(50% / 3),
          #0000 0 calc(250% / 3), ${accent} 0 calc(275% / 3),
          #0000 0),
        linear-gradient(-45deg,
          ${transparentAccent} calc(25% / 3), #0000 0 calc(50% / 3),
          ${transparentAccent} 0 calc(250% / 3), #0000 0 calc(275% / 3),
          ${transparentAccent} 0)
        ${color2};
      background-position: 0 0, ${s}px ${s}px;
      background-size: ${2 * s}px ${2 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Linked Squares",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 60);
            const doubled = 2 * s;
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");
            const grid = `${doubled}px ${doubled}px conic-gradient(at 40% 40%, #0000 75%, ${accent} 0)`;
            const pattern = `${doubled}px ${doubled}px conic-gradient(at 20% 20%, #0000 75%, ${shade} 0)`;

            return `
      background:
        ${0.9 * s}px ${0.9 * s}px / ${pattern},
        ${-0.1 * s}px ${-0.1 * s}px / ${pattern},
        ${0.7 * s}px ${0.7 * s}px / ${grid},
        ${-0.3 * s}px ${-0.3 * s}px / ${grid},
        conic-gradient(from 90deg at 20% 20%, ${shade} 25%, ${accent} 0) 0 0 / ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Z Shape",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10.6, 64);
            const accent = addAlpha(color1, "e0");
            const shade = addAlpha(color2, "f0");

            return `
      background:
        conic-gradient(from 30deg at 87.5% 75%, ${shade} 60deg, ${accent} 0 120deg, #0000 0) 0 ${0.2165 * s}px,
        conic-gradient(from -90deg at 50% 25%, ${accent} 60deg, ${shade} 0 180deg, #0000 0),
        conic-gradient(from 90deg at 50% 75%, ${accent} 120deg, ${shade} 0 180deg, #0000 0),
        conic-gradient(from -30deg at 87.5% 50%, ${accent} 120deg, ${shade} 0 240deg, #0000 0),
        conic-gradient(from 90deg at 37.5% 50%, ${accent} 120deg, ${shade} 0 180deg, ${accent} 0 240deg, ${shade} 0);
      background-size: ${s}px ${0.866 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Quatrefoils",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 6, 36);
            const accent = addAlpha(color1, "dd");

            return `
      background:
        radial-gradient(27% 29% at right, #0000 83%, ${accent} 85% 99%, #0000 101%) ${s / 2}px ${s}px,
        radial-gradient(27% 29% at left, #0000 83%, ${accent} 85% 99%, #0000 101%) ${-s / 2}px ${s}px,
        radial-gradient(29% 27% at top, #0000 83%, ${accent} 85% 99%, #0000 101%) 0 ${s / 2}px,
        radial-gradient(29% 27% at bottom, #0000 83%, ${accent} 85% 99%, #0000 101%) 0 ${-s / 2}px,
        ${color2};
      background-size: ${2 * s}px ${2 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Loop Circles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 15, 90);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");

            const stops = `${accent} 6.1%, ${shade} 6.4% 18.6%, ${accent} 18.9% 31.1%, ${shade} 31.4% 43.6%, ${accent} 43.9% 56.1%, ${shade} 56.4% 68.6%, #0000 68.9%`;

            return `
      background:
        radial-gradient(${s}px at 100% 0, ${stops}),
        radial-gradient(${s}px at 0 0, ${stops}),
        radial-gradient(${s}px at 0 100%, ${stops}),
        radial-gradient(${s}px at 100% 100%, ${stops}) ${accent};
      background-size: ${s}px ${s}px;
      background-color: ${color1};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Rotated Squares",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 15, 90);
            const accent = addAlpha(color1, "f0");

            return `
      background:
        conic-gradient(from 116.56deg at calc(100% / 3) 0, #0000 90deg, ${accent} 0),
        conic-gradient(from -63.44deg at calc(200% / 3) 100%, #0000 90deg, ${accent} 0)
        ${color2};
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Stairs Pattern",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 5, 40);
            const accent = addAlpha(color1, "ee");
            const dark = addAlpha(color2, "f5");
            const light = addAlpha(color2, "33");

            const g = `conic-gradient(at 50% 25%, #0000 75%, ${accent} 0)`;

            return `
      background:
        ${g},
        ${g} ${s}px ${s}px,
        ${g} ${2 * s}px ${2 * s}px,
        ${g} ${3 * s}px ${3 * s}px,
        repeating-linear-gradient(135deg, ${dark} 0 12.5%, ${light} 0 25%);
      background-size: ${4 * s}px ${4 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Circles & Squares",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 60);
            const accent = addAlpha(color1, "f0");

            const stops = `${accent} 0 100%, #0000 102%`;

            return `
      background:
        conic-gradient(#0000 75%, ${stops}) ${s / 4}px ${s / 4}px,
        radial-gradient(65% 65% at 50% -50%, ${stops}),
        radial-gradient(65% 65% at -50% 50%, ${stops}),
        radial-gradient(65% 65% at 50% 150%, ${stops}),
        radial-gradient(65% 65% at 150% 50%, ${stops}) ${color2};
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Striped Circles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 7.6, 45);
            const accent = addAlpha(color1, "f0");
            const base = addAlpha(color2, "f0");
            const g = `conic-gradient(${accent} 25%, #0000 0) 0 0`;

            return `
      background:
        ${g} / ${2 * s}px ${s / 9.5}px,
        ${g} / ${s / 9.5}px ${2 * s}px,
        repeating-conic-gradient(#0000 0 25%, ${accent} 0 50%) ${s}px 0 / ${2 * s}px ${2 * s}px,
        radial-gradient(50% 50%, ${base} 98%, ${accent}) 0 0 / ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Flower Petals",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 6, 36);
            const accent = addAlpha(color1, "ee");
            const base = addAlpha(color2, "f0");

            const petal = `radial-gradient(25% 25% at 25% 25%, ${accent} 99%, #0000 101%)`;

            return `
      background:
        ${petal} ${s}px ${s}px / ${2 * s}px ${2 * s}px,
        ${petal} 0 0 / ${2 * s}px ${2 * s}px,
        radial-gradient(50% 50%, ${base} 98%, #0000) 0 0 / ${s}px ${s}px,
        repeating-conic-gradient(${base} 0 25%, ${accent} 0 50%) ${0.5 * s}px 0 / ${2 * s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Circles & Curved Lines",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 7, 42);
            const accent = addAlpha(color1, "f0");

            const loop = `#0000 46%, ${accent} 47% 53%, #0000 54%`;

            return `
      background:
        radial-gradient(100% 100% at 100% 100%, ${loop}) ${s}px ${s}px,
        radial-gradient(100% 100% at 0 0, ${loop}) ${s}px ${s}px,
        radial-gradient(100% 100%, #0000 22%, ${accent} 23% 29%, #0000 30% 34%, ${accent} 35% 41%, #0000 42%),
        ${color2};
      background-size: ${2 * s}px ${2 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Wavy Pattern",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 60);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");

            const stops = `${shade} 6% 14%, ${accent} 16% 24%, ${shade} 26% 34%, ${accent} 36% 44%, ${shade} 46% 54%, ${accent} 56% 64%, ${shade} 66% 74%, ${accent} 76% 84%, ${shade} 86% 94%`;

            return `
      background:
        radial-gradient(100% 100% at 100% 0, ${accent} 4%, ${stops}, #0008 96%, #0000),
        radial-gradient(100% 100% at 0 100%, #0000, #0008 4%, ${stops}, ${accent} 96%)
        ${accent};
      background-size: ${s}px ${s}px;
      background-color: ${color1};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Arabesque",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 5, 40);
            const thickness = s / 10;
            const accent = addAlpha(color1, "f0");

            const core = `#0000 calc(98% - ${thickness}px), ${accent} calc(100% - ${thickness}px) 98%, #0000`;
            const size = `${2 * s}px ${2.5 * s}px`;

            return `
      background:
        0 0 / ${size} radial-gradient(${s / 2}px at 0 20%, ${core}),
        ${-s}px ${1.25 * s}px / ${size} radial-gradient(${s / 2}px at 0 20%, ${core}),
        ${s}px 0 / ${size} radial-gradient(${s / 2}px at 100% 20%, ${core}),
        0 ${1.25 * s}px / ${size} radial-gradient(${s / 2}px at 100% 20%, ${core}),
        conic-gradient(at ${thickness}px ${0.2 * s + 2 * thickness}px, #0000 75%, ${accent} 0)
          ${-thickness / 2}px ${s - thickness}px / ${s}px ${1.25 * s}px,
        repeating-conic-gradient(${color2} 0 25%, #0000 0 50%) ${s}px ${-s / 8}px / ${size},
        conic-gradient(from 90deg at ${thickness}px ${thickness}px, ${color2} 25%, ${accent} 0)
          ${(s - thickness) / 2}px ${(s - thickness) / 2}px / ${s}px ${1.25 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Quarter Circles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 6.4, 38);
            const accent = addAlpha(color1, "f0");

            return `
      background:
        radial-gradient(at 100% 100%, ${accent} 35%, #0000 36%),
        radial-gradient(at 0 0, ${accent} 35%, #0000 36%)
        ${color2};
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Nested Rhombus Bold",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 8, 48);
            const accent = addAlpha(color1, "dd");
            const pattern = `repeating-linear-gradient(45deg, #0000 calc(-650% / 13) calc(50% / 13), ${accent} 0 calc(100% / 13), #0000 0 calc(150% / 13), ${accent} 0 calc(200% / 13), #0000 0 calc(250% / 13), ${accent} 0 calc(300% / 13))`;

            return `
      background:
        ${pattern},
        ${pattern} ${s}px ${s}px,
        ${pattern.replace(/45deg/g, "-45deg")},
        ${pattern.replace(/45deg/g, "-45deg")} ${s}px ${s}px ${color2};
      background-size: ${2 * s}px ${2 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Lollipop",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 5.6, 34);
            const r = s * 0.866;
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");
            const c1 = `radial-gradient(${s}px, ${accent} 99%, #0000 101%)`;
            const c2 = `radial-gradient(${s}px, ${shade} 99%, #0000 101%)`;

            return `
      background:
        radial-gradient(${s}px at ${100 + r}px 50%, ${accent} 99%, #0000 101%) 0 ${-2.5 * s}px,
        radial-gradient(${s}px at ${100 - r}px 50%, ${accent} 99%, #0000 101%) ${-2 * r}px ${s / 2}px,
        radial-gradient(${s}px at 100% 50%, ${shade} 99%, #0000 101%) 0 ${-2 * s}px,
        ${c1} ${r}px ${-2.5 * s}px,
        ${c2} ${r}px ${2.5 * s}px,
        radial-gradient(${s}px at 100% 100%, ${accent} 99%, #0000 101%) 0 ${-s}px,
        radial-gradient(${s}px at 0% 50%, ${accent} 99%, #0000 101%) 0 ${-4 * s}px,
        ${c2} ${-r}px ${-3.5 * s}px,
        ${c1} ${-r}px ${-2.5 * s}px,
        radial-gradient(${s}px at 100% 50%, ${shade} 99%, #0000 101%) ${-2 * r}px ${s}px,
        ${c1} ${-r}px ${s / 2}px,
        ${c2} ${-r}px ${-s / 2}px,
        ${c1} 0 ${-s}px,
        ${c2} ${r}px ${-s / 2}px,
        ${c1} ${r}px ${s / 2}px ${shade};
      background-size: ${4 * r}px ${6 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Semi Circles & Full Circles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 5, 30);
            const accent = addAlpha(color1, "f0");

            const circle = `radial-gradient(${accent} 49%, #0000 50%)`;

            return `
      background:
        ${circle} ${-s / 2}px ${s / 2}px,
        repeating-conic-gradient(from 45deg, ${color2} 0 25%, #0000 0 50%) ${s / 2}px ${s / 2}px,
        ${circle},
        ${circle} ${s}px ${s}px ${color1};
      background-size: ${2 * s}px ${2 * s}px;
      background-color: ${color1};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Diagonal Rectangles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 15, 90);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "cc");

            return `
      background:
        linear-gradient(135deg, #0000 18.75%, ${accent} 0 31.25%, #0000 0),
        repeating-linear-gradient(45deg, ${accent} -6.25%, ${accent} 6.25%, ${shade} 0 18.75%);
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Rhombus & Octagons",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 12, 72);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");

            const stops = `${accent} 15%, ${shade} 0 28%, #0000 0 72%, ${shade} 0 85%, ${accent} 0`;

            return `
      background:
        conic-gradient(from 90deg at 2px 2px, #0000 25%, ${accent} 0) -1px -1px,
        linear-gradient(-45deg, ${stops}),
        linear-gradient(45deg, ${stops}),
        conic-gradient(from 90deg at 40% 40%, ${accent} 25%, ${shade} 0) ${-s / 5}px ${-s / 5}px;
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Pill Shapes",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 3.4, 24);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");
            const pill = `radial-gradient(${s / 2}px, ${accent} 97%, #0000)`;

            return `
      background:
        ${pill},
        ${pill} ${2 * s}px ${2 * s}px,
        repeating-conic-gradient(from 45deg, #0000 0 25%, ${shade} 0 50%) ${-0.707 * s}px ${-0.707 * s}px,
        repeating-linear-gradient(135deg, ${accent} ${-s / 2}px ${s / 2}px, ${shade} 0 ${2.328 * s}px);
      background-size: ${4 * s}px ${4 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Half Circles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 7.1, 42);
            const accent = addAlpha(color1, "f0");

            return `
      background:
        radial-gradient(36% 72% at 25% -50%, ${accent} 98%, #0000) 0 0 / ${2 * s}px ${s}px,
        radial-gradient(36% 72% at 75% 150%, ${accent} 98%, #0000) 0 0 / ${2 * s}px ${s}px,
        radial-gradient(72% 36% at 150% 25%, ${accent} 98%, #0000) 0 0 / ${s}px ${2 * s}px,
        radial-gradient(72% 36% at -50% 75%, ${accent} 98%, #0000) 0 0 / ${s}px ${2 * s}px,
        repeating-conic-gradient(${accent} 0 45deg, ${color2} 0 25%) 0 0 / ${2 * s}px ${2 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Curved Segments",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 6, 36);
            const accent = addAlpha(color1, "f0");

            return `
      background:
        radial-gradient(${s}px at 100%, #0000 ${99 - s / 2}%, ${accent} calc(100% - ${s / 2}px) 99%, #0000),
        radial-gradient(${s / 4}px at 50% ${100 / 3}%, ${accent} calc(100% - ${s / 2}px) 99%, #0000) ${s}px 0,
        radial-gradient(${s}px at 0%, #0000 ${99 - s / 2}%, ${accent} calc(100% - ${s / 2}px) 99%, #0000) 0 ${3 * s}px ${color2};
      background-size:
        ${2 * s}px ${(9 * s) / 4}px,
        ${2 * s}px ${(3 * s) / 4}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Waves",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 3, 24);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");

            return `
      background:
        radial-gradient(37.5% 12.5% at 62.5% 100%, #0000 32%, ${accent} 34% 99%, #0000 101%),
        radial-gradient(37.5% 12.5% at 62.5% 0, #0000 32%, ${accent} 34% 99%, #0000 101%) 0 ${3 * s}px,
        radial-gradient(37.5% 12.5% at 62.5% 100%, #0000 32%, ${shade} 34% 99%, #0000 101%) ${s}px ${3 * s}px,
        radial-gradient(37.5% 12.5% at 62.5% 0, #0000 32%, ${shade} 34% 99%, #0000 101%) ${s}px ${6 * s}px,
        radial-gradient(37.5% 12.5% at 62.5% 100%, #0000 32%, ${accent} 34% 99%, #0000 101%) ${2 * s}px ${6 * s}px,
        radial-gradient(37.5% 12.5% at 62.5% 0, #0000 32%, ${accent} 34% 99%, #0000 101%) ${2 * s}px ${9 * s}px,
        radial-gradient(37.5% 12.5% at 62.5% 100%, #0000 32%, ${shade} 34% 99%, #0000 101%) ${3 * s}px ${9 * s}px,
        radial-gradient(37.5% 12.5% at 62.5% 0, #0000 32%, ${shade} 34% 99%, #0000 101%) ${3 * s}px 0,
        repeating-linear-gradient(${accent} 0 25%, ${shade} 0 50%);
      background-size: ${4 * s}px ${12 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Chevron Stripes",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 6.5, 39);
            const accent = addAlpha(color1, "f0");

            const gap = s / 5;
            const layer = `#0000 calc(33% - 0.866 * ${gap}px), ${accent} calc(33.2% - 0.866 * ${gap}px) 33%, #0000 34%`;

            return `
      background:
        repeating-linear-gradient(${accent} 0 ${gap}px, #0000 0 50%) 0 ${(0.866 * s) - gap / 2}px,
        conic-gradient(from -150deg at ${gap}px 50%, ${accent} 120deg, #0000 0),
        linear-gradient(-120deg, ${layer}),
        linear-gradient(-60deg, ${layer}) ${color2};
      background-size: ${s}px ${3.466 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Arrows",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 60);
            const accent = addAlpha(color1, "f0");

            return `
      background:
        conic-gradient(#0000 75%, ${accent} 0) 0 ${s / 4}px,
        conic-gradient(from 45deg, ${accent} 25%, ${color2} 0);
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Irregular Zig-Zag",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 6.6, 40);
            const accent = addAlpha(color1, "f0");

            const c = `${accent} 25%`;

            return `
      background:
        conic-gradient(from -45deg at 75% 12.5%, ${c}, #0000 0),
        conic-gradient(from 135deg at 25% 87.5%, ${c}, #0000 0) 0 ${s / 2}px,
        conic-gradient(from 180deg at 50% 75%, #0000 62.5%, ${c}),
        conic-gradient(at 50% 25%, #0000 62.5%, ${c}) 0 ${s / 2}px ${color2};
      background-size: ${s}px ${2 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Outline Circles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 22, 110);
            const accent = addAlpha(color1, "f0");
            const base = addAlpha(color2, "f0");
            const ring = `radial-gradient(#0000 60%, ${accent} 61% 63%, #0000 64% 77%, ${accent} 78% 80%, #0000 81%)`;

            return `
      background:
        conic-gradient(at 12% 20%, #0000 75%, ${base} 0) ${0.44 * s}px ${0.9 * s}px,
        conic-gradient(at 12% 20%, #0000 75%, ${base} 0) ${-0.06 * s}px ${0.4 * s}px,
        conic-gradient(at 20% 12%, #0000 75%, ${base} 0) ${0.9 * s}px ${0.44 * s}px,
        conic-gradient(at 20% 12%, #0000 75%, ${base} 0) ${0.4 * s}px ${-0.06 * s}px,
        ${ring},
        ${ring} ${s / 2}px ${s / 2}px ${base};
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Zig-Zag & Rectangles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 60);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");

            const g = `${accent} 3.125%, ${shade} 0 9.375%, ${accent} 0 15.625%, ${shade} 0 21.875%, ${accent} 0 28.125%, #0000 0`;

            return `
      background:
        linear-gradient(225deg, #0000 3.125%, ${shade} 0 9.375%, #0000 0 78.125%, ${shade} 0 84.375%, #0000 0) 0 ${s / 2}px,
        linear-gradient(45deg, ${g}) 0 ${s}px,
        linear-gradient(45deg, ${g}) ${-s / 2}px ${-s / 2}px,
        linear-gradient(225deg, ${g}) ${s}px 0,
        linear-gradient(225deg, ${g}) ${s / 2}px ${s}px,
        repeating-linear-gradient(-45deg, ${accent} -3.125%, ${accent} 3.125%, ${shade} 0 9.375%);
      background-size: ${2 * s}px ${2 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Right Triangles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 7, 42);
            const accent = addAlpha(color1, "f0");

            return `
      background:
        linear-gradient(-45deg, #0000 75%, ${accent} 0),
        linear-gradient(45deg, #0000 75%, ${accent} 0) 0 ${s / 2}px ${color2};
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Thick Wavy Lines",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 5, 30);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");
            const g = `${2 * s}px ${2 * s}px radial-gradient(25% 25%, ${accent} 99%, #0000 101%)`;

            return `
      background:
        0 ${s}px / ${g},
        ${s}px 0 / ${g},
        radial-gradient(50% 50%, ${shade} 97%, #0000) ${s / 2}px ${s / 2}px / ${s}px ${s}px,
        linear-gradient(90deg, ${accent} 50%, ${shade} 0) 0 0 / ${2 * s}px ${2 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Diagonal Wavy Lines",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 60);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");

            const g = `#0000 24%, ${shade} 26% 34%, ${accent} 36% 44%, ${shade} 46% 54%, ${accent} 56% 64%, ${shade} 66% 74%, #0000 76%`;

            return `
      background:
        radial-gradient(100% 100% at 100% 0, ${g}),
        radial-gradient(100% 100% at 0 100%, ${g}),
        radial-gradient(${shade} 14%, ${accent} 16%) ${s / 2}px ${s / 2}px;
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Outline Ovals",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 2.9, 20);
            const accent = addAlpha(color1, "f0");
            const r = 2.414 * s;
            const p = 1.414 * s;
            const g = `#0000 calc(100% - ${s / 3}px - 1px), ${accent} calc(100% - ${s / 3}px) calc(100% - 1px), #0000`;

            return `
      background:
        radial-gradient(${r}px at 0 0, ${g}) ${r}px ${r}px,
        radial-gradient(${s}px at 0 0, ${g}) ${p}px ${p}px,
        radial-gradient(${r}px at 0 100%, ${g}) 0 ${p}px,
        radial-gradient(${s}px at 0 100%, ${g}) ${-s}px ${r}px,
        radial-gradient(${r}px at 100% 0, ${g}) ${p}px 0,
        radial-gradient(${s}px at 100% 0, ${g}) ${r}px ${-s}px,
        radial-gradient(${r}px at 100% 100%, ${g}) ${-s}px ${-s}px,
        radial-gradient(${s}px at 100% 100%, ${g}) ${color2};
      background-size: ${2 * r}px ${2 * r}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Wave & Circles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 16, 96);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");
            const bubble = `${s}px ${s}px radial-gradient(${accent} 17%, ${shade} 18% 35%, #0000 36.5%)`;

            return `
      background:
        ${-s / 4}px ${-s / 4}px / ${bubble},
        ${s / 4}px ${s / 4}px / ${bubble},
        radial-gradient(${shade} 34%, ${accent} 36% 68%, #0000 70%) 0 0 / ${s / 2}px ${s / 2}px,
        repeating-linear-gradient(45deg, ${accent} -12.5%, ${accent} 12.5%, ${shade} 0 37.5%);
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Tetris Style",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 10, 60);
            const accent = addAlpha(color1, "f0");

            return `
      background:
        conic-gradient(at 50% 25%, ${color2} 25%, #0000 0) ${-s / 4}px ${-s / 2}px,
        conic-gradient(at 25% 25%, ${accent} 25%, #0000 0 75%, ${color2} 0) ${s / 4}px ${-s / 4}px,
        conic-gradient(from -90deg at 75% 25%, ${color2} 75%, ${accent} 0);
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Connected Squares",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 16, 96);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");

            return `
      background:
        conic-gradient(at 25% 25%, #0000 75%, ${accent} 0) 0 ${0.75 * s}px,
        conic-gradient(#0000 75%, ${shade} 0) ${-s / 8}px ${0.625 * s}px,
        conic-gradient(at 25% 75%, ${accent} 25%, ${shade} 0);
      background-size: ${s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Honeycomb",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 3.7, 22);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");

            const c = `#0000, ${accent} 0.5deg 119.5deg, #0000 120deg`;
            const g1 = `conic-gradient(from 60deg at 56.25% ${4.25 * s / 6}px, ${c})`;
            const g2 = `conic-gradient(from 180deg at 43.75% ${4.25 * s / 6}px, ${c})`;
            const g3 = `conic-gradient(from -60deg at 50% ${1.75 * s / 12}px, ${c})`;

            return `
      background:
        ${g1}, ${g1} ${s}px ${1.73 * s}px,
        ${g2}, ${g2} ${s}px ${1.73 * s}px,
        ${g3} ${s}px 0,
        ${g3} 0 ${1.73 * s}px ${shade};
      background-size: ${2 * s}px ${3.46 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Hexagons",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 7.6, 45);
            const accent = addAlpha(color1, "f0");

            return `
      background:
        conic-gradient(from 30deg at 80%, ${accent} 60deg, ${color2} 0 120deg, #0000 0),
        conic-gradient(from -30deg, ${color2} 120deg, ${accent} 0 240deg, ${color2} 0 300deg, ${accent} 0)
        ${color2};
      background-size: ${1.5 * s}px ${s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Intersecting Wavy Lines",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 0.6, 6);
            const accent = addAlpha(color1, "f0");

            const g = `#0000 66%, ${accent} 68% 98%, #0000`;

            return `
      background:
        radial-gradient(30% 30% at 0% 30%, ${g}) ${s}px ${9 * s}px,
        radial-gradient(30% 30% at 100% 30%, ${g}) ${s}px ${-s}px,
        radial-gradient(30% 30% at 30% 100%, ${g}) ${10 * s}px 0,
        radial-gradient(30% 30% at 30% 0%, ${g}) ${color2};
      background-size: ${20 * s}px ${20 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Diagonal Lines",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 8.6, 50);
            const accent = addAlpha(color1, "f0");

            const g = `#0000 45%, ${accent} 46% 54%, #0000 55%`;

            return `
      background:
        linear-gradient(60deg, ${g}),
        linear-gradient(-60deg, ${g}) ${color2};
      background-size: ${s}px ${Math.tan((60 * Math.PI) / 180) * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Octagons & Squares",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 2, 20);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");

            const c = `#0000 46.46%, ${accent} 0 53.53%, #0000 0`;
            const d = `${10 * s}px ${10 * s}px`;
            const g = `${d} conic-gradient(at 40% 40%, #0000 75%, ${accent} 0)`;

            return `
      background:
        conic-gradient(at 40% 40%, #0000 75%, ${shade} 0) ${9 * s}px ${9 * s}px / ${5 * s}px ${5 * s}px,
        ${8 * s}px ${8 * s}px / ${g},
        ${3 * s}px ${3 * s}px / ${g},
        linear-gradient(45deg, ${c}) 0 0 / ${d},
        linear-gradient(-45deg, ${c}) 0 0 / ${d} ${color2};
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Outline Triangles",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 11.2, 70);
            const accent = addAlpha(color1, "f0");
            const shade = addAlpha(color2, "f0");
            const g1 = `conic-gradient(from -45deg at 60%, #0000 75%, ${accent} 0)`;
            const g2 = `conic-gradient(from -45deg at 30%, #0000 75%, ${shade} 0)`;

            return `
      background:
        ${g2} ${s / 8}px 0,
        ${g2} ${(5 * s) / 8}px ${s}px,
        ${g1},
        ${g1} ${s / 2}px ${s}px ${shade};
      background-size: ${s}px ${2 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Herringbone",
        style: (scale: number, color1: string, color2: string) => {
            const s = Math.max(scale * 5, 30);
            const accent = addAlpha(color1, "f0");

            const c = `#0000 75%, ${accent} 0`;
            const g1 = `conic-gradient(at 78% 3%, ${c})`;
            const g2 = `conic-gradient(at 3% 78%, ${c})`;

            return `
      background:
        ${g1},
        ${g1} ${s}px ${s}px,
        ${g1} ${2 * s}px ${2 * s}px,
        ${g1} ${3 * s}px ${3 * s}px,
        ${g2} 0 ${3 * s}px,
        ${g2} ${s}px 0,
        ${g2} ${2 * s}px ${s}px,
        ${g2} ${3 * s}px ${2 * s}px ${color2};
      background-size: ${4 * s}px ${4 * s}px;
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
];
