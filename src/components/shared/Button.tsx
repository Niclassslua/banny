"use client";

import React from "react";

import { Button as UiButton } from "@/components/ui/Button";

const Button: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => {
    return (
        <UiButton variant="primary" onClick={onClick}>
            {label}
        </UiButton>
    );
};

export default Button;
