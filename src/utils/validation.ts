import type { TextStyles, WorkspaceState } from "@/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isValidAlignment = (
    value: unknown,
): value is TextStyles["alignment"] =>
    value === "left" ||
    value === "center" ||
    value === "right" ||
    value === "justify";

export const isValidTextStyles = (value: unknown): value is TextStyles => {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.bold === "boolean" &&
        typeof value.italic === "boolean" &&
        typeof value.underline === "boolean" &&
        typeof value.strikethrough === "boolean" &&
        typeof value.noWrap === "boolean" &&
        typeof value.fontSize === "number" &&
        isValidAlignment(value.alignment) &&
        typeof value.textColor === "string" &&
        typeof value.fontFamily === "string"
    );
};

export const isValidWorkspaceState = (value: unknown): value is WorkspaceState => {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.textContent === "string" &&
        isValidTextStyles(value.textStyles) &&
        typeof value.selectedPatternName === "string" &&
        typeof value.patternColor1 === "string" &&
        typeof value.patternColor2 === "string" &&
        typeof value.patternScale === "number"
    );
};

