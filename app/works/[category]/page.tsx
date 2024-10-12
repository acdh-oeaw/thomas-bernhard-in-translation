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
	const t = useTranslations("BernhardCategories");

	return (
		<MainContent>
			<InstantSearch
				// 'category' values in the database are stored as the english category strings, not the URL slugs
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				filters={{ "contains.work.category": t(props.params.category as any) }}
				queryArgsToRefinementFields={{ work: "contains.work.yeartitle" }}
			>
				<SingleRefinementList
					attribute={"contains.work.yeartitle"}
					// format as title (year) instead of showing facet count
					refinementArgs={{
						// workaround like https://github.com/algolia/instantsearch/issues/2568
						transformItems: (items: Array<RefinementListItem>) => {
							return items.map((item) => {
								item.label = `${item.label.slice(4)} (${item.label.slice(0, 4)})`;
								return item;
							});
						},
					}}
				/>
			</InstantSearch>
		</MainContent>
	);
}
