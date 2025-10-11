import type { CSSProperties } from "react";

const COLOR_REGEX =
    /^(#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\([^)]*\)|hsla?\([^)]*\)|hwb\([^)]*\)|lab\([^)]*\)|lch\([^)]*\)|oklab\([^)]*\)|oklch\([^)]*\)|color\([^)]*\)|transparent|inherit|currentColor)$/i;

function splitTopLevelComma(value: string): string[] {
    const parts: string[] = [];
    let buffer = "";
    let depth = 0;

    for (let i = 0; i < value.length; i += 1) {
        const char = value[i];

        if (char === "(") {
            depth += 1;
            buffer += char;
            continue;
        }

        if (char === ")") {
            depth = Math.max(depth - 1, 0);
            buffer += char;
            continue;
        }

        if (char === "," && depth === 0) {
            parts.push(buffer.trim());
            buffer = "";
            continue;
        }

        buffer += char;
    }

    const trimmed = buffer.trim();
    if (trimmed) {
        parts.push(trimmed);
    }

    return parts;
}

function isColor(value: string): boolean {
    return COLOR_REGEX.test(value.trim());
}

export function parseCSS(
    styleInput: string | ((scale: number, color1: string, color2: string) => string) | undefined,
    scale: number,
    color1: string,
    color2: string,
): CSSProperties {
    const styles: CSSProperties = {};

    if (!styleInput) {
        return styles;
    }

    const resolvedStyle =
        typeof styleInput === "function"
            ? styleInput(scale, color1, color2)
            : styleInput;

    const sanitizedInput = resolvedStyle.replace(/\/\*[\s\S]*?\*\//g, "");

    sanitizedInput
        .split(";")
        .map((style) => style.trim())
        .filter(Boolean)
        .forEach((style) => {
            const [key, ...rest] = style.split(":");
            if (!key || rest.length === 0) {
                return;
            }

            const value = rest.join(":").trim();
            if (!value) {
                return;
            }

            const camelCaseKey = key
                .trim()
                .replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());

            if (camelCaseKey === "background") {
                const layers = splitTopLevelComma(value);

                if (layers.length === 0) {
                    return;
                }

                if (layers.length === 1) {
                    const [layer] = layers;
                    if (layer === "none") {
                        styles.backgroundImage = "none";
                        styles.backgroundColor = "transparent";
                        return;
                    }

                    if (isColor(layer)) {
                        styles.backgroundColor = layer;
                    } else {
                        styles.backgroundImage = layer;
                    }
                    return;
                }

                const lastLayer = layers[layers.length - 1];
                if (isColor(lastLayer)) {
                    styles.backgroundColor = lastLayer;
                    const imageLayers = layers.slice(0, -1).join(", ");
                    if (imageLayers.trim()) {
                        styles.backgroundImage = imageLayers;
                    }
                } else {
                    styles.backgroundImage = layers.join(", ");
                }

                return;
            }

            styles[camelCaseKey] = value;
        });

    return styles;
}
