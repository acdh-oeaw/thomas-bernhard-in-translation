"use client";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useTranslations } from "next-intl";

import { InstantSearchView } from "@/components/instantsearch-view";
import { MainContent } from "@/components/main-content";
import { SingleRefinementList } from "@/components/single-refinement-list";

interface WorksPageProps {
	params: {
		id_or_category: string;
	};
}

export default function WorksPage(props: WorksPageProps) {
	const ct = useTranslations("BernhardCategories");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const categoryLabel = ct(props.params.id_or_category as any);
	const t = useTranslations("InstantSearch");

	return (
		<MainContent className="m-auto max-w-screen-xl">
			<InstantSearchView
				filters={{ "contains.work.category": props.params.id_or_category }}
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
							return items
								.filter((item) => {
									return item.label.startsWith(props.params.id_or_category);
								})
								.map((item) => {
									const [_cat, year, title] = item.label.split("$");
									item.label = Number.isNaN(parseInt(year!)) ? title! : `${title!} (${year!})`;
									return item;
								});
						},
					}}
				/>
			</InstantSearchView>
		</MainContent>
	);
}
