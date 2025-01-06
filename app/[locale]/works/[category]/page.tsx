"use client";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useTranslations } from "next-intl";

import { Results } from "@/components/instantsearch/results";
import { SingleRefinementDropdown } from "@/components/instantsearch/single-refinement-dropdown";
import { SingleRefinementList } from "@/components/instantsearch/single-refinement-list";
import { ThomasBernhardInstantSearchProvider } from "@/components/instantsearch/thomas-bernhard/thomasbernhard-instantsearchprovider";
import { MainContent } from "@/components/main-content";

interface WorksPageProps {
	params: {
		category: string;
	};
}

export default function WorksPage(props: WorksPageProps) {
	const ct = useTranslations("BernhardCategories");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const categoryLabel = ct(props.params.category as any);
	// TODO validate category
	const t = useTranslations("InstantSearch");
	const tl = useTranslations("Languages");

	// TODO get id -> year+title dictionaries from backend

	return (
		<ThomasBernhardInstantSearchProvider
			filters={`contains.work.category:=${props.params.category}`}
			// pageName={props.params.category} // hack
			// pathnameField="contains.work.yeartitle"
			queryArgsToMenuFields={{ work: "contains.work.yeartitle", language: "language" }}
		>
			<MainContent>
				<div className="grid h-full grid-cols-[25%_75%] gap-6 px-2">
					<div className="relative h-full">
						<SingleRefinementList
							allLabel={categoryLabel}
							attribute={"contains.work.yeartitle"}
							// format as title (year) instead of showing facet count
							refinementArgs={{
								// workaround like https://github.com/algolia/instantsearch/issues/2568
								transformItems: (items: Array<RefinementListItem>) => {
									return items
										.filter((item) => {
											return item.label.startsWith(props.params.category);
										})
										.map((item) => {
											const [year, title] = item.label.split("_");
											item.label = Number.isNaN(parseInt(year!)) ? title! : `${title!} (${year!})`;
											return item;
										});
								},
							}}
						/>
					</div>
					<Results className="h-full overflow-y-auto">
						<SingleRefinementDropdown
							allLabel={`${t("all")} ${t("filter_by.language")}`}
							attribute={"language"}
							className="min-w-40"
							refinementArgs={{
								transformItems: (items: Array<RefinementListItem>) => {
									return items
										.map((item) => {
											// eslint-disable-next-line @typescript-eslint/no-explicit-any
											item.label = `${tl(item.label as any).toLowerCase()} (${item.count.toString()})`;
											return item;
										})
										.sort((a, b) => {
											return a.label.localeCompare(b.label);
										});
								},
							}}
						/>
					</Results>
				</div>
			</MainContent>
		</ThomasBernhardInstantSearchProvider>
	);
}
