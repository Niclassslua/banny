import { ColorSwatch } from "../atoms";

interface Props {
    colors: string[];
    onChange: (c: string) => void;
}

export const ColorPalettePicker: React.FC<Props> = ({ colors, onChange }) => (
    <div className="flex flex-wrap gap-x-3 gap-y-3">
        {colors.map((c) => (
            <ColorSwatch key={c} color={c} onClick={() => onChange(c)} />
        ))}
    </div>
);
