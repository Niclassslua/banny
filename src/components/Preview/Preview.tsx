import React, { forwardRef } from "react";

interface PreviewProps {
    style: React.CSSProperties;
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ style }, ref) => {
    return (
        <div
            ref={ref}
            className="w-full h-64 md:h-72 lg:h-80 rounded-lg shadow-lg relative flex items-center justify-center overflow-hidden"
            style={style}
        />
    );
});

// Display Name hinzufügen
Preview.displayName = "Preview";

export default Preview;
