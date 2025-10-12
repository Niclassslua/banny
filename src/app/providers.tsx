"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@/theme";

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <ChakraProvider theme={theme} resetCSS={false}>
            {children}
        </ChakraProvider>
    );
};
