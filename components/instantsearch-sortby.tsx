import { type MessageKeys, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Label } from "react-aria-components";
import { useSortBy } from "react-instantsearch";

import { collectionName } from "@/lib/data";

import { Select, SelectContent, SelectItem, SelectPopover, SelectTrigger } from "./ui/select";

interface InstantSearchSortByProps {
	sortOptions: Array<string>;
}

export function InstantSearchSortBy(props: InstantSearchSortByProps): ReactNode {
	const t = useTranslations("InstantSearch");

	const sortByItems = props.sortOptions.map((field) => {
		return {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			label: t(`sort.${field}` as MessageKeys<any, any>),
			value: `${collectionName}/sort/${field}`,
		};
	});

	const { currentRefinement, options, refine } = useSortBy({
		items: sortByItems,
	});
	// enforce initial sort
	if (currentRefinement === collectionName) {
		refine(`${collectionName}/sort/${props.sortOptions[0]!}`);
	}

	return (
		<Select
			defaultSelectedKey={sortByItems[0]?.value}
			onSelectionChange={(selected) => {
				refine(selected as string);
			}}
		>
			<Label className="sr-only">sort order</Label>
			<SelectTrigger>
				{
					sortByItems.find(({ value }) => {
						return value === currentRefinement;
					})?.label
				}
			</SelectTrigger>
			<SelectPopover>
				<SelectContent>
					{options.map((o) => {
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
