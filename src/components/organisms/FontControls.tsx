"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Roboto,
    Open_Sans,
    Lato,
    Montserrat,
    Poppins,
    Raleway,
    Playfair_Display,
    Merriweather,
    Ubuntu,
    Dancing_Script,
    Pacifico,
    Cinzel,
    Rubik,
    Oswald,
    Noto_Serif,
    Lobster,
} from "next/font/google";

import {
    FontStyleControls,
    AlignmentControls,
    FontSizeControls,
    FontDropdown,
    ColorPalettePicker,
} from "../molecules";
import { NoWrapToggle } from "../atoms";
import ColorPickerComponent from "@/components/Sidebar/ColorPicker";

import { Style } from "@/types/Style";
import { TextStyles } from "@/types";

import { colors } from "@/constants/colors";

// ───────────────────────────────────────── fonts array
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

const FONTS = [
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

// ───────────────────────────────────────── props
interface FontControlsProps {
    toggleStyle: (s: "bold" | "italic" | "underline" | "strikethrough") => void;
    changeAlignment: (a: "left" | "center" | "right" | "justify") => void;
    changeFontSize: (n: number) => void;
    currentFontSize: number;
    changeTextColor: (c: string) => void;
    changeFontFamily: (f: string) => void;
    noWrap: boolean;
    toggleNoWrap: () => void;
    textStyles: TextStyles;
}

// ───────────────────────────────────────── component
const FontControls: React.FC<FontControlsProps> = ({
    toggleStyle,
    changeAlignment,
    changeFontSize,
    currentFontSize,
    changeTextColor,
    changeFontFamily,
    noWrap,
    toggleNoWrap,
    textStyles,
}) => {
    const [selectedFontSize, setSelectedFontSize] = useState(currentFontSize);
    const [selectedFont, setSelectedFont] = useState(textStyles.fontFamily);
    const [selectedColor, setSelectedColor] = useState(textStyles.textColor);
    const [alignment, setAlignment] = useState(textStyles.alignment);
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

    const setSize = (n: number) => {
        setSelectedFontSize(n);
        changeFontSize(n);
    };

    const setFont = (fontFamily: string) => {
        setSelectedFont(fontFamily);
        changeFontFamily(fontFamily);
    };

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        changeTextColor(color);
    };

    const toggleColorPicker = () => {
        setIsColorPickerVisible((prev) => !prev);
    };

    const handleAlignmentChange = (value: "left" | "center" | "right" | "justify") => {
        setAlignment(value);
        changeAlignment(value);
    };

    const derivedActiveStyles = useMemo<Style[]>(() => {
        const initial: Style[] = [];
        if (textStyles.bold) initial.push("bold");
        if (textStyles.italic) initial.push("italic");
        if (textStyles.underline) initial.push("underline");
        if (textStyles.strikethrough) initial.push("strikethrough");
        return initial;
    }, [textStyles.bold, textStyles.italic, textStyles.underline, textStyles.strikethrough]);

    const [activeStyles, setActiveStyles] = useState<Style[]>(derivedActiveStyles);

    useEffect(() => {
        setActiveStyles(derivedActiveStyles);
    }, [derivedActiveStyles]);

    const handleToggleStyle = (style: Style) => {
        setActiveStyles((prev) =>
            prev.includes(style) ? prev.filter((entry) => entry !== style) : [...prev, style]
        );
        toggleStyle(style);
    };

    useEffect(() => {
        setSelectedFontSize(currentFontSize);
    }, [currentFontSize]);

    useEffect(() => {
        setSelectedFont(textStyles.fontFamily);
    }, [textStyles.fontFamily]);

    useEffect(() => {
        setSelectedColor(textStyles.textColor);
    }, [textStyles.textColor]);

    useEffect(() => {
        setAlignment(textStyles.alignment);
    }, [textStyles.alignment]);

    return (
        <div className="flex flex-col gap-10">
            {/* Stil */}
            <Section title="Schriftstil">
                <FontStyleControls value={activeStyles} toggleStyle={handleToggleStyle} />
            </Section>

            {/* Ausrichtung */}
            <Section title="Ausrichtung">
                <AlignmentControls onChange={handleAlignmentChange} value={alignment} />
            </Section>

            {/* Zeilenumbruch */}
            <Section title="Zeilenumbruch">
                <NoWrapToggle active={!noWrap} onToggle={toggleNoWrap} />
            </Section>

            {/* Größe */}
            <Section title="Schriftgröße">
                <FontSizeControls value={selectedFontSize} onChange={setSize} />
            </Section>

            {/* Font‑Family */}
            <Section title="Schriftart">
                <FontDropdown fonts={FONTS} selectedFontFamily={selectedFont} onFontChange={setFont} />
            </Section>

            {/* Farbe */}
            <Section title="Textfarbe">
                <div className="flex flex-wrap items-center gap-4">
                    <ColorPalettePicker
                        colors={colors}
                        onChange={handleColorChange}
                        selectedColor={selectedColor}
                    />
                    <ColorPickerComponent
                        color={selectedColor}
                        setColor={handleColorChange}
                        darkMode
                        isVisible={isColorPickerVisible}
                        togglePicker={toggleColorPicker}
                    />
                </div>
            </Section>
        </div>
    );
};

export default FontControls;

// ───────────────────────────────────────── small helper
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const noPadding = ["Schriftart", "Textfarbe"].includes(title);

    return (
        <section className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A1E2F8]">
                {title}
            </h2>
            <div className={noPadding ? "" : "pl-4"}>
                {children}
            </div>
        </section>
    );
};