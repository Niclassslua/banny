import React from "react";

const Button: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            {label}
        </button>
    );
};

export default Button;
