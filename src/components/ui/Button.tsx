"use client";

import { Button as ChakraButton, type ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import { forwardRef } from "react";

type CustomButtonSize = "icon" | "iconSmall" | "iconDanger";

type ExtendedButtonProps = Omit<ChakraButtonProps, "size"> & {
    size?: ChakraButtonProps["size"] | CustomButtonSize;
};

const SIZE_STYLE_MAP: Record<CustomButtonSize, Partial<ChakraButtonProps>> = {
    icon: { w: "2.5rem", h: "2.5rem", px: 0, py: 0, borderRadius: "xl" },
    iconSmall: { w: "2rem", h: "2rem", px: 0, py: 0, borderRadius: "lg" },
    iconDanger: { w: "2.25rem", h: "2.25rem", px: 0, py: 0, borderRadius: "lg" },
};

export type ButtonProps = ExtendedButtonProps;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ size = "md", ...rest }, ref) => {
    const styleProps =
        typeof size === "string" && (size as CustomButtonSize) in SIZE_STYLE_MAP
            ? SIZE_STYLE_MAP[size as CustomButtonSize]
            : undefined;

    const chakraSize: ChakraButtonProps["size"] =
        typeof size === "string" && (size as CustomButtonSize) in SIZE_STYLE_MAP ? "sm" : size;

    return <ChakraButton ref={ref} size={chakraSize} {...styleProps} {...rest} />;
});

Button.displayName = "Button";

export { Button };
