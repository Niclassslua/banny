"use client";

import React, { useState } from "react";
import {
    Roboto, Open_Sans, Lato, Montserrat, Poppins, Raleway, Playfair_Display,
    Merriweather, Ubuntu, Dancing_Script, Pacifico, Cinzel, Rubik, Oswald,
    Noto_Serif, Lobster
} from "next/font/google";

import { FontStyleControls, AlignmentControls, FontSizeControls, FontDropdown, ColorPalettePicker } from "../molecules";
import { NoWrapToggle } from "../atoms";

import { Style } from "@/types/Style";

import { colors } from "@/constants/colors";

// ───────────────────────────────────────── fonts array
const roboto          = Roboto({ subsets: ["latin"], weight: ["400","700"] });
const openSans        = Open_Sans({ subsets: ["latin"], weight: ["400","700"] });
const lato            = Lato({ subsets: ["latin"], weight: ["400","700"] });
const montserrat      = Montserrat({ subsets: ["latin"], weight: ["400","700"] });
const poppins         = Poppins({ subsets: ["latin"], weight: ["400","700"] });
const raleway         = Raleway({ subsets: ["latin"], weight: ["400","700"] });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400","700"] });
const merriweather    = Merriweather({ subsets: ["latin"], weight: ["400","700"] });
const ubuntu          = Ubuntu({ subsets: ["latin"], weight: ["400","700"] });
const dancingScript   = Dancing_Script({ subsets: ["latin"], weight: ["400","700"] });
const pacifico        = Pacifico({ subsets: ["latin"], weight: "400" });
const cinzel          = Cinzel({ subsets: ["latin"], weight: ["400","700"] });
const rubik           = Rubik({ subsets: ["latin"], weight: ["400","700"] });
const oswald          = Oswald({ subsets: ["latin"], weight: ["400","700"] });
const notoSerif       = Noto_Serif({ subsets: ["latin"], weight: ["400","700"] });
const lobster         = Lobster({ subsets: ["latin"], weight: "400" });

const FONTS = [
    { name: "Roboto",           style: roboto.style.fontFamily,          className: roboto.className },
    { name: "Open Sans",        style: openSans.style.fontFamily,        className: openSans.className },
    { name: "Lato",             style: lato.style.fontFamily,            className: lato.className },
    { name: "Montserrat",       style: montserrat.style.fontFamily,      className: montserrat.className },
    { name: "Poppins",          style: poppins.style.fontFamily,         className: poppins.className },
    { name: "Raleway",          style: raleway.style.fontFamily,         className: raleway.className },
    { name: "Playfair Display", style: playfairDisplay.style.fontFamily, className: playfairDisplay.className },
    { name: "Merriweather",     style: merriweather.style.fontFamily,    className: merriweather.className },
    { name: "Ubuntu",           style: ubuntu.style.fontFamily,          className: ubuntu.className },
    { name: "Dancing Script",   style: dancingScript.style.fontFamily,   className: dancingScript.className },
    { name: "Pacifico",         style: pacifico.style.fontFamily,        className: pacifico.className },
    { name: "Cinzel",           style: cinzel.style.fontFamily,          className: cinzel.className },
    { name: "Rubik",            style: rubik.style.fontFamily,           className: rubik.className },
    { name: "Oswald",           style: oswald.style.fontFamily,          className: oswald.className },
    { name: "Noto Serif",       style: notoSerif.style.fontFamily,       className: notoSerif.className },
    { name: "Lobster",          style: lobster.style.fontFamily,         className: lobster.className },
];

// ───────────────────────────────────────── props
interface FontControlsProps {
    toggleStyle:     (s:"bold"|"italic"|"underline"|"strikethrough")=>void;
    changeAlignment: (a:"left"|"center"|"right"|"justify")=>void;
    changeFontSize:  (n:number)=>void;
    currentFontSize: number;
    changeTextColor: (c:string)=>void;
    changeFontFamily:(f:string)=>void;
    noWrap:          boolean;
    toggleNoWrap:    () => void;
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
                                                   }) => {
    const [selectedFontSize,  setSelectedFontSize]  = useState(currentFontSize);
    const [selectedFont,      setSelectedFont]      = useState("Arial");

    const setSize  = (n:number) => { setSelectedFontSize(n); changeFontSize(n); };
    const setFont  = (f:string) => { setSelectedFont(f);    changeFontFamily(f); };

    const [activeStyles, setActiveStyles] = useState<Style[]>([]);

    const handleToggleStyle = (s: Style) => {
        setActiveStyles(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );

        toggleStyle(s);
    };

    return (
        <div>
            {/* Stil */}
            <Section title="Schriftstil">
                <FontStyleControls value={activeStyles} toggleStyle={handleToggleStyle}/>
            </Section>

            {/* Ausrichtung */}
            <Section title="Ausrichtung">
                <AlignmentControls onChange={changeAlignment}/>
            </Section>

            {/* Zeilenumbruch */}
            <Section title="Zeilenumbruch">
                <NoWrapToggle active={!noWrap} onToggle={toggleNoWrap}/>
            </Section>

            {/* Größe */}
            <Section title="Schriftgröße">
                <FontSizeControls value={selectedFontSize} onChange={setSize}/>
            </Section>

            {/* Font‑Family */}
            <Section title="Schriftart">
                <FontDropdown fonts={FONTS} selectedFontFamily={selectedFont} onFontChange={setFont}/>
            </Section>

            {/* Farbe */}
            <Section title="Textfarbe">
                <ColorPalettePicker colors={colors} onChange={changeTextColor}/>
            </Section>
        </div>
    );
};

export default FontControls;

// ───────────────────────────────────────── small helper
const Section:React.FC<{title:string,children:React.ReactNode}> = ({title,children}) => (
    <>
        <h2 className="text-lg font-semibold my-4 text-gray-800 dark:text-gray-200">{title}</h2>
        {children}
    </>
);
