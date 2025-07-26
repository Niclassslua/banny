import { colornames } from "color-name-list";

export const getClosestColorName = (hex: string): string => {
    const match = colornames.find((color) => color.hex.toLowerCase() === hex.toLowerCase());
    return match ? match.name : "Unknown";
};
