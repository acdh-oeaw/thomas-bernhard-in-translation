"use client";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { Label } from "react-aria-components";
import { useRefinementList, type UseRefinementListProps } from "react-instantsearch";

import { Select, SelectContent, SelectItem, SelectPopover, SelectTrigger } from "./ui/select";

interface SingleRefinementDropdownProps {
	attribute: string;
	refinementArgs?: Partial<UseRefinementListProps>;
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
	// const t = useTranslations("SearchPage");

	const { items, refine } = useRefinementList({
		attribute: props.attribute,
		limit: 1000,
		sortBy: ["name"],
		transformItems: defaultTransformItems,
		...props.refinementArgs,
	});

	return (
		<Select
			onSelectionChange={(selected) => {
				// first remove ALL active refinements
				items
					.filter((i) => {
						return i.isRefined;
					})
					.forEach((i) => {
						refine(i.value);
					});
				// TODO better to do getElementById and read key, than use id directly
				if (selected !== "all") {
					refine(selected as string);
				}
			}}
		>
			<Label className="sr-only">sort order</Label>
			<SelectTrigger>
				{items.find((i) => {
					return i.isRefined;
				})?.value ?? "all languages"}
			</SelectTrigger>
			<SelectPopover>
				<SelectContent>
					<SelectItem key={"all"} id={"all"} textValue={"all languages"}>
						all languages
					</SelectItem>
					{items.map((o) => {
						return (
							<SelectItem key={o.value} id={o.value} textValue={o.label}>
								{o.label}
							</SelectItem>
						);
					})}
				</SelectContent>
			</SelectPopover>
		</Select>
	);
}
