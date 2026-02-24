// src/components/molecules/LabelledRange.tsx
import { RangeSlider } from "@/components/atoms";

interface Props {
    label: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (n: number) => void;
}

export const LabelledRange: React.FC<Props> = ({ label, min, max, step, value, onChange }) => (
    <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            {label}: {value}px
        </label>
        <RangeSlider min={min} max={max} step={step} value={value} onChange={onChange} />
    </div>
);
