import { MdWrapText } from "react-icons/md";
import {GlassButton} from "@/components/atoms/GlassButton";

interface Props {
    active: boolean;
    onToggle: () => void;
}

export const NoWrapToggle: React.FC<Props> = ({ active, onToggle }) => (
    <div className="flex gap-x-14 ml-4 mb-12 mt-8">
        <GlassButton
            active={active}
            onClick={onToggle}
            aria-label="Toggle no‑wrap"
        >
            <MdWrapText />
        </GlassButton>
    </div>
);
