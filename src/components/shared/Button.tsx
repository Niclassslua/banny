import React from "react";

import { buttonClass } from "@/utils/buttonStyles";

const Button: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => {
    return (
        <button type="button" onClick={onClick} className={buttonClass("primary")}>
            {label}
        </button>
    );
};

export default Button;
