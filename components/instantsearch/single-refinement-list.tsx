"use client";
import { cn } from "@acdh-oeaw/style-variants";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useMenu, type UseMenuProps } from "react-instantsearch";

interface SingleRefinementListProps {
	attribute: string;
	allLabel?: string;
	refinementArgs?: Partial<UseMenuProps>;
	className?: string;
}

const defaultTransformItems = (items: Array<RefinementListItem>) => {
	return items.map((item) => {
		item.label = `${item.label} (${item.count.toString()})`;
		return item;
	});
};

// a refinement list that is alphabetically ordered and only allows filtering for one value
export function SingleRefinementList(props: SingleRefinementListProps) {
	const { items, refine } = useMenu({
		attribute: props.attribute,
		limit: 1000,
		sortBy: ["name"],
		transformItems: defaultTransformItems,
		...props.refinementArgs,
	});

	return (
		<div className="absolute grid h-full grid-rows-[auto_1fr] overflow-y-auto">
			{props.allLabel ? (
				<div className="mt-1 px-2">
					<label
						key="all"
						className={cn(
							"block text-right focus-within:outline focus-within:outline-2",
							props.className,
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
								items.every((i) => {
									return !i.isRefined;
								})
									? "font-medium text-[--color-link-active]"
									: "text-[--color-link]",
							)}
						>
							{props.allLabel}
						</span>
					</label>
				</div>
			) : null}
			<div className="h-full p-2">
				{items.map((item) => {
					return (
						<label
							key={item.label}
							className={cn(
								"block py-1 text-right leading-tight focus-within:outline focus-within:outline-2",
								props.className,
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
									item.isRefined ? "font-medium text-[--color-link-active]" : "text-[--color-link]",
								)}
							>
								{item.label}
							</span>
						</label>
					);
				})}
			</div>
		</div>
	);
}
