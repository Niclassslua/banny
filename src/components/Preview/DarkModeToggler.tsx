import React, { useEffect, useState } from "react";

export default function DarkModeToggler() {
    const [darkMode, setDarkMode] = useState(false);

    // Synchronisiere den Zustand mit der HTML-Klasse
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    return (
        <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-md"
        >
            {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
    );
}