import React from "react";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <main className="flex-1 p-4">{children}</main>
        </div>
    );
};

export default AppLayout;
