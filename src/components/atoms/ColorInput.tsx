// src/components/atoms/ColorInput.tsx
interface ColorInputProps {
    value: string;
    onChange: (c: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ value, onChange }) => (
    <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-md cursor-pointer border-2 border-gray-300 dark:border-gray-600"
    />
);
