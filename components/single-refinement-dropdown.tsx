"use client";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { Label } from "react-aria-components";
import { useMenu, type UseMenuProps } from "react-instantsearch";

import { Select, SelectContent, SelectItem, SelectPopover, SelectTrigger } from "./ui/select";

interface SingleRefinementDropdownProps {
	attribute: string;
	allLabel: string;
	refinementArgs?: Partial<UseMenuProps>;
	className?: string;
}

const defaultTransformItems = (items: Array<RefinementListItem>) => {
	return items.map((item) => {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		item.label = `${item.label} (${item.count})`;
		return item;
	});
};

// a refinement dropdown that is alphabetically ordered
export function SingleRefinementDropdown(props: SingleRefinementDropdownProps) {
	const { items, refine } = useMenu({
		attribute: props.attribute,
		limit: 1000,
		sortBy: ["name"],
		transformItems: defaultTransformItems,
		...props.refinementArgs,
	});

	return (
		<Select
			onSelectionChange={(selected) => {
				// TODO better to do getElementById and read key, than use id directly
				refine(selected === "all" ? "" : (selected as string));
			}}
		>
			<Label className="sr-only">sort order</Label>
			<SelectTrigger className={props.className}>
				{items.find((i) => {
					return i.isRefined;
				})?.label ?? props.allLabel}
			</SelectTrigger>
			<SelectPopover>
				<SelectContent>
					<SelectItem key={"all"} className="lowercase" id={"all"} textValue={props.allLabel}>
						{props.allLabel}
					</SelectItem>
					{items.map((o) => {
						return (
							<SelectItem
								key={o.value}
								className={props.className}
								id={o.value}
								textValue={o.label}
							>
								{o.label}
							</SelectItem>
						);
					})}
				</SelectContent>
			</SelectPopover>
		</Select>
	);
}
