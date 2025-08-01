import { ColorSwatch } from "../atoms";

interface Props {
    colors: string[];
    onChange: (c: string) => void;
}

export const ColorPalettePicker: React.FC<Props> = ({ colors, onChange }) => (
    <div className="flex flex-wrap gap-x-6 gap-y-8 ml-6 mb-12 mt-8">
        {colors.map((c) => (
            <ColorSwatch key={c} color={c} onClick={() => onChange(c)} />
        ))}
    </div>
);
