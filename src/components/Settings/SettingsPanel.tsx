// components/Settings/SettingsPanel.tsx
import React from "react";
import ColorPickerComponent from "@/components/Sidebar/ColorPicker";
import { SettingsPanelProps } from "@/types";

const SettingsPanel: React.FC<SettingsPanelProps> = ({
                                                         patternColor1,
                                                         setPatternColor1,
                                                         patternColor2,
                                                         setPatternColor2,
                                                         patternScale,
                                                         setPatternScale,
                                                         darkMode,
                                                         visiblePicker,
                                                         togglePicker,
                                                     }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Primary Color Picker */}
            <div className="flex flex-col items-center">
                <label className="text-sm font-medium mb-2 text-foreground">Primary Color</label>
                <ColorPickerComponent
                    color={patternColor1}
                    setColor={setPatternColor1}
                    darkMode={darkMode}
                    isVisible={visiblePicker === "picker1"}
                    togglePicker={() => togglePicker("picker1")}
                />
            </div>
            {/* Secondary Color Picker */}
            <div className="flex flex-col items-center">
                <label className="text-sm font-medium mb-2 text-foreground">Secondary Color</label>
                <ColorPickerComponent
                    color={patternColor2}
                    setColor={setPatternColor2}
                    darkMode={darkMode}
                    isVisible={visiblePicker === "picker2"}
                    togglePicker={() => togglePicker("picker2")}
                />
            </div>
            {/* Pattern Scale Slider */}
            <div className="flex flex-col items-center">
                <label className="text-sm font-medium mb-2 text-foreground">
                    Pattern Scale: {patternScale}px
                </label>
                <input
                    type="range"
                    min={5}
                    max={25}
                    step={0.1}
                    value={patternScale}
                    onChange={(e) => setPatternScale(Number(e.target.value))}
                    className="w-full sm:w-3/4 h-2 rounded-full cursor-pointer bg-background text-foreground border border-foreground focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <div className="flex justify-between w-full sm:w-3/4 text-xs text-foreground mt-2">
                    <span>5</span>
                    <span>15</span>
                    <span>25</span>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;