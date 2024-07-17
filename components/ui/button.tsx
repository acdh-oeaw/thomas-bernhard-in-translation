"use client";

import type { ElementRef } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	composeRenderProps,
} from "react-aria-components";

import { focusRing } from "@/components/ui/focus-ring";
import { type ForwardedRef, forwardRef } from "@/lib/forward-ref";
import { compose, type VariantProps, variants } from "@/lib/styles";

export const buttonStyles = compose(
	focusRing,
	variants({
		base: "inline-flex cursor-default items-center justify-center whitespace-nowrap rounded-md font-medium transition",
		variants: {
			size: {
				sm: "h-8 rounded-md px-3 text-xs",
				md: "h-9 px-4 py-2 text-sm",
				lg: "h-10 rounded-md px-8 text-sm",
				icon: "size-9",
			},
			variant: {
				primary: "bg-primary text-on-primary shadow-sm hover:bg-primary/90 pressed:bg-primary/80",
				secondary:
					"bg-secondary text-on-secondary shadow-sm hover:bg-secondary/80 pressed:bg-secondary/70",
				negative:
					"bg-negative text-on-negative shadow-sm hover:bg-negative/90 pressed:bg-negative/80",
				outline:
					"border border-input bg-background shadow-sm hover:bg-accent hover:text-on-accent pressed:bg-accent/90",
				ghost: "hover:bg-accent hover:text-on-accent pressed:bg-accent/90",
				// link: "text-primary underline-offset-4 hover:underline",
			},
			isDisabled: {
				true: "pointer-events-none opacity-50 forced-colors:text-[GrayText]",
			},
		},
		defaultVariants: {
			size: "md",
			variant: "primary",
		},
	}),
);

export type ButtonStyles = VariantProps<typeof buttonStyles>;

export interface ButtonProps extends AriaButtonProps, ButtonStyles {}

export const Button = forwardRef(function Button(
	props: ButtonProps,
	forwardedRef: ForwardedRef<ElementRef<typeof AriaButton>>,
) {
	const { children, className, size, variant, ...rest } = props;

	return (
		<AriaButton
			ref={forwardedRef}
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return buttonStyles({ ...renderProps, className, size, variant });
			})}
		>
			{children}
		</AriaButton>
	);
});
