"use client";

import { CheckIcon, DotIcon } from "lucide-react";
import { type ComponentPropsWithoutRef, Fragment, type HTMLAttributes } from "react";
import {
	Header as AriaHeader,
	Keyboard as AriaKeyboard,
	Menu as AriaMenu,
	MenuItem as AriaMenuItem,
	type MenuItemProps as AriaMenuItemProps,
	type MenuProps as AriaMenuProps,
	MenuTrigger as AriaMenuTrigger,
	Popover as AriaPopover,
	type PopoverProps as AriaPopoverProps,
	Section as AriaSection,
	Separator as AriaSeparator,
	type SeparatorProps as AriaSeparatorProps,
} from "react-aria-components";

// import { forwardRef } from "@/lib/forward-ref";
import { cn } from "@/lib/styles";

export const MenuTrigger = AriaMenuTrigger;

export const MenuSection = AriaSection;

export function MenuPopover({ className, offset = 4, ...props }: AriaPopoverProps) {
	return (
		<AriaPopover
			className={(values) => {
				return cn(
					"z-50 min-w-32 overflow-y-auto rounded-md border bg-overlay p-1 text-on-overlay shadow-md",
					"data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2",
					typeof className === "function" ? className(values) : className,
				);
			}}
			offset={offset}
			{...props}
		/>
	);
}

export function Menu<T extends object>({ className, ...props }: AriaMenuProps<T>) {
	return <AriaMenu className={cn("outline-none", className)} {...props} />;
}

export interface MenuItemProps extends AriaMenuItemProps {
	inset?: boolean;
}

export function MenuItem({ className, inset, ...props }: MenuItemProps) {
	return (
		<AriaMenuItem
			className={(values) => {
				return cn(
					"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-on-accent",
					inset && "pl-8",
					typeof className === "function" ? className(values) : className,
				);
			}}
			{...props}
		/>
	);
}

export function MenuCheckboxItem({ className, children, ...props }: MenuItemProps) {
	return (
		<AriaMenuItem
			className={(values) => {
				return cn(
					"relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-on-accent",
					typeof className === "function" ? className(values) : className,
				);
			}}
			{...props}
		>
			{(values) => {
				return (
					<Fragment>
						<span className="absolute left-2 flex size-4 items-center justify-center">
							{values.isSelected ? <CheckIcon className="size-4" /> : null}
						</span>

						{typeof children === "function" ? children(values) : children}
					</Fragment>
				);
			}}
		</AriaMenuItem>
	);
}

export function MenuRadioItem({ className, children, ...props }: MenuItemProps) {
	return (
		<AriaMenuItem
			className={cn(
				"relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-on-accent",
				className,
			)}
			{...props}
		>
			{(values) => {
				return (
					<Fragment>
						<span className="absolute left-2 flex size-3.5 items-center justify-center">
							{values.isSelected ? <DotIcon className="size-4 fill-current" /> : null}
						</span>
						{typeof children === "function" ? children(values) : children}
					</Fragment>
				);
			}}
		</AriaMenuItem>
	);
}

export interface MenuHeaderProps extends ComponentPropsWithoutRef<typeof AriaHeader> {
	inset?: boolean;
	separator?: boolean;
}

export function AriaMenuHeader({ className, inset, separator = false, ...props }: MenuHeaderProps) {
	return (
		<AriaHeader
			className={cn(
				"py-1.5 text-sm font-semibold",
				inset && "pl-8",
				separator ? "-mx-1 mb-1 border-b border-b-border px-3 pb-2.5" : "px-2",
				className,
			)}
			{...props}
		/>
	);
}

export function MenuSeparator({ className, ...props }: AriaSeparatorProps) {
	return <AriaSeparator className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />;
}

export function MenuKeyboard({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
	return (
		<AriaKeyboard
			className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
			{...props}
		/>
	);
}
