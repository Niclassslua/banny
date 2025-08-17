// components/Sidebar/ColorPicker.tsx
"use client";

import React from "react";
import ColorPicker from 'react-best-gradient-color-picker';

import {colors} from "@/constants/colors";

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
                onClick={togglePicker}
                className="w-10 h-10 rounded-full ring-2 ring-white/10"
                style={{ backgroundColor: color }}
                aria-label="Toggle Color Picker"
            />
            {isVisible && (
                <div
                    className="absolute top-12 left-0 bg-gray-50 dark:bg-gray-800 rounded-md shadow-lg border-2 ring-1 ring-white/10 p-4 transition-opacity duration-300 z-50"
                >
                    <ColorPicker
                        style={{
                            body: {
                                background: 'rgb(32, 32, 32)',
                            },
                            rbgcpInputLabel: {
                                color: 'rgb(212, 212, 212)',
                            },
                            rbgcpControlBtnWrapper: {
                                background: 'rgb(54, 54, 54)',
                            },
                            rbgcpInput: {
                                border: 'none',
                                color: 'white',
                                background: 'rgb(54, 54, 54)',
                            },
                            rbgcpControlBtn: {
                                color: 'rgb(212, 212, 212)',
                            },
                            rbgcpControlIcon: {
                                stroke: 'rgb(212, 212, 212)',
                            },
                            rbgcpControlIcon2: {
                                fill: 'rgb(212, 212, 212)',
                            },
                            rbgcpControlInput: {
                                color: 'white',
                            },
                            rbgcpControlBtnSelected: {
                                background: 'black',
                                color: '#568cf5',
                            },
                            rbgcpDegreeIcon: {
                                color: 'rgb(212, 212, 212)',
                            },
                            rbgcpColorModelDropdown: {
                                background: 'rgb(32, 32, 32)',
                            },
                            rbgcpComparibleLabel: {
                                color: 'rgb(212, 212, 212)',
                            }
                        }}
                        value={color}
                        onChange={(newColor) => setColor(rgbaToHex(newColor))}
                        width={300}
                        height={150}
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