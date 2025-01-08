"use client";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Results } from "@/components/instantsearch/results";
import { SingleRefinementDropdown } from "@/components/instantsearch/single-refinement-dropdown";
import { SingleRefinementList } from "@/components/instantsearch/single-refinement-list";
import { ThomasBernhardInstantSearchProvider } from "@/components/instantsearch/thomas-bernhard/thomasbernhard-instantsearchprovider";
import { MainContent } from "@/components/main-content";
import { getWorks } from "@/lib/data";
import type { BernhardWork, Category } from "@/lib/model";

interface WorksPageProps {
	params: {
		category: string;
		id?: string;
	};
}

export default function WorksPage(props: WorksPageProps) {
	const t = useTranslations("InstantSearch");
	const ct = useTranslations("BernhardCategories");
	const tl = useTranslations("Languages");

	// TODO validate category
	const category = props.params.category;
	const categoryLabel = ct(category as Category);

	// get id -> work info dictionary once on pageload
	const [works, setWorks] = useState({} as Record<string, BernhardWork>);
	useEffect(() => {
		const get = async () => {
			setWorks(await getWorks(category as Category));
		};
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		get();
	}, [category]);

	return (
		<ThomasBernhardInstantSearchProvider
			filters={`contains.work.category:=${category}`}
			pageName={category} // hack
			pathnameField="contains.work.id"
			queryArgsToMenuFields={{ language: "language" }}
		>
			<MainContent>
				<div className="grid h-full grid-cols-[25%_75%] gap-6 px-2">
					<div className="relative h-full">
						<SingleRefinementList
							allLabel={categoryLabel}
							attribute={"contains.work.id"}
							// format as title (year) instead of showing facet count
							refinementArgs={{
								// workaround like https://github.com/algolia/instantsearch/issues/2568
								transformItems: (items: Array<RefinementListItem>) => {
									return (
										items
											// the refinement may contain out-of-category works which are contained in
											// publications which also contain works of this category (and therefore show up
											// in the filtered search)
											.filter((item) => {
												return item.value in works;
											})
											.sort((a, b) => {
												const ya = works[a.value]!.year;
												const yb = works[b.value]!.year;
												if (!ya) {
													return 1;
												} else if (!yb) {
													return -1;
												} else {
													return ya - yb;
												}
											})
											.map((item) => {
												const work = works[item.value]!;
												item.label = work.short_title ?? work.title;
												if (work.year) {
													item.label += ` (${work.year.toString()})`;
												}
												return item;
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
