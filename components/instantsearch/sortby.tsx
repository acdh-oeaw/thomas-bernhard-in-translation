import { ArrowDownAZ, ArrowDownUp, CalendarArrowDown, CalendarArrowUp } from "lucide-react";
import { type MessageKeys, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Label } from "react-aria-components";
import { useSortBy } from "react-instantsearch";

import { collectionName } from "@/lib/data";

import { Select, SelectContent, SelectItem, SelectPopover, SelectTrigger } from "../ui/select";

interface InstantSearchSortByProps {
	sortOptions: Array<string>;
}

function SortIcon(props: { field: string | undefined; size: number }): ReactNode {
	switch (props.field?.split("/")[2]) {
		case "year:desc":
			return <CalendarArrowUp size={props.size} />; // alternatively: ClockArrow?
		case "year:asc":
			return <CalendarArrowDown size={props.size} />;
		case "title:asc":
			return <ArrowDownAZ size={props.size} />;
		default:
			return <ArrowDownUp size={props.size} />;
	}
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
					<SortIcon
						field={
							sortByItems.find(({ value }) => {
								return value === currentRefinement;
							})?.value
						}
						size={20}
					/>
				}
			</SelectTrigger>
			<SelectPopover>
				<SelectContent>
					{options.map((o) => {
						return (
							<SelectItem key={o.value} id={o.value} textValue={o.label}>
								<SortIcon field={o.value} size={20} />
								<span className="sr-only">{o.label}</span>
							</SelectItem>
						);
					})}
				</SelectContent>
			</SelectPopover>
		</Select>
	);
}
