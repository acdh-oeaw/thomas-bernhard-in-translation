"use client";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useTranslations } from "next-intl";

import { Results } from "@/components/instantsearch/results";
import { SingleRefinementDropdown } from "@/components/instantsearch/single-refinement-dropdown";
import { SingleRefinementList } from "@/components/instantsearch/single-refinement-list";
import { ThomasBernhardInstantSearchProvider } from "@/components/instantsearch/thomas-bernhard/thomasbernhard-instantsearchprovider";
import { MainContent } from "@/components/main-content";
import type { BernhardWork, Category } from "@/lib/model";

interface WorksPageProps {
	category: Category;
	// id?: string;
	works: Record<string, BernhardWork>;
}

export function WorksPage(props: WorksPageProps) {
	const t = useTranslations("InstantSearch");
	const ct = useTranslations("BernhardCategories");
	const tl = useTranslations("Languages");

	const { category, works } = props;

	return (
		<ThomasBernhardInstantSearchProvider
			filters={`contains.work.category:=${category}`}
			pageName={`works/${category}`}
			pathnameField="contains.work.id"
			queryArgsToMenuFields={{ language: "language" }}
		>
			<MainContent>
				<div className="grid h-full grid-cols-[25%_75%] gap-6 px-2">
					<div className="relative h-full">
						<SingleRefinementList
							allLabel={ct(category)}
							attribute={"contains.work.id"}
							refinementArgs={{
								transformItems: (items: Array<RefinementListItem>) => {
									return (
										items
											// the refinement may contain out-of-category works which are contained in
											// publications which also contain works of this category (and therefore show up
											// in the filtered search)
											.filter((item) => {
												return item.value in works;
											})
											.map((item) => {
												const work = works[item.value]!;
												item.label = work.short_title;
												return item;
											})
											.sort((a, b) => {
												return a.label.localeCompare(b.label);
											})
									);
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
