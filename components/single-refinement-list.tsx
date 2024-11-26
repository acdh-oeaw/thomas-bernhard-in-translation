"use client";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useMenu, type UseMenuProps } from "react-instantsearch";

interface SingleRefinementListProps {
	attribute: string;
	allLabel?: string;
	refinementArgs?: Partial<UseMenuProps>;
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
		<div className="sticky top-0 grid max-h-screen grid-rows-[auto_1fr]">
			{props.allLabel ? (
				<div className="px-2">
					<label
						key="all"
						className="block py-0.5 text-right focus-within:outline focus-within:outline-2"
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
							className={`text-xl hover:cursor-pointer ${
								items.every((i) => {
									return !i.isRefined;
								})
									? "font-medium text-on-background/80"
									: "text-on-background/60"
							}`}
						>
							{props.allLabel}
						</span>
					</label>
				</div>
			) : null}
			<div className="my-2 overflow-y-auto px-2">
				{items.map((item) => {
					return (
						<label
							key={item.label}
							className="block py-0.5 text-right focus-within:outline focus-within:outline-2"
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
								className={`hover:cursor-pointer ${item.isRefined ? "font-medium text-on-background/80" : "text-on-background/60"}`}
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
