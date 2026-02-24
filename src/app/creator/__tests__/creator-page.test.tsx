import React from "react";
import { render, screen } from "@testing-library/react";
import CreatorPage from "@/app/creator/page";

// jsdom does not implement window.matchMedia by default; next/head and framer-motion may rely on it.
if (typeof window !== "undefined" && !window.matchMedia) {
    // Minimal stub sufficient for these smoke tests
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.matchMedia = () => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });
}

describe("Creator page (/creator)", () => {
    it("renders the workspace heading", () => {
        render(<CreatorPage />);

        expect(screen.getByText("Banny Workspace")).toBeInTheDocument();
    });

    it("shows the sidebar typography controls via FontControls", () => {
        render(<CreatorPage />);

        expect(
            screen.getByText(/Pattern auswählen/i),
        ).toBeInTheDocument();
    });
});

