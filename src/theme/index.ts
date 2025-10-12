import { extendTheme, defineStyleConfig } from "@chakra-ui/react";

const buttonBaseStyle = {
    fontWeight: "semibold",
    borderRadius: "full",
    transitionProperty: "all",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease-out",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    _focusVisible: {
        boxShadow: "0 0 0 2px #A1E2F8",
    },
    _disabled: {
        opacity: 0.6,
        cursor: "not-allowed",
    },
};

const buttonSizes = {
    sm: {
        fontSize: "xs",
        px: 3,
        py: 2,
    },
    md: {
        fontSize: "sm",
        px: 4,
        py: 2.5,
    },
    lg: {
        fontSize: "md",
        px: 5,
        py: 3,
    },
};

const buttonVariants = {
    primary: {
        border: "1px solid rgba(161,226,248,0.6)",
        bg: "rgba(161,226,248,0.2)",
        color: "#A1E2F8",
        boxShadow: "0 16px 40px -24px rgba(161,226,248,0.6)",
        _hover: {
            borderColor: "#A1E2F8",
            bg: "rgba(161,226,248,0.35)",
            color: "white",
        },
        _active: {
            bg: "rgba(161,226,248,0.4)",
        },
    },
    secondary: {
        border: "1px solid rgba(255,255,255,0.15)",
        bg: "rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.9)",
        _hover: {
            borderColor: "rgba(255,255,255,0.3)",
            bg: "rgba(255,255,255,0.2)",
            color: "white",
        },
        _active: {
            bg: "rgba(255,255,255,0.25)",
        },
    },
    ghost: {
        border: "1px solid transparent",
        bg: "transparent",
        color: "rgba(255,255,255,0.8)",
        _hover: {
            borderColor: "rgba(255,255,255,0.25)",
            bg: "rgba(255,255,255,0.1)",
            color: "white",
        },
        _active: {
            bg: "rgba(255,255,255,0.16)",
        },
    },
    danger: {
        border: "1px solid rgba(248,113,113,0.7)",
        bg: "rgba(248,113,113,0.1)",
        color: "#FECACA",
        _hover: {
            borderColor: "rgba(248,113,113,1)",
            bg: "rgba(248,113,113,0.2)",
        },
        _active: {
            bg: "rgba(248,113,113,0.3)",
        },
    },
    icon: {
        border: "1px solid rgba(255,255,255,0.15)",
        bg: "rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.8)",
        _hover: {
            borderColor: "rgba(161,226,248,0.4)",
            bg: "rgba(161,226,248,0.2)",
            color: "white",
        },
        _active: {
            bg: "rgba(161,226,248,0.25)",
        },
    },
    iconSmall: {
        border: "1px solid rgba(255,255,255,0.12)",
        bg: "rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.7)",
        _hover: {
            borderColor: "rgba(161,226,248,0.4)",
            bg: "rgba(161,226,248,0.15)",
            color: "white",
        },
        _active: {
            bg: "rgba(161,226,248,0.2)",
        },
    },
    iconDanger: {
        border: "1px solid rgba(248,113,113,0.6)",
        bg: "rgba(248,113,113,0.1)",
        color: "#FECACA",
        _hover: {
            borderColor: "rgba(248,113,113,1)",
            bg: "rgba(248,113,113,0.2)",
        },
        _active: {
            bg: "rgba(248,113,113,0.3)",
        },
    },
};

const Button = defineStyleConfig({
    baseStyle: buttonBaseStyle,
    sizes: buttonSizes,
    variants: buttonVariants,
    defaultProps: {
        variant: "primary",
        size: "md",
    },
});

export const theme = extendTheme({
    components: {
        Button,
    },
});
