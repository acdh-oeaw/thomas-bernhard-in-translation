"use client";
import { useTranslations } from "next-intl";
import { RefinementList } from "react-instantsearch";

// a refinement list that is alphabetically ordered and only allows filtering for one value
export function SingleRefinementList({ attribute }: { attribute: string }) {
	const t = useTranslations("SearchPage");
	const attributePath = attribute.split(".");
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	const attributeKey = `filter_by.${attributePath[attributePath.length - 1]}`;
	return (
		<RefinementList
			attribute={attribute}
			classNames={{
				count: 'before:content-["("] after:content-[")"]',
				disabledShowMore: "hidden",
				labelText: "px-1",
				root: "p-2",
			}}
			limit={1000}
			searchable={true}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			searchablePlaceholder={`${t("filter")} ${t(attributeKey as any)}`}
			sortBy={["name"]}
		/>
	);
}
