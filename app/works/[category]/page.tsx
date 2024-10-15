"use client";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useTranslations } from "next-intl";

import { InstantSearch } from "@/components/instantsearch";
import { MainContent } from "@/components/main-content";
import { SingleRefinementList } from "@/components/single-refinement-list";

interface WorksPageProps {
	params: {
		category: string;
	};
}

export default function WorksPage(props: WorksPageProps) {
	const ct = useTranslations("BernhardCategories");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const categoryLabel = ct(props.params.category as any);
	const t = useTranslations("SearchPage");

	return (
		<MainContent>
			<InstantSearch
				// 'category' values in the database are stored as the english category strings, not the URL slugs
				filters={{ "contains.work.category": categoryLabel }}
				queryArgsToMenuFields={{ language: "language", work: "contains.work.yeartitle" }}
				refinementDropdowns={{ language: `${t("all")} ${t("filter_by.language")}` }}
			>
				<SingleRefinementList
					allLabel={categoryLabel}
					attribute={"contains.work.yeartitle"}
					// format as title (year) instead of showing facet count
					refinementArgs={{
						// workaround like https://github.com/algolia/instantsearch/issues/2568
						transformItems: (items: Array<RefinementListItem>) => {
							return items.map((item) => {
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								item.label = Number.isNaN(parseInt(item.label[0]!))
									? item.label.slice(4)
									: `${item.label.slice(4)} (${item.label.slice(0, 4)})`;
								return item;
							});
						},
					}}
				/>
			</InstantSearch>
		</MainContent>
	);
}
