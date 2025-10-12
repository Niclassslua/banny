// src/components/Settings/SettingsPanel.tsx
import React from "react";
import clsx from "clsx";
import { RangeSlider } from "@/components/atoms";
import ColorPickerComponent from "@/components/Sidebar/ColorPicker";
import { SettingsPanelProps } from "@/types";
import { IconRefresh, IconArrowsShuffle } from "@tabler/icons-react";
import { buttonClass } from "@/utils/buttonStyles";

const randomHex = () =>
    "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
                                                                             children,
                                                                             className = "",
                                                                         }) => (
    <div
        className={`relative flex flex-col gap-2
      rounded-xl bg-zinc-900/60 backdrop-blur-md ring-1 ring-white/10
      shadow-md hover:shadow-lg transition duration-150
      px-4 py-3 ${className}`}
    >
        {children}
    </div>
);

const ColorHeader: React.FC<{
    title: string;
    swatch: string;
    onReset: () => void;
    onShuffle: () => void;
    isDefault: boolean;
}> = ({ title, swatch, onReset, onShuffle, isDefault }) => (
    <header className="flex items-center w-full gap-2">
    <span
        className="h-4 w-4 shrink-0 rounded-full ring-1 ring-white/30"
        style={{ backgroundColor: swatch }}
    />
        <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground/70">
            {title}
        </h3>
        <div className="ml-auto flex gap-1">
            {!isDefault && (
                <button
                    type="button"
                    onClick={onReset}
                    className={buttonClass("iconSmall")}
                    title="Reset"
                >
                    <IconRefresh size={16} stroke={1.5} />
                </button>
            )}
            <button
                type="button"
                onClick={onShuffle}
                className={buttonClass("iconSmall")}
                title="Shuffle"
            >
                <IconArrowsShuffle size={16} stroke={1.5} />
            </button>
        </div>
    </header>
);

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
                                                         canvasSize,
                                                         setCanvasSize,
                                                         canvasPresets,
                                                     }) => {
    /* Slider-Tooltip-Position berechnen (0-100 %) */
    const pct = ((patternScale - 5) / (25 - 5)) * 100;

    const handleDimensionChange = (dimension: "width" | "height") =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const nextValue = Number(event.target.value);
            if (Number.isNaN(nextValue) || nextValue <= 0) {
                return;
            }

            setCanvasSize({
                ...canvasSize,
                [dimension]: nextValue,
            });
        };

    const isPresetSelected = (preset: { width: number; height: number }) =>
        preset.width === canvasSize.width && preset.height === canvasSize.height;

    return (
        <section className="flex flex-col gap-6 mt-8">
            {/* --- kompakte Farb- + Scale-Row ------------------------------- */}
            <div className="flex flex-wrap gap-4">
                {/* Primary Color */}
                <Card className="flex-1 min-w-[220px] max-w-sm">
                    <ColorHeader
                        title="Primary color"
                        swatch={patternColor1}
                        onReset={() => setPatternColor1("#131313")}
                        onShuffle={() => setPatternColor1(randomHex())}
                        isDefault={patternColor1 === "#131313"}
                    />
                    <div className="mt-1 flex justify-center">
                        <ColorPickerComponent
                            color={patternColor1}
                            setColor={setPatternColor1}
                            darkMode={darkMode}
                            isVisible={visiblePicker === "picker1"}
                            togglePicker={() => togglePicker("picker1")}
                        />
                    </div>
                </Card>

                {/* Secondary Color */}
                <Card className="flex-1 min-w-[220px] max-w-sm">
                    <ColorHeader
                        title="Secondary color"
                        swatch={patternColor2}
                        onReset={() => setPatternColor2("#b3b3c4")}
                        onShuffle={() => setPatternColor2(randomHex())}
                        isDefault={patternColor2 === "#b3b3c4"}
                    />
                    <div className="mt-1 flex justify-center">
                        <ColorPickerComponent
                            color={patternColor2}
                            setColor={setPatternColor2}
                            darkMode={darkMode}
                            isVisible={visiblePicker === "picker2"}
                            togglePicker={() => togglePicker("picker2")}
                        />
                    </div>
                </Card>

                {/* Pattern Scale */}
                <Card className="flex-1 min-w-[240px] max-w-sm">
                    <header className="flex items-center w-full gap-2">
                        <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground/70">
                            Pattern scale
                        </h3>
                        <span className="ml-auto text-sm tabular-nums text-foreground/80">
              {patternScale}px
            </span>
                    </header>

                    <div
                        className="relative w-full pt-4"
                        style={{ "--pos": `${pct}%` } as React.CSSProperties}
                    >
                        <RangeSlider
                            min={5}
                            max={25}
                            step={0.1}
                            value={patternScale}
                            onChange={setPatternScale}
                            ariaLabel="Pattern scale"
                            trackColor="rgba(255,255,255,0.1)"
                            progressColor="rgba(161,226,248,0.9)"
                            glowColor="rgba(161,226,248,0.45)"
                        />
                        <span className="slider-bubble">{patternScale}px</span>
                    </div>

                    <div className="flex justify-between w-full text-xs text-foreground/50 mt-1">
                        <span>5</span>
                        <span>15</span>
                        <span>25</span>
                    </div>
                </Card>
            </div>

            <Card className="w-full">
                <header className="flex items-center w-full gap-2">
                    <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground/70">
                        Canvas size
                    </h3>
                    <span className="ml-auto text-sm tabular-nums text-foreground/80">
                        {canvasSize.width} × {canvasSize.height}
                    </span>
                </header>

                <div className="mt-3 flex flex-wrap gap-2">
                    {canvasPresets.map((preset) => {
                        const selected = isPresetSelected(preset);
                        return (
                            <button
                                key={`${preset.label}-${preset.width}x${preset.height}`}
                                type="button"
                                onClick={() =>
                                    setCanvasSize({
                                        width: preset.width,
                                        height: preset.height,
                                    })
                                }
                                className={clsx(
                                    buttonClass("ghost", "sm", "rounded-lg px-3 py-1.5 text-sm"),
                                    selected
                                        ? "border-[#A1E2F8] bg-[#A1E2F8]/10 text-white"
                                        : "border-white/10 bg-white/5 text-foreground/80 hover:border-[#A1E2F8]/60 hover:text-white",
                                )}
                            >
                                <span className="font-medium">{preset.label}</span>
                                <span className="ml-2 text-xs text-foreground/60">
                                    {preset.width}×{preset.height}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 grid w-full gap-3 sm:grid-cols-2 sm:safari-grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-foreground/60">
                        Width (px)
                        <input
                            type="number"
                            min={100}
                            max={6000}
                            value={canvasSize.width}
                            onChange={handleDimensionChange("width")}
                            className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-foreground/90 focus:border-[#A1E2F8] focus:outline-none focus:ring-2 focus:ring-[#A1E2F8]/40"
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-foreground/60">
                        Height (px)
                        <input
                            type="number"
                            min={100}
                            max={6000}
                            value={canvasSize.height}
                            onChange={handleDimensionChange("height")}
                            className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-foreground/90 focus:border-[#A1E2F8] focus:outline-none focus:ring-2 focus:ring-[#A1E2F8]/40"
                        />
                    </label>
                </div>
            </Card>
        </section>
    );
};

export default SettingsPanel;
