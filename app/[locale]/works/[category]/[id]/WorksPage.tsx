"use client";
import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useTranslations } from "next-intl";
import * as v from "valibot";

import { Results } from "@/components/instantsearch/results";
import { SingleRefinementDropdown } from "@/components/instantsearch/single-refinement-dropdown";
import { SingleRefinementList } from "@/components/instantsearch/single-refinement-list";
import { MainContent } from "@/components/main-content";
import { type BernhardWork, type Category, otherCategories, proseCategories } from "@/lib/model";

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
	if (
		!v.is(
			v.pipe(
				v.string(),
				v.check((c) => {
					return c in otherCategories || c in proseCategories;
				}),
			),
			category,
		)
	) {
		// TODO return not found
	}
	const categoryLabel = ct(category);

	const transformItems = (items: Array<RefinementListItem>) => {
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
					item.label = work.short_title ?? work.title;
					return item;
				})
				.sort((a, b) => {
					return a.label.localeCompare(b.label);
				})
		);
	};

	return (
		<MainContent>
			<div className="grid h-full grid-cols-[25%_75%] gap-6 px-2">
				<div className="relative h-full">
					<SingleRefinementList
						allLabel={categoryLabel}
						attribute={"contains.work.id"}
						// pathname={`/works/${category}`}
						// format as title (year) instead of showing facet count
						refinementArgs={{
							transformItems,
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
	);
}
