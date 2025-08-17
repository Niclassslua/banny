import {
    MdAlignHorizontalLeft,
    MdAlignHorizontalCenter,
    MdAlignHorizontalRight,
    MdFormatAlignJustify,
} from "react-icons/md";
import {GlassButton, IconButton} from "../atoms";
import {useState} from "react";

type Align = "left" | "center" | "right" | "justify";

interface Props {
    value: Align;
    onChange: (v: Align) => void;
}

export const AlignmentControls: React.FC<{ onChange: (v: Align) => void }> = ({ onChange }) => {
    const [local, setLocal] = useState<Align>("left");

    const handle = (v: Align) => {
        setLocal(v);
        onChange(v);
    };

    return (
        <div className="flex ml-4 mb-12 mt-8" style={{columnGap: "4.3rem"}}>
            <GlassButton active={local === "left"}   onClick={() => handle("left")}   aria-label="Links"><MdAlignHorizontalLeft /></GlassButton>
            <GlassButton active={local === "center"} onClick={() => handle("center")} aria-label="Zentriert"><MdAlignHorizontalCenter /></GlassButton>
            <GlassButton active={local === "right"}  onClick={() => handle("right")}  aria-label="Rechts"><MdAlignHorizontalRight /></GlassButton>
            <GlassButton active={local === "justify"}onClick={() => handle("justify")}aria-label="Blocksatz"><MdFormatAlignJustify /></GlassButton>
        </div>
    );
};
