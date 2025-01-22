"use client";
import { cn } from "@acdh-oeaw/style-variants";
import type { MenuItem } from "instantsearch.js/es/connectors/menu/connectMenu";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import type { ReactNode } from "react";
import { useMenu, type UseMenuProps } from "react-instantsearch";

interface SingleRefinementListProps {
	attribute: string;
	allLabel?: string;
	pathname?: string;
	refinementArgs?: Partial<UseMenuProps>;
	className?: string;
}

const defaultTransformItems = (items: Array<RefinementListItem>) => {
	return items.map((item) => {
		item.label = `${item.label} (${item.count.toString()})`;
		return item;
	});
};

interface MenuItemProps {
	className?: string;
	item: MenuItem;
	refine: (value: string) => void;
	// pathname?: string;
}

function MenuItem(props: MenuItemProps): ReactNode {
	const { className, item, refine } = props;
	return (
		<label
			key={item.label}
			className={cn(
				"block p-1 text-right leading-tight focus-within:outline focus-within:outline-2",
				className,
			)}
		>
			<input
				checked={item.isRefined}
				className="sr-only"
				name="refinement"
				onChange={() => {
					refine(item.value);
				}}
				type="radio"
			/>
			<span
				className={cn(
					"hover:cursor-pointer hover:text-[--color-link-hover]",
					item.isRefined ? "text-[--color-link-active]" : "text-[--color-link]",
				)}
			>
				{item.label}
			</span>
		</label>
	);
}

// a refinement list that is alphabetically ordered and only allows filtering for one value
export function SingleRefinementList(props: SingleRefinementListProps) {
	const { attribute, allLabel, refinementArgs, className } = props;
	const { items, refine } = useMenu({
		attribute: attribute,
		limit: 1000,
		sortBy: ["name"],
		transformItems: defaultTransformItems,
		...refinementArgs,
	});

	return (
		<div className="absolute grid size-full grid-rows-[auto_1fr] overflow-y-auto">
			{allLabel ? (
				<div className="mt-1 px-2">
					<label
						key="all"
						className={cn(
							"block text-right lowercase focus-within:outline focus-within:outline-2",
							className,
						)}
					>
						<input
							checked={items.every((i) => {
								return !i.isRefined;
							})}
							className="sr-only"
							name="refinement"
							onChange={() => {
								refine("");
							}}
							type="radio"
						/>
						<span
							className={cn(
								"text-xl hover:cursor-pointer hover:text-[--color-link-hover]",
								items.some((i) => {
									return i.isRefined;
								})
									? "text-[--color-link]"
									: "text-[--color-link-active]",
							)}
						>
							{allLabel}
						</span>
					</label>
				</div>
			) : null}
			<div className="h-full p-2">
				{items.map((item) => {
					return (
						<MenuItem
							key={item.value}
							className={className}
							// createURL={createURL}
							item={item}
							// pathname={pathname}
							refine={refine}
						/>
					);
				})}
			</div>
		</div>
	);
}
