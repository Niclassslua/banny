import { useState, useEffect } from "react";

const useDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem("dark-mode");
        setIsDarkMode(savedMode === "true");
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
        localStorage.setItem("dark-mode", isDarkMode.toString());
    }, [isDarkMode]);

    return [isDarkMode, setIsDarkMode] as const;
};

export default useDarkMode;
