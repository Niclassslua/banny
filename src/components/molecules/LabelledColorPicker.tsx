// src/components/molecules/LabelledColorPicker.tsx
import { ColorInput } from "@/components/atoms";

interface Props {
    label: string;
    value: string;
    onChange: (c: string) => void;
}

export const LabelledColorPicker: React.FC<Props> = ({ label, value, onChange }) => (
    <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            {label}
        </label>
        <ColorInput value={value} onChange={onChange} />
    </div>
);
