// components/Sidebar/ColorPicker.tsx
"use client";

import React from "react";
import ColorPicker from 'react-best-gradient-color-picker';

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

const colorPalette = [
    "#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9", "#92A8D1", "#955251",
    "#B565A7", "#009B77", "#FFD662", "#D65076", "#45B8AC", "#EFC050",
    "#5B5EA6", "#9B2335", "#DFCFBE", "#FF0000", "#00FF00", "#0000FF",
    "#FFFF00", "#FF00FF", "#000000", "#FFFFFF"
];

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
                className="w-10 h-10 rounded-full border-2 border-gray-400 dark:border-gray-600"
                style={{ backgroundColor: color }}
                aria-label="Toggle Color Picker"
            />
            {isVisible && (
                <div
                    className="absolute top-12 left-0 bg-gray-50 dark:bg-gray-800 rounded-md shadow-lg border-2 border-gray-400 dark:border-gray-600 p-4 transition-opacity duration-300 z-50"
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
                        presets={colorPalette}
                    />
                </div>
            )}
        </div>
    );
};

export default ColorPickerComponent;