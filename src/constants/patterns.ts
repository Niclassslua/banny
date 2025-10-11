import { Pattern } from "@/types";

export const patterns: Pattern[] = [
    {
        name: "Crimson Depth",
        style: (scale: number, color1: string, color2: string) => {
            const deepAccent = addAlpha(color1, "cc");
            const glow = addAlpha(color1, "55");
            const base = addAlpha(color2, "f0");
            const transitionStop = Math.min(30 + scale * 1.8, 72);
            const glowStop = Math.min(transitionStop + 12, 88);

            return `
      background:
        radial-gradient(125% 125% at 50% 100%, ${deepAccent} ${transitionStop}%, ${glow} ${glowStop}%, ${base} 100%);
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Aurora Dream Corner Whispers",
        style: (scale: number, color1: string, color2: string) => {
            const accentStrong = addAlpha(color1, "80");
            const accentSoft = addAlpha(color1, "40");
            const baseGlow = addAlpha(color2, "75");
            const baseSoft = addAlpha(color2, "55");
            const falloff = Math.min(45 + scale * 1.5, 78);

            return `
      background:
        radial-gradient(ellipse 85% 65% at 8% 8%, ${accentStrong}, transparent ${falloff}%),
        radial-gradient(ellipse 75% 60% at 75% 35%, ${baseGlow}, transparent ${falloff + 4}%),
        radial-gradient(ellipse 70% 60% at 15% 80%, ${accentSoft}, transparent ${falloff + 4}%),
        radial-gradient(ellipse 70% 60% at 92% 92%, ${addAlpha(color1, "33")}, transparent ${falloff + 6}%),
        linear-gradient(180deg, ${baseSoft} 0%, ${color2} 100%);
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Aurora Dream Soft Harmony",
        style: (scale: number, color1: string, color2: string) => {
            const accent = addAlpha(color1, "70");
            const accentSoft = addAlpha(color1, "45");
            const glow = addAlpha(color2, "70");
            const haze = addAlpha(color2, "4d");
            const falloff = Math.min(50 + scale * 1.4, 82);

            return `
      background:
        radial-gradient(ellipse 80% 60% at 60% 20%, ${accent}, transparent ${falloff}%),
        radial-gradient(ellipse 70% 60% at 20% 80%, ${accentSoft}, transparent ${falloff}%),
        radial-gradient(ellipse 60% 50% at 60% 65%, ${glow}, transparent ${falloff + 2}%),
        radial-gradient(ellipse 65% 40% at 50% 60%, ${haze}, transparent ${falloff + 6}%),
        linear-gradient(180deg, ${addAlpha(color2, "f0")} 0%, ${color2} 100%);
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Aurora Dream Vivid Bloom",
        style: (scale: number, color1: string, color2: string) => {
            const vibrant = addAlpha(color1, "d0");
            const bold = addAlpha(color1, "a0");
            const highlight = addAlpha(color2, "d0");
            const glow = addAlpha(color2, "60");
            const falloff = Math.max(58 - scale * 0.8, 42);

            return `
      background:
        radial-gradient(ellipse 80% 60% at 70% 20%, ${vibrant}, transparent ${falloff + 8}%),
        radial-gradient(ellipse 70% 60% at 20% 80%, ${bold}, transparent ${falloff + 10}%),
        radial-gradient(ellipse 60% 50% at 60% 65%, ${highlight}, transparent ${falloff + 10}%),
        radial-gradient(ellipse 65% 40% at 50% 60%, ${glow}, transparent ${falloff + 14}%),
        linear-gradient(180deg, ${addAlpha(color2, "f5")} 0%, ${color2} 100%);
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Diagonal Grid with Light",
        style: (scale: number, color1: string, color2: string) => {
            const cell = Math.max(scale * 3, 18);
            const stroke = Math.max(cell * 0.04, 1.2);
            const line = addAlpha(color1, "38");
            const glow = addAlpha(color1, "18");
            const largeCell = cell * 2;

            return `
      background-color: ${color2};
      background-image:
        radial-gradient(circle at 0 0, ${glow} 0, transparent ${cell * 1.2}px),
        repeating-linear-gradient(45deg, ${line} 0 ${stroke}px, transparent ${stroke}px ${cell}px),
        repeating-linear-gradient(-45deg, ${line} 0 ${stroke}px, transparent ${stroke}px ${cell}px);
      background-size: ${largeCell}px ${largeCell}px, ${cell}px ${cell}px, ${cell}px ${cell}px;
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Dark Grid with White Dots",
        style: (scale: number, color1: string, color2: string) => {
            const cell = Math.max(scale * 2.2, 18);
            const dot = Math.max(cell * 0.1, 2.5);
            const grid = addAlpha(color1, "26");
            const dotColor = addAlpha(color1, "b0");
            const halfCell = cell / 2;

            return `
      background: ${color2};
      background-image:
        linear-gradient(to right, ${grid} 1px, transparent 1px),
        linear-gradient(to bottom, ${grid} 1px, transparent 1px),
        radial-gradient(circle, ${dotColor} ${dot}px, transparent ${dot + 0.5}px);
      background-size: ${cell}px ${cell}px, ${cell}px ${cell}px, ${cell}px ${cell}px;
      background-position: 0 0, 0 0, ${halfCell}px ${halfCell}px;
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Gradient Diagonal Lines",
        style: (scale: number, color1: string, color2: string) => {
            const spacing = Math.max(scale * 1.8, 12);
            const lineWidth = Math.max(spacing * 0.08, 1);
            const accent = addAlpha(color1, "33");
            const accentSoft = addAlpha(color1, "1a");
            const accentGlow = addAlpha(color1, "12");
            const minorSpacing = Math.max(spacing * 0.35, 6);
            const tile = Math.max(spacing * 0.5, 10);

            return `
      background-color: ${color2};
      background-image:
        repeating-linear-gradient(45deg, ${accent} 0 ${lineWidth}px, transparent ${lineWidth}px ${spacing}px),
        repeating-linear-gradient(-45deg, ${accentSoft} 0 ${lineWidth}px, transparent ${lineWidth}px ${spacing}px),
        repeating-linear-gradient(90deg, ${accentGlow} 0 ${lineWidth}px, transparent ${lineWidth}px ${minorSpacing}px);
      background-size: ${spacing}px ${spacing}px, ${spacing}px ${spacing}px, ${tile}px ${tile}px;
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Dark Noise Colors",
        style: (scale: number, color1: string, color2: string) => {
            const accentStrong = addAlpha(color1, "33");
            const accentMedium = addAlpha(color1, "26");
            const accentLight = addAlpha(color1, "1f");
            const size1 = Math.max(scale * 1.6, 14);
            const size2 = Math.max(scale * 2.4, 18);
            const size3 = Math.max(scale * 2, 16);
            const offset1 = size1 / 2;
            const offset2x = size1 * 0.75;
            const offset2y = size1 * 0.25;

            return `
      background: ${color2};
      background-image:
        radial-gradient(circle at 1px 1px, ${accentStrong} 1px, transparent 0),
        radial-gradient(circle at 1px 1px, ${accentMedium} 1px, transparent 0),
        radial-gradient(circle at 1px 1px, ${accentLight} 1px, transparent 0);
      background-size: ${size1}px ${size1}px, ${size2}px ${size2}px, ${size3}px ${size3}px;
      background-position: 0 0, ${offset1}px ${offset1}px, ${offset2x}px ${offset2y}px;
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Top Glow Midnight",
        style: (scale: number, color1: string, color2: string) => {
            const glow = addAlpha(color1, "55");
            const halo = addAlpha(color1, "22");
            const fade = Math.min(40 + scale * 2.2, 95);

            return `
      background: radial-gradient(ellipse 80% 60% at 50% 0%, ${glow}, ${halo} ${fade}%, transparent 100%), ${color2};
      background-color: ${color2};
      opacity: 1.0;
    `;
        },
    },
    {
        name: "Radial Cross",
        style: (scale: number, color1: string, color2: string) => {
            const tile = Math.max(scale * 6, 48); // tile size reagiert direkt auf Slider
            const arm = tile / 4.667;
            const offset = tile / 2;
            const accent = addAlpha(color1, "d0");
            const accentSoft = addAlpha(color1, "9a");
            const halo = addAlpha(color1, "22");

            return `
      background:
        radial-gradient(farthest-side at -33.33% 50%, #0000 52%, ${accent} 54% 57%, #0000 59%) 0 ${offset}px / ${arm}px ${tile}px,
        radial-gradient(farthest-side at 50% 133.33%, #0000 52%, ${accent} 54% 57%, #0000 59%) ${offset}px 0 / ${tile}px ${arm}px,
        radial-gradient(farthest-side at 133.33% 50%, #0000 52%, ${accentSoft} 54% 57%, #0000 59%) / ${arm}px ${tile}px,
        radial-gradient(farthest-side at 50% -33.33%, #0000 52%, ${accentSoft} 54% 57%, #0000 59%) / ${tile}px ${arm}px,
        radial-gradient(circle at 50% 50%, ${halo} 0, transparent 70%) ${offset}px ${offset}px / ${tile}px ${tile}px,
        radial-gradient(circle at 50% 50%, ${halo} 0, transparent 70%) / ${tile}px ${tile}px,
        ${color2};
      background-color: ${color2};
      background-repeat: repeat;
      opacity: 1.0;
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
];
