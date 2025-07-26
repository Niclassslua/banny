import React from "react";

interface PatternControlsProps {
    selectedPattern: any;
    setSelectedPattern: (pattern: any) => void;
    patternColor1: string;
    setPatternColor1: (color: string) => void;
    patternColor2: string;
    setPatternColor2: (color: string) => void;
    patternScale: number;
    setPatternScale: (scale: number) => void;
}

const PatternControls: React.FC<PatternControlsProps> = ({
                                                             selectedPattern,
                                                             setSelectedPattern,
                                                             patternColor1,
                                                             setPatternColor1,
                                                             patternColor2,
                                                             setPatternColor2,
                                                             patternScale,
                                                             setPatternScale,
                                                         }) => {
    return (
        <div>
            <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
                    Pattern Farbe 1
                </label>
                <input
                    type="color"
                    value={patternColor1}
                    onChange={(e) => setPatternColor1(e.target.value)}
                    className="w-full h-12 rounded-md cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
            </div>

            <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
                    Pattern Farbe 2
                </label>
                <input
                    type="color"
                    value={patternColor2}
                    onChange={(e) => setPatternColor2(e.target.value)}
                    className="w-full h-12 rounded-md cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
            </div>

            <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
                    Pattern Scale: {patternScale}px
                </label>
                <input
                    type="range"
                    min="10"
                    max="25"
                    step="0.1"
                    value={patternScale}
                    onChange={(e) => setPatternScale(Number(e.target.value))}
                    className="w-full bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
                />
            </div>
        </div>
    );
};

export default PatternControls;
