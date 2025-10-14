import {
    Abril_Fatface,
    Alfa_Slab_One,
    Bebas_Neue,
    Bodoni_Moda,
    Caveat,
    Cinzel,
    Dancing_Script,
    Fira_Code,
    Great_Vibes,
    Inter,
    Josefin_Sans,
    Lobster,
    Lora,
    Merriweather,
    Noto_Serif,
    Oswald,
    Pacifico,
    Playfair_Display,
    Poppins,
    Press_Start_2P,
    PT_Serif,
    Raleway,
    Roboto,
    Rubik,
    Satisfy,
    Source_Code_Pro,
    Space_Grotesk,
    Ubuntu,
} from "next/font/google";

export type FontCategory = "Sans Serif" | "Serif" | "Display" | "Handwritten" | "Monospace";

export interface FontOption {
    name: string;
    style: string;
    className: string;
    category: FontCategory;
}

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });
const raleway = Raleway({ subsets: ["latin"], weight: ["400", "700"] });
const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["400", "700"] });
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "700"] });
const josefinSans = Josefin_Sans({ subsets: ["latin"], weight: ["400", "600"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "700"] });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });

const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"] });
const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"] });
const ptSerif = PT_Serif({ subsets: ["latin"], weight: ["400", "700"] });
const lora = Lora({ subsets: ["latin"], weight: ["400", "700"] });
const bodoniModa = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "700"] });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"] });
const abrilFatface = Abril_Fatface({ subsets: ["latin"], weight: "400" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });
const alfaSlabOne = Alfa_Slab_One({ subsets: ["latin"], weight: "400" });
const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: "400" });

const dancingScript = Dancing_Script({ subsets: ["latin"], weight: ["400", "700"] });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });
const lobster = Lobster({ subsets: ["latin"], weight: "400" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });
const satisfy = Satisfy({ subsets: ["latin"], weight: "400" });

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"], weight: ["400", "700"] });
const firaCode = Fira_Code({ subsets: ["latin"], weight: ["400", "700"] });

const categoryOrder: Record<FontCategory, number> = {
    "Sans Serif": 0,
    Serif: 1,
    Display: 2,
    Handwritten: 3,
    Monospace: 4,
};

const unsortedFonts: FontOption[] = [
    { name: "Roboto", style: roboto.style.fontFamily, className: roboto.className, category: "Sans Serif" },
    { name: "Inter", style: inter.style.fontFamily, className: inter.className, category: "Sans Serif" },
    { name: "Poppins", style: poppins.style.fontFamily, className: poppins.className, category: "Sans Serif" },
    { name: "Raleway", style: raleway.style.fontFamily, className: raleway.className, category: "Sans Serif" },
    { name: "Ubuntu", style: ubuntu.style.fontFamily, className: ubuntu.className, category: "Sans Serif" },
    { name: "Rubik", style: rubik.style.fontFamily, className: rubik.className, category: "Sans Serif" },
    { name: "Josefin Sans", style: josefinSans.style.fontFamily, className: josefinSans.className, category: "Sans Serif" },
    { name: "Space Grotesk", style: spaceGrotesk.style.fontFamily, className: spaceGrotesk.className, category: "Sans Serif" },
    { name: "Oswald", style: oswald.style.fontFamily, className: oswald.className, category: "Display" },
    { name: "Playfair Display", style: playfairDisplay.style.fontFamily, className: playfairDisplay.className, category: "Serif" },
    { name: "Merriweather", style: merriweather.style.fontFamily, className: merriweather.className, category: "Serif" },
    { name: "Noto Serif", style: notoSerif.style.fontFamily, className: notoSerif.className, category: "Serif" },
    { name: "PT Serif", style: ptSerif.style.fontFamily, className: ptSerif.className, category: "Serif" },
    { name: "Lora", style: lora.style.fontFamily, className: lora.className, category: "Serif" },
    { name: "Bodoni Moda", style: bodoniModa.style.fontFamily, className: bodoniModa.className, category: "Serif" },
    { name: "Cinzel", style: cinzel.style.fontFamily, className: cinzel.className, category: "Display" },
    { name: "Abril Fatface", style: abrilFatface.style.fontFamily, className: abrilFatface.className, category: "Display" },
    { name: "Bebas Neue", style: bebasNeue.style.fontFamily, className: bebasNeue.className, category: "Display" },
    { name: "Alfa Slab One", style: alfaSlabOne.style.fontFamily, className: alfaSlabOne.className, category: "Display" },
    { name: "Press Start 2P", style: pressStart2P.style.fontFamily, className: pressStart2P.className, category: "Display" },
    { name: "Dancing Script", style: dancingScript.style.fontFamily, className: dancingScript.className, category: "Handwritten" },
    { name: "Pacifico", style: pacifico.style.fontFamily, className: pacifico.className, category: "Handwritten" },
    { name: "Lobster", style: lobster.style.fontFamily, className: lobster.className, category: "Handwritten" },
    { name: "Great Vibes", style: greatVibes.style.fontFamily, className: greatVibes.className, category: "Handwritten" },
    { name: "Caveat", style: caveat.style.fontFamily, className: caveat.className, category: "Handwritten" },
    { name: "Satisfy", style: satisfy.style.fontFamily, className: satisfy.className, category: "Handwritten" },
    { name: "Source Code Pro", style: sourceCodePro.style.fontFamily, className: sourceCodePro.className, category: "Monospace" },
    { name: "Fira Code", style: firaCode.style.fontFamily, className: firaCode.className, category: "Monospace" },
];

export const FONTS: FontOption[] = [...unsortedFonts].sort((a, b) => {
    const categoryComparison = categoryOrder[a.category] - categoryOrder[b.category];
    if (categoryComparison !== 0) {
        return categoryComparison;
    }

    return a.name.localeCompare(b.name);
});

export const FONT_CATEGORIES: FontCategory[] = ["Sans Serif", "Serif", "Display", "Handwritten", "Monospace"];
