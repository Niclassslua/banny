import { sanitizeFileName } from "@/utils/fileName";
import type { WorkspaceState } from "@/types";

export function exportWorkspaceState(state: WorkspaceState): void {
    try {
        const jsonString = JSON.stringify(state, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });

        const textContent = state.textContent.trim() || "preset";
        const sanitized = sanitizeFileName(textContent);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
        const filename = `banny-preset-${sanitized}-${timestamp}.json`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.style.display = "none";
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL after a short delay
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
        console.error("Fehler beim Exportieren des Workspace-States", error);
        throw new Error("Export fehlgeschlagen. Bitte versuche es erneut.");
    }
}

