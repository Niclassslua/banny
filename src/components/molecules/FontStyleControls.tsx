import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS }
    from "react-icons/md";
import {GlassButton} from "../atoms";
import { Style } from "@/types/Style";

interface Props {
    value: Style[];
    toggleStyle: (s: Style) => void;
}

export const FontStyleControls: React.FC<Props> = ({ value, toggleStyle }) => {
    const isActive = (s: Style) => value.includes(s);

    return (
        <div className="flex ml-4 mb-12 mt-8" style={{columnGap: "4.3rem"}}>
            <GlassButton active={isActive("bold")}        onClick={() => toggleStyle("bold")}        aria-label="Fett">          <MdFormatBold className="text-xl" />        </GlassButton>
            <GlassButton active={isActive("italic")}      onClick={() => toggleStyle("italic")}      aria-label="Kursiv">        <MdFormatItalic className="text-xl" />      </GlassButton>
            <GlassButton active={isActive("underline")}   onClick={() => toggleStyle("underline")}   aria-label="Unterstrichen"> <MdFormatUnderlined className="text-xl" />   </GlassButton>
            <GlassButton active={isActive("strikethrough")} onClick={() => toggleStyle("strikethrough")} aria-label="Durchgestrichen"> <MdStrikethroughS className="text-xl" /> </GlassButton>
        </div>
    );
};
