// src/components/organisms/PatternControls.tsx
import React from "react";
import { LabelledColorPicker } from "@/components/molecules";
import { LabelledRange } from "@/components/molecules";
import { ColorSwatch } from "@/components/atoms";
import { patterns } from "@/constants/patterns";
import { parseCSS } from "@/utils/parseCSS";
import { Pattern } from "@/types";

interface Props {
    selectedPattern: Pattern;
    setSelectedPattern: (p: Pattern) => void;
    patternColor1: string;
    setPatternColor1: (c: string) => void;
    patternColor2: string;
    setPatternColor2: (c: string) => void;
    patternScale: number;
    setPatternScale: (n: number) => void;
}

const PatternControls: React.FC<Props> = ({
                                              selectedPattern,
                                              setSelectedPattern,
                                              patternColor1,
                                              setPatternColor1,
                                              patternColor2,
                                              setPatternColor2,
                                              patternScale,
                                              setPatternScale,
                                          }) => (
    <div>
        {/* Farbwahl */}
        <LabelledColorPicker
            label="Pattern Farbe 1"
            value={patternColor1}
            onChange={setPatternColor1}
        />
        <LabelledColorPicker
            label="Pattern Farbe 2"
            value={patternColor2}
            onChange={setPatternColor2}
        />

        {/* Scale */}
        <LabelledRange
            label="Pattern Scale"
            min={10}
            max={25}
            step={0.1}
            value={patternScale}
            onChange={setPatternScale}
        />

        {/* (Optional) Pattern‑Auswahl */}
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Pattern</h2>
        <div className="flex flex-wrap gap-2">
            {patterns.map((p) => (
                <ColorSwatch
                    key={p.name}
                    color="transparent"
                    selected={p.name === selectedPattern.name}
                    onClick={() => setSelectedPattern(p)}
                    styleOverride={parseCSS(p.style, 5, patternColor1, patternColor2)}
                />
            ))}
        </div>
    </div>
);

export default PatternControls;
