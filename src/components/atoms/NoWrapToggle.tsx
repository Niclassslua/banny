import { MdWrapText } from "react-icons/md";
import { GlassButton } from "@/components/atoms/GlassButton";

interface Props {
    active: boolean;
    onToggle: () => void;
}

export const NoWrapToggle: React.FC<Props> = ({ active, onToggle }) => (
    <div className="flex">
        <GlassButton active={active} onClick={onToggle} aria-label="Zeilenumbruch umschalten" padding="12px 14px">
            <MdWrapText className="text-xl" />
        </GlassButton>
    </div>
);
