import { MdWrapText } from "react-icons/md";
import { GlassButton } from "@/components/atoms/GlassButton";

interface Props {
    active: boolean;
    onToggle: () => void;
}

export const NoWrapToggle: React.FC<Props> = ({ active, onToggle }) => (
    <div className="flex">
        <GlassButton active={active} onClick={onToggle} aria-label="Zeilenumbruch umschalten" padding="9px 10px">
            <MdWrapText className="text-base" />
        </GlassButton>
    </div>
);
