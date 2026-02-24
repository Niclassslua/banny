import { sanitizeFileName } from "@/utils/fileName";

describe("sanitizeFileName", () => {
    it("returns a slugified version of the name", () => {
        expect(sanitizeFileName("My Cool Banner.png")).toBe("my-cool-banner-png");
    });

    it("falls back to default when name is empty after sanitizing", () => {
        expect(sanitizeFileName("!!!")).toBe("banny-banner");
        expect(sanitizeFileName("   ")).toBe("banny-banner");
    });

    it("strips leading and trailing dashes", () => {
        expect(sanitizeFileName("---My name---")).toBe("my-name");
    });
});

