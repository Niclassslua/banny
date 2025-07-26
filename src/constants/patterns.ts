interface Pattern {
    name: string;
    style: (scale: number, color1: string, color2: string) => string;
}

export const patterns: Pattern[] = [
    {
        name: "Wavy",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background-image: repeating-radial-gradient(circle at 0 0, transparent 0, ${color2} ${scale * 10}px), 
                         repeating-linear-gradient(${color1}55, ${color1});`,
    },
    {
        name: "Architect",
        style: (scale: number, color1: string, color2: string) => `
    /* Hintergrundfarbe als Fallback */
    background-color: ${color2};
    /* SVG‑Pattern von HeroPatterns, gefüllt mit color1 */
    background-image: url("https://s2.svgbox.net/heropatterns.svg?ic=architect&fill=${encodeURIComponent(
            color1
        )}") center/ ${scale * 8}px ${scale * 8}px repeat;
  `,
    },

    {
        name: "Architect (Large Tiles)",
        style: (scale: number, color1: string, color2: string) => `
    background-color: ${color2};
    /* Größere Kacheln: skaliert mit scale*16 */
    background-image: url("https://s2.svgbox.net/heropatterns.svg?ic=architect&fill=${encodeURIComponent(
            color1
        )}") center/ ${scale * 16}px ${scale * 16}px repeat;
  `,
    },

    {
        name: "Architect (Subtle)",
        style: (scale: number, color1: string, color2: string) => {
            // Nutze color1 mit niedriger Deckkraft für filigranen Look
            const semi = color1.replace(/^#/, "rgba(") + ",0.2)"; // z.B. "#444CF7" → "rgba(68,76,247,0.2)"
            return `
      background-color: ${color2};
      background-image: url("https://s2.svgbox.net/heropatterns.svg?ic=architect&fill=${encodeURIComponent(
                semi
            )}") center/ ${scale * 12}px ${scale * 12}px repeat;
    `;
        },
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
       background-position: 0 0, ${scale * 10}px ${scale * 10}px; 
       background-size: ${scale * 20}px ${scale * 20}px;`,
    },
    {
        name: "Cross",
        style: (scale: number, color1: string, color2: string) =>
            `background-color: ${color2}; 
       opacity: 1.0; 
       background: radial-gradient(circle, transparent 20%, ${color2} 20%, ${color2} 80%, transparent 80%, transparent), 
                  radial-gradient(circle, transparent 20%, ${color2} 20%, ${color2} 80%, transparent 80%, transparent) ${scale * 25}px ${scale * 25}px, 
                  linear-gradient(${color1} ${scale * 2}px, transparent ${scale * 2}px) 0 -1px, 
                  linear-gradient(90deg, ${color1} ${scale * 2}px, ${color2} ${scale * 2}px) -1px 0; 
       background-size: ${scale * 50}px ${scale * 50}px, ${scale * 50}px ${scale * 50}px, ${scale * 25}px ${scale * 25}px, ${scale * 25}px ${scale * 25}px;`,
    },
];