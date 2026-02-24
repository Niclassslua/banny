import { ReactNode } from "react";

import { ColorSwatch } from "../atoms";

interface Props {
    colors: string[];
    onChange: (c: string) => void;
    selectedColor?: string;
    children?: ReactNode;
}

export const ColorPalettePicker: React.FC<Props> = ({ colors, onChange, selectedColor, children }) => (
    <div className="flex flex-wrap items-center gap-3">
        {colors.map((c) => (
            <ColorSwatch key={c} color={c} onClick={() => onChange(c)} selected={selectedColor === c} />
        ))}
        {children}
    </div>
);
