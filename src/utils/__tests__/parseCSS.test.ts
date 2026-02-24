import { parseCSS } from "@/utils/parseCSS";

describe("parseCSS", () => {
    it("returns an empty object when style input is undefined", () => {
        expect(parseCSS(undefined, 10, "#000000", "#ffffff")).toEqual({});
    });

    it("parses simple CSS strings into camelCased properties", () => {
        const styles = parseCSS("background-color: red; font-size: 16px;", 10, "#000000", "#ffffff");
        expect(styles).toEqual(
            expect.objectContaining({
                backgroundColor: "red",
                fontSize: "16px",
            }),
        );
    });

    it("handles CSS variables as raw keys", () => {
        const styles = parseCSS("--my-color: red; color: blue;", 10, "#000000", "#ffffff");
        expect(styles["--my-color"]).toBe("red");
        expect(styles.color).toBe("blue");
    });

    it("evaluates style functions with scale and colors", () => {
        const fn = (scale: number, color1: string, color2: string) =>
            `background-color: ${color1}; border-color: ${color2}; font-size: ${scale}px;`;

        const styles = parseCSS(fn, 20, "#111111", "#222222");
        expect(styles).toEqual(
            expect.objectContaining({
                backgroundColor: "#111111",
                borderColor: "#222222",
                fontSize: "20px",
            }),
        );
    });
});

