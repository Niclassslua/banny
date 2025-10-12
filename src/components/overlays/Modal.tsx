"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    labelledBy?: string;
    children: React.ReactNode;
    className?: string;
    overlayClassName?: string;
    preventClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    labelledBy,
    children,
    className,
    overlayClassName,
    preventClose = false,
}) => {
    const [mounted, setMounted] = useState(false);
    const overlayRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !preventClose) {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose, preventClose]);

    if (!mounted || !isOpen) {
        return null;
    }

    return createPortal(
        <div
            ref={overlayRef}
            className={clsx(
                "fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8",
                overlayClassName,
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            onMouseDown={(event) => {
                if (preventClose) {
                    return;
                }

                if (event.target === overlayRef.current) {
                    onClose();
                }
            }}
        >
            <div
                className={clsx(
                    "relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 shadow-[0_40px_120px_rgba(10,10,14,0.85)]",
                    className,
                )}
                onMouseDown={(event) => event.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body,
    );
};
