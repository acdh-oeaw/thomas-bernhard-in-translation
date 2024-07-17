"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { type ComponentPropsWithoutRef, Fragment } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	Collection as AriaCollection,
	Header as AriaHeader,
	ListBox as AriaListBox,
	ListBoxItem as AriaListBoxItem,
	type ListBoxItemProps as AriaListBoxItemProps,
	type ListBoxProps as AriaListBoxProps,
	Popover as AriaPopover,
	type PopoverProps as AriaPopoverProps,
	Section as AriaSection,
	Select as AriaSelect,
	SelectValue as AriaSelectValue,
	type SelectValueProps as AriaSelectValueProps,
	Separator as AriaSeparator,
	type SeparatorProps as AriaSeparatorProps,
} from "react-aria-components";

// import { forwardRef } from "@/lib/forward-ref";
import { cn } from "@/lib/styles";

export const Select = AriaSelect;

export const SelectSection = AriaSection;

export const SelectCollection = AriaCollection;

export function SelectValue<T extends object>({ className, ...props }: AriaSelectValueProps<T>) {
	return (
		<AriaSelectValue
			className={(values) => {
				return cn(
					"data-[placeholder]:text-on-muted",
					typeof className === "function" ? className(values) : className,
				);
			}}
			{...props}
		/>
	);
}

export function SelectTrigger({ className, children, ...props }: AriaButtonProps) {
	return (
		<AriaButton
			className={(values) => {
				return cn(
					"flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-on-muted focus:outline-none focus:ring-1 focus:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-50",
					typeof className === "function" ? className(values) : className,
				);
			}}
			{...props}
		>
			{(values) => {
				return (
					<Fragment>
						{typeof children === "function" ? children(values) : children}
						<ChevronsUpDownIcon className="size-4 opacity-50" />
					</Fragment>
				);
			}}
		</AriaButton>
	);
}

export function SelectPopover({ className, offset = 0, ...props }: AriaPopoverProps) {
	return (
		<AriaPopover
			className={(values) => {
				return cn(
					"relative z-50 w-[--trigger-width] min-w-32 overflow-y-auto rounded-md border bg-overlay text-on-overlay shadow-md data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2",
					"data-[placement=bottom]:translate-y-1 data-[placement=left]:-translate-x-1 data-[placement=right]:translate-x-1 data-[placement=top]:-translate-y-1",
					typeof className === "function" ? className(values) : className,
				);
			}}
			offset={offset}
			{...props}
		/>
	);
}

export function SelectContent<T extends object>({ className, ...props }: AriaListBoxProps<T>) {
	return <AriaListBox className={cn("p-1", className)} {...props} />;
}

export function SelectHeader({ className, ...props }: ComponentPropsWithoutRef<typeof AriaHeader>) {
	return <AriaHeader className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />;
}

export function SelectItem({ className, children, ...props }: AriaListBoxItemProps) {
	return (
		<AriaListBoxItem
			className={(values) => {
				return cn(
					"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-on-accent",
					typeof className === "function" ? className(values) : className,
				);
			}}
			{...props}
		>
			{(values) => {
				return (
					<Fragment>
						{values.isSelected ? (
							<span className="absolute right-2 flex size-4 items-center justify-center">
								<CheckIcon className="size-4" />
							</span>
						) : null}
						{typeof children === "function" ? children(values) : children}
					</Fragment>
				);
			}}
		</AriaListBoxItem>
	);
}

export function SelectSeparator({ className, ...props }: AriaSeparatorProps) {
	return <AriaSeparator className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />;
}

export type { AriaPopoverProps as SelectPopoverProps };
