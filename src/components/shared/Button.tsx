import React from "react";

const Button: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 rounded bg-blue-500 text-white transition hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8]"
        >
            {label}
        </button>
    );
};

export default Button;
