"use client";

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Button as HeadlessButton } from "@headlessui/react";
import clsx from "clsx";

import type { ButtonSize, ButtonVariant } from "@/utils/buttonStyles";
import { buttonClass } from "@/utils/buttonStyles";

type HeadlessButtonProps = ComponentPropsWithoutRef<typeof HeadlessButton>;

export type CreatorButtonProps = Omit<HeadlessButtonProps, "className"> & {
    variant: ButtonVariant;
    size?: ButtonSize;
    className?: string;
};

const CreatorButton = forwardRef<HTMLButtonElement, CreatorButtonProps>(
    ({ variant, size, className, ...props }, ref) => (
        <HeadlessButton
            {...props}
            ref={ref}
            className={clsx(buttonClass(variant, size), className)}
        />
    ),
);

CreatorButton.displayName = "CreatorButton";

export default CreatorButton;
