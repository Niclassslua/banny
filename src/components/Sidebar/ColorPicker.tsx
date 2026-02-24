// components/Sidebar/ColorPicker.tsx
"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ColorPicker from "react-best-gradient-color-picker";
import { Palette } from "lucide-react";

import { colors } from "@/constants/colors";

interface ColorPickerProps {
    color: string;
    setColor: (color: string) => void;
    darkMode: boolean;
    isVisible: boolean;
    togglePicker: () => void;
    variant?: "circle" | "swatch";
}

const rgbaToHex = (rgba: string): string => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (!match) return rgba; // Falls keine Übereinstimmung, Originalwert zurückgeben
    const [r, g, b] = match.slice(1, 4).map(Number);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
};

const ColorPickerComponent: React.FC<ColorPickerProps> = ({
    color,
    setColor,
    darkMode,
    isVisible,
    togglePicker,
    variant = "circle",
}) => {
    const isSwatch = variant === "swatch";
    const triggerRef = useRef<HTMLButtonElement>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [pickerPosition, setPickerPosition] = useState<
        { left: number; top: number; transform?: string } | null
    >(null);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useLayoutEffect(() => {
        if (!isVisible || !triggerRef.current) {
            setPickerPosition(null);
            return undefined;
        }

        const updatePosition = () => {
            if (!triggerRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            const pickerWidth = 288; // 18rem in pixels
            const viewportWidth = window.innerWidth;
            const horizontalPadding = 16;

            const left = Math.min(
                Math.max(rect.left + rect.width / 2, horizontalPadding + pickerWidth / 2),
                viewportWidth - horizontalPadding - pickerWidth / 2,
            );

            setPickerPosition({
                left,
                top: rect.top,
                transform: "translate(-50%, calc(-100% - 12px))",
            });
        };

        updatePosition();

        const handleScroll = () => updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isVisible]);

    const triggerClassName = isSwatch
        ? "group relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-white/15 shadow-sm transition duration-150 hover:border-[#A1E2F8]/60 hover:shadow-md"
        : "relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/10 transition hover:ring-[#A1E2F8]/60";
    const ariaPressed = isSwatch ? { "aria-pressed": isVisible } : {};
    const pickerStyles = pickerPosition
        ? {
              left: pickerPosition.left,
              top: pickerPosition.top,
              transform: pickerPosition.transform,
          }
        : undefined;

    useEffect(() => {
        if (!isVisible) {
            return undefined;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) {
                togglePicker();
                return;
            }
            const overlayNode = overlayRef.current;
            const triggerNode = triggerRef.current;

            if (overlayNode?.contains(target) || triggerNode?.contains(target)) {
                return;
            }

            togglePicker();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                togglePicker();
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isVisible, togglePicker]);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={togglePicker}
                className={triggerClassName}
                aria-label="Toggle Color Picker"
                ref={triggerRef}
                {...ariaPressed}
            >
                {isSwatch ? (
                    <>
                        <span aria-hidden className="absolute inset-0" style={{ background: color }} />
                        <span className="absolute inset-[2px] rounded-full border border-white/25 bg-zinc-900/55 backdrop-blur-[1px]" />
                        <span className="relative flex h-full w-full items-center justify-center text-white">
                            <Palette
                                size={15}
                                strokeWidth={1.75}
                                className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.65)]"
                            />
                        </span>
                    </>
                ) : (
                    <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: color }} />
                )}
            </button>
            {isVisible && isMounted && pickerStyles &&
                createPortal(
                    <div
                        className="fixed z-[10000] w-[18rem] rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-[0_25px_70px_-35px_rgba(192,230,244,0.6)] backdrop-blur"
                        style={pickerStyles}
                        ref={(node) => {
                            overlayRef.current = node;
                        }}
                    >
                        <ColorPicker
                            style={{
                                body: {
                                    backgroundColor: "transparent",
                                    boxShadow: "none",
                                },
                                rbgcpInputLabel: {
                                    color: "rgb(225, 233, 240)",
                                },
                                rbgcpControlBtnWrapper: {
                                    backgroundColor: "rgba(255,255,255,0.04)",
                                    borderRadius: "12px",
                                },
                                rbgcpInput: {
                                    border: "none",
                                    color: "white",
                                    backgroundColor: "rgba(255,255,255,0.06)",
                                },
                                rbgcpControlBtn: {
                                    color: "rgb(225, 233, 240)",
                                },
                                rbgcpControlIcon: {
                                    stroke: "rgb(225, 233, 240)",
                                },
                                rbgcpControlIcon2: {
                                    fill: "rgb(225, 233, 240)",
                                },
                                rbgcpControlInput: {
                                    color: "white",
                                },
                                rbgcpControlBtnSelected: {
                                    backgroundColor: "rgba(161, 226, 248, 0.18)",
                                    color: "#A1E2F8",
                                },
                                rbgcpDegreeIcon: {
                                    color: "rgb(225, 233, 240)",
                                },
                                rbgcpColorModelDropdown: {
                                    backgroundColor: "rgba(8,8,12,0.85)",
                                    borderRadius: "12px",
                                },
                                rbgcpComparibleLabel: {
                                    color: "rgb(225, 233, 240)",
                                },
                            }}
                            value={color}
                            onChange={(newColor) => setColor(rgbaToHex(newColor))}
                            width={260}
                            height={180}
                            hideGradientType
                            hidePresets={false}
                            disableLightMode={!darkMode}
                            disableDarkMode={darkMode}
                            hideColorTypeBtns
                            presets={colors}
                        />
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default ColorPickerComponent;
