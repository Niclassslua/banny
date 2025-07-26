// components/Preview/FontControls.tsx
import React, { useState } from "react";
import {
    MdFormatBold,
    MdFormatItalic,
    MdFormatUnderlined,
    MdStrikethroughS,
    MdAlignHorizontalLeft,
    MdAlignHorizontalCenter,
    MdAlignHorizontalRight,
    MdFormatAlignJustify,
    MdColorize,
    MdWrapText
} from "react-icons/md";

import { Roboto, Open_Sans, Lato, Montserrat, Poppins, Raleway, Playfair_Display, Merriweather, Ubuntu, Dancing_Script, Pacifico, Cinzel, Rubik, Oswald, Noto_Serif, Lobster } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400", "700"] });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });
const raleway = Raleway({ subsets: ["latin"], weight: ["400", "700"] });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"] });
const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["400", "700"] });
const dancingScript = Dancing_Script({ subsets: ["latin"], weight: ["400", "700"] });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"] });
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "700"] });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"] });
const lobster = Lobster({ subsets: ["latin"], weight: "400" });

interface FontControlsProps {
    toggleStyle: (style: "bold" | "italic" | "underline" | "strikethrough") => void;
    changeAlignment: (alignment: "left" | "center" | "right" | "justify") => void;
    changeFontSize: (size: number) => void;
    currentFontSize: number;
    changeTextColor: (color: string) => void;
    changeFontFamily: (font: string) => void;
    noWrap: boolean;            // ← new
    toggleNoWrap: () => void;   // ← new
}

const fonts = [
    { name: "Roboto", style: roboto.style.fontFamily, className: roboto.className },
    { name: "Open Sans", style: openSans.style.fontFamily, className: openSans.className },
    { name: "Lato", style: lato.style.fontFamily, className: lato.className },
    { name: "Montserrat", style: montserrat.style.fontFamily, className: montserrat.className },
    { name: "Poppins", style: poppins.style.fontFamily, className: poppins.className },
    { name: "Raleway", style: raleway.style.fontFamily, className: raleway.className },
    { name: "Playfair Display", style: playfairDisplay.style.fontFamily, className: playfairDisplay.className },
    { name: "Merriweather", style: merriweather.style.fontFamily, className: merriweather.className },
    { name: "Ubuntu", style: ubuntu.style.fontFamily, className: ubuntu.className },
    { name: "Dancing Script", style: dancingScript.style.fontFamily, className: dancingScript.className },
    { name: "Pacifico", style: pacifico.style.fontFamily, className: pacifico.className },
    { name: "Cinzel", style: cinzel.style.fontFamily, className: cinzel.className },
    { name: "Rubik", style: rubik.style.fontFamily, className: rubik.className },
    { name: "Oswald", style: oswald.style.fontFamily, className: oswald.className },
    { name: "Noto Serif", style: notoSerif.style.fontFamily, className: notoSerif.className },
    { name: "Lobster", style: lobster.style.fontFamily, className: lobster.className },
];

const CustomFontDropdown: React.FC<{
    fonts: typeof fonts;
    selectedFontFamily: string;
    onFontChange: (font: string) => void;
}> = ({ fonts, selectedFontFamily, onFontChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                className="w-full p-2 border-2 border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-left"
                onClick={() => setIsOpen((prev) => !prev)}
                style={{ fontFamily: selectedFontFamily }}
            >
                {selectedFontFamily || "Select a Font"}
            </button>
            {isOpen && (
                <div
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg overflow-y-auto"
                    style={{ maxHeight: "200px" }}
                >
                    {fonts.map((font) => (
                        <div
                            key={font.name}
                            className={`p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${font.className}`}
                            onClick={() => {
                                onFontChange(font.style);
                                setIsOpen(false);
                            }}
                        >
                            {font.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const FontControls: React.FC<FontControlsProps> = ({
                                                       toggleStyle,
                                                       changeAlignment,
                                                       changeFontSize,
                                                       currentFontSize,
                                                       changeTextColor,
                                                       changeFontFamily,
                                                       noWrap,
                                                       toggleNoWrap,
                                                   }) => {
    const predefinedSizes = [16, 20, 24, 32, 46, 64, 72, 96, 128, 144, 192, 256];
    const colorPalette = [
        "#FF6F61", // Coral
        "#6B5B95", // Purple Haze
        "#88B04B", // Moss Green
        "#F7CAC9", // Rose Quartz
        "#92A8D1", // Serenity Blue
        "#955251", // Marsala
        "#B565A7", // Orchid
        "#009B77", // Teal Green
        "#FFD662", // Mimosa Yellow
        "#D65076", // Cranberry
        "#45B8AC", // Aqua Sky
        "#EFC050", // Buttercup
        "#5B5EA6", // Amethyst
        "#9B2335", // Scarlet
        "#DFCFBE", // Sand
        "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#000000", "#FFFFFF"
    ];

    const [selectedFontSize, setSelectedFontSize] = useState(currentFontSize);
    const [selectedFontFamily, setSelectedFontFamily] = useState("Arial");

    const handleFontSizeChange = (size: number) => {
        setSelectedFontSize(size);
        changeFontSize(size);
    };

    const handleFontFamilyChange = (font: string) => {
        setSelectedFontFamily(font);
        changeFontFamily(font);
    };

    return (
        <div>
            {/* Schriftstil */}
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Schriftstil</h2>
            <div className="flex gap-2 mb-6">
                <button
                    className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => toggleStyle("bold")}
                >
                    <MdFormatBold className="text-xl"/>
                </button>
                <button
                    className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => toggleStyle("italic")}
                >
                    <MdFormatItalic className="text-xl"/>
                </button>
                <button
                    className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => toggleStyle("underline")}
                >
                    <MdFormatUnderlined className="text-xl"/>
                </button>
                <button
                    className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => toggleStyle("strikethrough")}
                >
                    <MdStrikethroughS className="text-xl"/>
                </button>
            </div>

            {/* Textausrichtung */}
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Ausrichtung</h2>
            <div className="flex gap-2 mb-6">
                <button
                    className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => changeAlignment("left")}
                >
                    <MdAlignHorizontalLeft className="text-xl"/>
                </button>
                <button
                    className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => changeAlignment("center")}
                >
                    <MdAlignHorizontalCenter className="text-xl"/>
                </button>
                <button
                    className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => changeAlignment("right")}
                >
                    <MdAlignHorizontalRight className="text-xl"/>
                </button>
                <button
                    className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => changeAlignment("justify")}
                >
                    <MdFormatAlignJustify className="text-xl"/>
                </button>
            </div>

            {/* Textausrichtung */}
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Zeilenumbruch</h2>
            <div className="flex gap-2 mb-6">
                <button
                    className={`p-3 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600 ${
                        noWrap ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    onClick={toggleNoWrap}
                    title="Kein Zeilenumbruch"
                >
                    <MdWrapText className="text-xl"/>
                </button>
            </div>

            {/* Schriftgröße */}
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Schriftgröße</h2>
            <div className="flex flex-wrap gap-2 mb-4">
                {predefinedSizes.map((size) => (
                    <button
                        key={size}
                        className={`w-14 h-10 flex items-center justify-center rounded-md shadow ${
                            selectedFontSize === size
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        } hover:bg-indigo-500 dark:hover:bg-indigo-500`}
                        onClick={() => handleFontSizeChange(size)}
                    >
                        {size}
                    </button>
                ))}
            </div>

            <div className="relative">
                <input
                    type="range"
                    min="16"
                    max="256"
                    step="1"
                    value={selectedFontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="w-full bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
                />
                <div
                    className="absolute top-full left-0 w-full flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>16</span>
                    <span>64</span>
                    <span>128</span>
                    <span>192</span>
                    <span>256</span>
                </div>
            </div>

            {/* Schriftart */}
            <h2 className="text-lg font-semibold mt-6 mb-4 text-gray-800 dark:text-gray-200">Schriftart</h2>
            <CustomFontDropdown
                fonts={fonts}
                selectedFontFamily={selectedFontFamily}
                onFontChange={handleFontFamilyChange}
            />

            {/* Textfarbe */}
            <h2 className="text-lg font-semibold mt-6 mb-4 text-gray-800 dark:text-gray-200">Textfarbe</h2>
            <div className="flex gap-2 flex-wrap">
                {colorPalette.map((color) => (
                    <div
                        key={color}
                        className="w-8 h-8 rounded-full cursor-pointer border-2"
                        style={{
                            backgroundColor: color,
                            border: color === "#FFFFFF" ? "1px solid #ccc" : "none",
                        }}
                        onClick={() => changeTextColor(color)}
                    />
                ))}
                <label className="relative cursor-pointer">
                    <MdColorize className="w-8 h-8 text-gray-800 dark:text-gray-200"/>
                    <input
                        type="color"
                        onChange={(e) => changeTextColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </label>
            </div>
        </div>
    );
};

export default FontControls;