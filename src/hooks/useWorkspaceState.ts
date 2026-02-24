"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import type { Pattern, TextStyles, WorkspaceState } from "@/types";
import { patterns } from "@/constants/patterns";
import { isValidWorkspaceState } from "@/utils/validation";

const STORAGE_KEY = "BANNY_WORKSPACE_STATE";
const WORKSPACE_PERSIST_DELAY = 300;

const DEFAULT_TEXT_CONTENT = "Text";

const DEFAULT_TEXT_STYLES: TextStyles = {
    bold: true,
    italic: false,
    underline: false,
    strikethrough: false,
    noWrap: false,
    fontSize: 72,
    alignment: "center",
    textColor: "#FFFFFF",
    fontFamily: "Arial, sans-serif",
};

const DEFAULT_PATTERN: Pattern =
    patterns[0] ?? { name: "Default Pattern", category: "geometric" };

const DEFAULT_PATTERN_COLOR_1 = "#131313";
const DEFAULT_PATTERN_COLOR_2 = "#b3b3c4";
const DEFAULT_PATTERN_SCALE = 14;

type UseWorkspaceStateResult = {
    textContent: string;
    setTextContent: (value: string) => void;
    textStyles: TextStyles;
    setTextStyles: Dispatch<SetStateAction<TextStyles>>;
    selectedPattern: Pattern;
    setSelectedPattern: (pattern: Pattern) => void;
    patternColor1: string;
    setPatternColor1: (color: string) => void;
    patternColor2: string;
    setPatternColor2: (color: string) => void;
    patternScale: number;
    setPatternScale: (scale: number) => void;
    hasHydrated: boolean;
    resetWorkspace: () => void;
    applyImportedState: (state: WorkspaceState) => void;
};

export function useWorkspaceState(): UseWorkspaceStateResult {
    const [textContent, setTextContent] = useState(DEFAULT_TEXT_CONTENT);
    const [textStyles, setTextStyles] = useState<TextStyles>({
        ...DEFAULT_TEXT_STYLES,
    });

    const [selectedPatternName, setSelectedPatternName] = useState<string>(
        DEFAULT_PATTERN.name,
    );

    const [patternColor1, setPatternColor1] = useState(DEFAULT_PATTERN_COLOR_1);
    const [patternColor2, setPatternColor2] = useState(DEFAULT_PATTERN_COLOR_2);
    const [patternScale, setPatternScale] = useState(DEFAULT_PATTERN_SCALE);

    const [hasHydrated, setHasHydrated] = useState(false);
    const skipNextPersistRef = useRef(false);

    const selectedPattern = useMemo<Pattern>(() => {
        return (
            patterns.find((pattern) => pattern.name === selectedPatternName) ??
            DEFAULT_PATTERN
        );
    }, [selectedPatternName]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const storedState = window.localStorage.getItem(STORAGE_KEY);

        if (storedState) {
            try {
                const parsedState: unknown = JSON.parse(storedState);

                if (isValidWorkspaceState(parsedState)) {
                    setTextContent(parsedState.textContent);
                    setTextStyles({ ...parsedState.textStyles });
                    setSelectedPatternName(parsedState.selectedPatternName);
                    setPatternColor1(parsedState.patternColor1);
                    setPatternColor2(parsedState.patternColor2);
                    setPatternScale(parsedState.patternScale);
                }
            } catch (error) {
                console.error("Fehler beim Laden des Workspace-States", error);
            }
        }

        setHasHydrated(true);
    }, []);

    useEffect(() => {
        if (
            !hasHydrated ||
            typeof window === "undefined" ||
            skipNextPersistRef.current
        ) {
            if (skipNextPersistRef.current) {
                skipNextPersistRef.current = false;
            }
            return;
        }

        const timeoutId = window.setTimeout(() => {
            const stateToPersist: WorkspaceState = {
                textContent,
                textStyles: { ...textStyles },
                selectedPatternName: selectedPattern.name,
                patternColor1,
                patternColor2,
                patternScale,
            };

            try {
                window.localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(stateToPersist),
                );
            } catch (error) {
                console.error("Fehler beim Speichern des Workspace-States", error);
            }
        }, WORKSPACE_PERSIST_DELAY);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [
        hasHydrated,
        textContent,
        textStyles,
        selectedPattern.name,
        patternColor1,
        patternColor2,
        patternScale,
    ]);

    const resetWorkspace = () => {
        if (typeof window !== "undefined") {
            window.localStorage.removeItem(STORAGE_KEY);
        }

        skipNextPersistRef.current = true;

        setTextContent(DEFAULT_TEXT_CONTENT);
        setTextStyles({ ...DEFAULT_TEXT_STYLES });
        setSelectedPatternName(DEFAULT_PATTERN.name);
        setPatternColor1(DEFAULT_PATTERN_COLOR_1);
        setPatternColor2(DEFAULT_PATTERN_COLOR_2);
        setPatternScale(DEFAULT_PATTERN_SCALE);
    };

    const applyImportedState = (state: WorkspaceState) => {
        const importedPattern =
            patterns.find((pattern) => pattern.name === state.selectedPatternName) ??
            DEFAULT_PATTERN;

        skipNextPersistRef.current = true;

        setTextContent(state.textContent);
        setTextStyles({ ...state.textStyles });
        setSelectedPatternName(importedPattern.name);
        setPatternColor1(state.patternColor1);
        setPatternColor2(state.patternColor2);
        setPatternScale(state.patternScale);
    };

    const setSelectedPattern = (pattern: Pattern) => {
        setSelectedPatternName(pattern.name);
    };

    return {
        textContent,
        setTextContent,
        textStyles,
        setTextStyles,
        selectedPattern,
        setSelectedPattern,
        patternColor1,
        setPatternColor1,
        patternColor2,
        setPatternColor2,
        patternScale,
        setPatternScale,
        hasHydrated,
        resetWorkspace,
        applyImportedState,
    };
}

