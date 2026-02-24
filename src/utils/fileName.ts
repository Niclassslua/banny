export function sanitizeFileName(name: string): string {
    const normalized = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "");

    return normalized || "banny-banner";
}

