import LiquidGlass from '@nkzw/liquid-glass';
import clsx from 'clsx';
import React, {useRef} from 'react';

interface GlassButtonProps {
    active?: boolean,
    onClick: () => void,
    style?: React.CSSProperties,
    children: React.ReactNode,
    isText?: boolean
    padding?: string
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    active = false,
    onClick,
    style,
    children,
    isText,
    padding = "16px 16px",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className="inline-block" style={style}>
            <LiquidGlass
                aberrationIntensity={10}
                blurAmount={1}
                borderRadius={15}
                displacementScale={0}
                elasticity={0}
                mode="polar"
                onClick={onClick}
                saturation={active ? 750 : 130}
                className={clsx(
                    'cursor-pointer select-none font-medium text-white'
                )}
                padding={padding}
            >
        <span
            className={clsx(
                isText ? 'inline-block w-[4ch] py-2 text-center tabular-nums' : ''
            )}
            style={isText ? { fontSize: '1rem' } : undefined}
        >
          {children}
        </span>
            </LiquidGlass>
        </div>
    );
};
