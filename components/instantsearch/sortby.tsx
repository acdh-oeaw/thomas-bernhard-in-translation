import { ArrowUpDown, type LucideIcon } from "lucide-react";
import { type MessageKeys, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Label } from "react-aria-components";
import { useSortBy } from "react-instantsearch";

import { collectionName } from "@/lib/data";

import { Select, SelectContent, SelectItem, SelectPopover, SelectTrigger } from "../ui/select";

interface InstantSearchSortByProps {
	sortOptions: Record<string, LucideIcon>;
}

export function InstantSearchSortBy(props: InstantSearchSortByProps): ReactNode {
	const t = useTranslations("InstantSearch");

	const sortByItems = Object.keys(props.sortOptions).map((field) => {
		return {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			label: t(`sort.${field}` as MessageKeys<any, any>),
			value: `${collectionName}/sort/${field}`,
		};
	});

	const { currentRefinement, options, refine } = useSortBy({
		items: sortByItems,
	});

	const getIcon = (value: string): LucideIcon => {
		return props.sortOptions[value.split("/")[2]!] ?? ArrowUpDown;
	};

	const SelectedIcon = getIcon(currentRefinement);
	return (
		<Select
			defaultSelectedKey={currentRefinement}
			onSelectionChange={(selected) => {
				refine(selected as string);
			}}
		>
			<Label className="sr-only">sort order</Label>
			<SelectTrigger>
				<SelectedIcon size={20} />
			</SelectTrigger>
			<SelectPopover className="w-fit">
				<SelectContent>
					{options.map((o) => {
						const Icon = getIcon(o.value);
						return (
							<SelectItem key={o.value} className="gap-2" id={o.value} textValue={o.label}>
								<Icon size={20} />
								<span>{o.label}</span>
							</SelectItem>
						);
					})}
				</SelectContent>
			</SelectPopover>
		</Select>
	);
}
