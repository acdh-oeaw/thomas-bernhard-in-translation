"use client";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useTranslations } from "next-intl";
import { useRefinementList, type UseRefinementListProps } from "react-instantsearch";

interface SingleRefinementListProps {
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

// a refinement list that is alphabetically ordered and only allows filtering for one value
export function SingleRefinementList(props: SingleRefinementListProps) {
	const t = useTranslations("SearchPage");
	const attributePath = props.attribute.split(".");
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	const attributeKey = `filter_by.${attributePath[attributePath.length - 1]}`;

	const { items, refine, searchForItems } = useRefinementList({
		attribute: props.attribute,
		limit: 1000,
		sortBy: ["name"],
		transformItems: defaultTransformItems,
		...props.refinementArgs,
	});

	return (
		<>
			<input
				autoCapitalize="off"
				autoComplete="off"
				autoCorrect="off"
				maxLength={50}
				onChange={(event) => {
					searchForItems(event.currentTarget.value);
				}}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				placeholder={`${t("filter")} ${t(attributeKey as any)}`}
				spellCheck={false}
				type="search"
			/>
			<ul>
				{items.map((item) => {
					return (
						<li key={item.label} className="py-0.5">
							<label>
								<input
									checked={item.isRefined}
									className="sr-only"
									onChange={() => {
										// first remove ALL active refinements
										items
											.filter((i) => {
												return i.isRefined;
											})
											.forEach((i) => {
												refine(i.value);
											});
										// then add new one (if it wasn't already selected when onChange was triggered)
										if (!item.isRefined) {
											refine(item.value);
										}
									}}
									type="checkbox"
								/>
								<span
									className={`hover:cursor-pointer ${item.isRefined ? "font-medium text-on-background/80" : "text-on-background/60"}`}
								>
									{item.label}
								</span>
							</label>
						</li>
					);
				})}
			</ul>
		</>
	);
}
