// types/index.ts

export interface TextStyles {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    noWrap: boolean;
    fontSize: number;
    alignment: "left" | "center" | "right" | "justify";
    textColor: string;
    fontFamily: string;
}

export interface Pattern {
    name: string;
    style: (scale: number, color1: string, color2: string) => string;
}

export interface SettingsPanelProps {
    patternColor1: string;
    setPatternColor1: (color: string) => void;
    patternColor2: string;
    setPatternColor2: (color: string) => void;
    patternScale: number;
    setPatternScale: (scale: number) => void;
    darkMode: boolean;
    visiblePicker: string | null;
    togglePicker: (pickerId: string) => void;
}