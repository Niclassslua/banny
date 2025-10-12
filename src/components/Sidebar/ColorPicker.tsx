// components/Sidebar/ColorPicker.tsx
"use client";

import React from "react";
import ColorPicker from "react-best-gradient-color-picker";

import { colors } from "@/constants/colors";

const focusRingClass =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8]";

interface ColorPickerProps {
    color: string;
    setColor: (color: string) => void;
    darkMode: boolean;
    isVisible: boolean;
    togglePicker: () => void;
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
                                                              togglePicker
                                                          }) => {
    return (
        <div className="relative">
            <button
                type="button"
                onClick={togglePicker}
                className="h-10 w-10 rounded-full ring-2 ring-white/10 transition hover:ring-[#A1E2F8]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1E2F8]"
                style={{ background: color }}
                aria-label="Toggle Color Picker"
            />
            {isVisible && (
                <div
                    className="absolute bottom-[calc(100%+0.75rem)] left-1/2 z-50 w-[18rem] -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-[0_25px_70px_-35px_rgba(192,230,244,0.6)] backdrop-blur"
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
                </div>
            )}
        </div>
    );
};

export default ColorPickerComponent;