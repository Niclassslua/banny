export function parseCSS(
    styleInput: string | ((scale: number, color1: string, color2: string) => string) | undefined,
    scale: number,
    color1: string,
    color2: string
): React.CSSProperties {
    const styles: { [key: string]: string } = {};
    if (!styleInput) {
        return styles;
    }
    if (typeof styleInput === "function") {
        styleInput = styleInput(scale, color1, color2);
    }
    styleInput.split(";").forEach((style) => {
        const [rawKey, rawValue] = style.split(":").map((s) => s.trim());
        if (!rawKey || !rawValue) {
            return;
        }

        if (rawKey.startsWith("--")) {
            styles[rawKey] = rawValue;
            return;
        }

        const camelCaseKey = rawKey.replace(/-([a-z])/g, (_, char) =>
            char.toUpperCase()
        );

        styles[camelCaseKey] = rawValue;
    });
    return styles;
}