import React from "react";
import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

describe("Landing page (/)", () => {
    it("renders the main hero heading", () => {
        render(<Page />);

        expect(
            screen.getByText("Dein kleiner Designfreund mit großem Geschmack."),
        ).toBeInTheDocument();
    });

    it("has a link to the creator", () => {
        render(<Page />);

        const link = screen.getByRole("link", { name: /launch den creator/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/creator");
    });
});

