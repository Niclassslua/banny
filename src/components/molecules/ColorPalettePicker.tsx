import { ColorSwatch } from "../atoms";

interface Props {
    colors: string[];
    onChange: (c: string) => void;
    selectedColor?: string;
}

export const ColorPalettePicker: React.FC<Props> = ({ colors, onChange, selectedColor }) => (
    <div className="flex flex-wrap gap-x-3 gap-y-3">
        {colors.map((c) => (
            <ColorSwatch key={c} color={c} onClick={() => onChange(c)} selected={selectedColor === c} />
        ))}
    </div>
);
