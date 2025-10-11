// components/Preview/BannerPreview.tsx
import React, { useEffect, useRef } from "react";
import { TextStyles, Pattern, CanvasSize } from "@/types";
import { parseCSS } from "@/utils/parseCSS";

interface BannerPreviewProps {
    selectedPattern: Pattern;
    patternColor1: string;
    patternColor2: string;
    patternScale: number;
    textContent: string;
    textStyles: TextStyles;
    previewRef: React.RefObject<HTMLDivElement>;
    onTextChange: (newText: string) => void;
    canvasSize: CanvasSize;
}

const BannerPreview: React.FC<BannerPreviewProps> = ({
                                                         selectedPattern,
                                                         patternColor1,
                                                         patternColor2,
                                                         patternScale,
                                                         textContent,
                                                         textStyles,
                                                         previewRef,
                                                         onTextChange,
                                                         canvasSize,
                                                     }) => {
    // Inline-Stile für den Text (ohne fontFamily, da diese über den Style-Tag mit !important gesetzt wird)
    const textStyle: React.CSSProperties = {
        fontWeight: textStyles.bold ? "bold" : "normal",
        fontStyle: textStyles.italic ? "italic" : "normal",
        textDecoration: `${textStyles.underline ? "underline" : ""} ${textStyles.strikethrough ? "line-through" : ""}`.trim(),
        fontSize: `${textStyles.fontSize}px`,
        color: textStyles.textColor,
        textAlign: textStyles.alignment as "left" | "center" | "right" | "justify",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        cursor: "text",
        outline: "none",
        whiteSpace: textStyles.noWrap ? "nowrap" : "normal",
        zIndex: 2,
    };

    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!textRef.current) {
            return;
        }

        if (textRef.current.textContent !== textContent) {
            textRef.current.textContent = textContent;
        }
    }, [textContent]);

    return (
        <div
            ref={previewRef}
            className="pattern-surface"
            style={{
                ...parseCSS(selectedPattern.style, patternScale, patternColor1, patternColor2),
                position: "relative",
                width: "100%",
                maxWidth: `${canvasSize.width}px`,
                aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
                height: "auto",
                overflow: "hidden",
            }}
        >
            {/* Dynamisch eingebundener Style, der den fontFamily-Wert mit !important setzt */}
            <style>
                {`
                  .banner-text {
                    font-family: ${textStyles.fontFamily} !important;
                  }
                `}
            </style>
            <div
                className="banner-text"
                style={textStyle}
                ref={textRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => onTextChange(e.currentTarget.textContent || "")}
                onPaste={(e) => {
                    // Default verhindern (kein HTML einfügen)
                    e.preventDefault();
                    // Nur reinen Text holen
                    const text = e.clipboardData.getData("text/plain");
                    // Einfügen an der Cursor-Position
                    if (document.queryCommandSupported("insertText")) {
                        document.execCommand("insertText", false, text);
                    } else {
                        // Fallback für Browser, die execCommand nicht unterstützen
                        const sel = window.getSelection();
                        if (!sel || !sel.rangeCount) return;
                        sel.deleteFromDocument();
                        sel.getRangeAt(0).insertNode(document.createTextNode(text));
                        // Cursor ans Ende der eingefügten Node setzen
                        sel.collapseToEnd();
                    }
                }}
            />
        </div>
    );
};

export default BannerPreview;