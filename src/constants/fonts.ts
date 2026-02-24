import {
    Amatic_SC,
    Anton,
    Archivo_Black,
    Atkinson_Hyperlegible,
    Black_Han_Sans,
    Bungee,
    Cabin,
    Chango,
    Cormorant_Garamond,
    Figtree,
    Gloria_Hallelujah,
    IBM_Plex_Mono,
    Indie_Flower,
    JetBrains_Mono,
    Lusitana,
    Manrope,
    Monoton,
    Prata,
    Rubik_Mono_One,
    Shadows_Into_Light,
    Space_Mono,
    Spectral,
    Staatliches,
    Unica_One,
    Work_Sans,
    Yellowtail,
    Zilla_Slab,
} from "next/font/google";

export type FontCategory = "Sans Serif" | "Serif" | "Display" | "Handwritten" | "Monospace";

export interface FontOption {
    name: string;
    style: string;
    className: string;
    category: FontCategory;
}

const atkinsonHyperlegible = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"] });
const cabin = Cabin({ subsets: ["latin"], weight: ["400", "700"] });
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "700"] });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "700"] });
const workSans = Work_Sans({ subsets: ["latin"], weight: ["400", "700"] });

const cormorantGaramond = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "700"] });
const lusitana = Lusitana({ subsets: ["latin"], weight: ["400", "700"] });
const prata = Prata({ subsets: ["latin"], weight: "400" });
const spectral = Spectral({ subsets: ["latin"], weight: ["400", "700"] });
const zillaSlab = Zilla_Slab({ subsets: ["latin"], weight: ["400", "700"] });

const bungee = Bungee({ subsets: ["latin"], weight: "400" });
const anton = Anton({ subsets: ["latin"], weight: "400" });
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400" });
const blackHanSans = Black_Han_Sans({ subsets: ["latin"], weight: "400" });
const chango = Chango({ subsets: ["latin"], weight: "400" });
const monoton = Monoton({ subsets: ["latin"], weight: "400" });
const staatliches = Staatliches({ subsets: ["latin"], weight: "400" });
const unicaOne = Unica_One({ subsets: ["latin"], weight: "400" });
const rubikMonoOne = Rubik_Mono_One({ subsets: ["latin"], weight: "400" });

const amaticSC = Amatic_SC({ subsets: ["latin"], weight: ["400", "700"] });
const gloriaHallelujah = Gloria_Hallelujah({ subsets: ["latin"], weight: "400" });
const indieFlower = Indie_Flower({ subsets: ["latin"], weight: "400" });
const shadowsIntoLight = Shadows_Into_Light({ subsets: ["latin"], weight: "400" });
const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400" });

const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "700"] });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });

const categoryOrder: Record<FontCategory, number> = {
    "Sans Serif": 0,
    Serif: 1,
    Display: 2,
    Handwritten: 3,
    Monospace: 4,
};

const unsortedFonts: FontOption[] = [
    {
        name: "Atkinson Hyperlegible",
        style: atkinsonHyperlegible.style.fontFamily,
        className: atkinsonHyperlegible.className,
        category: "Sans Serif",
    },
    { name: "Cabin", style: cabin.style.fontFamily, className: cabin.className, category: "Sans Serif" },
    { name: "Figtree", style: figtree.style.fontFamily, className: figtree.className, category: "Sans Serif" },
    { name: "Manrope", style: manrope.style.fontFamily, className: manrope.className, category: "Sans Serif" },
    { name: "Work Sans", style: workSans.style.fontFamily, className: workSans.className, category: "Sans Serif" },
    {
        name: "Cormorant Garamond",
        style: cormorantGaramond.style.fontFamily,
        className: cormorantGaramond.className,
        category: "Serif",
    },
    { name: "Lusitana", style: lusitana.style.fontFamily, className: lusitana.className, category: "Serif" },
    { name: "Prata", style: prata.style.fontFamily, className: prata.className, category: "Serif" },
    { name: "Spectral", style: spectral.style.fontFamily, className: spectral.className, category: "Serif" },
    { name: "Zilla Slab", style: zillaSlab.style.fontFamily, className: zillaSlab.className, category: "Serif" },
    { name: "Anton", style: anton.style.fontFamily, className: anton.className, category: "Display" },
    { name: "Archivo Black", style: archivoBlack.style.fontFamily, className: archivoBlack.className, category: "Display" },
    { name: "Black Han Sans", style: blackHanSans.style.fontFamily, className: blackHanSans.className, category: "Display" },
    { name: "Bungee", style: bungee.style.fontFamily, className: bungee.className, category: "Display" },
    { name: "Chango", style: chango.style.fontFamily, className: chango.className, category: "Display" },
    { name: "Monoton", style: monoton.style.fontFamily, className: monoton.className, category: "Display" },
    { name: "Staatliches", style: staatliches.style.fontFamily, className: staatliches.className, category: "Display" },
    { name: "Unica One", style: unicaOne.style.fontFamily, className: unicaOne.className, category: "Display" },
    { name: "Amatic SC", style: amaticSC.style.fontFamily, className: amaticSC.className, category: "Handwritten" },
    {
        name: "Gloria Hallelujah",
        style: gloriaHallelujah.style.fontFamily,
        className: gloriaHallelujah.className,
        category: "Handwritten",
    },
    { name: "Indie Flower", style: indieFlower.style.fontFamily, className: indieFlower.className, category: "Handwritten" },
    {
        name: "Shadows Into Light",
        style: shadowsIntoLight.style.fontFamily,
        className: shadowsIntoLight.className,
        category: "Handwritten",
    },
    { name: "Yellowtail", style: yellowtail.style.fontFamily, className: yellowtail.className, category: "Handwritten" },
    { name: "JetBrains Mono", style: jetBrainsMono.style.fontFamily, className: jetBrainsMono.className, category: "Monospace" },
    { name: "IBM Plex Mono", style: ibmPlexMono.style.fontFamily, className: ibmPlexMono.className, category: "Monospace" },
    { name: "Rubik Mono One", style: rubikMonoOne.style.fontFamily, className: rubikMonoOne.className, category: "Monospace" },
    { name: "Space Mono", style: spaceMono.style.fontFamily, className: spaceMono.className, category: "Monospace" },
];

export const FONTS: FontOption[] = [...unsortedFonts].sort((a, b) => {
    const categoryComparison = categoryOrder[a.category] - categoryOrder[b.category];
    if (categoryComparison !== 0) {
        return categoryComparison;
    }

    return a.name.localeCompare(b.name);
});

export const FONT_CATEGORIES: FontCategory[] = ["Sans Serif", "Serif", "Display", "Handwritten", "Monospace"];
