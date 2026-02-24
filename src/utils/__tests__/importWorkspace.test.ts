import { importWorkspaceState, ImportError } from "@/utils/importWorkspace";
import type { WorkspaceState } from "@/types";

function createFileFromString(name: string, content: string): File {
    return new File([content], name, { type: "application/json" });
}

describe("importWorkspaceState", () => {
    const validState: WorkspaceState = {
        textContent: "Hello",
        textStyles: {
            bold: true,
            italic: false,
            underline: false,
            strikethrough: false,
            noWrap: false,
            fontSize: 42,
            alignment: "center",
            textColor: "#ffffff",
            fontFamily: "Arial, sans-serif",
        },
        selectedPatternName: "Some Pattern",
        patternColor1: "#000000",
        patternColor2: "#ffffff",
        patternScale: 10,
    };

    it("imports a valid workspace state", async () => {
        const file = createFileFromString("valid.json", JSON.stringify(validState));
        const result = await importWorkspaceState(file);

        expect(result).toEqual(validState);
    });

    it("throws ImportError for invalid JSON", async () => {
        const file = createFileFromString("invalid.json", "{ this is not json }");

        await expect(importWorkspaceState(file)).rejects.toBeInstanceOf(ImportError);
    });

    it("throws ImportError for structurally invalid workspace", async () => {
        const invalid = { ...validState, textContent: 123 } as unknown;
        const file = createFileFromString("invalid-structure.json", JSON.stringify(invalid));

        await expect(importWorkspaceState(file)).rejects.toBeInstanceOf(ImportError);
    });
}

