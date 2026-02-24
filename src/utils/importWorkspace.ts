import type { WorkspaceState } from "@/types";
import { isValidWorkspaceState } from "@/utils/validation";

export class ImportError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ImportError";
    }
}

export async function importWorkspaceState(file: File): Promise<WorkspaceState> {
    try {
        // Read file as text
        const text = await file.text();
        
        // Parse JSON
        let parsed: unknown;
        try {
            parsed = JSON.parse(text);
        } catch {
            throw new ImportError("Die Datei ist kein gültiges JSON-Format.");
        }
        
        // Validate structure
        if (!isValidWorkspaceState(parsed)) {
            throw new ImportError(
                "Die Datei enthält keine gültigen Workspace-Daten. " +
                "Bitte stelle sicher, dass alle erforderlichen Felder vorhanden sind."
            );
        }
        
        return parsed;
    } catch (error) {
        if (error instanceof ImportError) {
            throw error;
        }
        
        // Handle file read errors
        if (error instanceof Error) {
            throw new ImportError(`Fehler beim Lesen der Datei: ${error.message}`);
        }
        
        throw new ImportError("Ein unbekannter Fehler ist beim Importieren aufgetreten.");
    }
}

