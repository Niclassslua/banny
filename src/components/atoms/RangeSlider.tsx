// src/components/atoms/RangeSlider.tsx
interface RangeSliderProps {
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (n: number) => void;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
    min,
    max,
    step = 1,
    value,
    onChange,
}) => (
    <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-2 appearance-none rounded-lg bg-white/20 backdrop-blur-md shadow-[0_0_10px_rgba(255,255,255,0.3)]"
    />
);
