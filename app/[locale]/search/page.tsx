"use client";

import { useTranslations } from "next-intl";
import { Menu } from "react-instantsearch";

import { InstantSearchView } from "@/components/instantsearch-view";
import { MainContent } from "@/components/main-content";

function FilterMenu(props: { attribute: string }) {
	const t = useTranslations("SearchPage");
	return (
		<>
			<div className="mt-4 text-right text-lg font-medium">
				{
					// TODO if count == 0, hide altogether
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					t(props.attribute.replaceAll(".", "_") as any)
				}
			</div>
			<Menu
				attribute={props.attribute}
				classNames={{
					count: 'before:content-["("] after:content-[")"]',
					disabledShowMore: "hidden",
					label: "px-1",
					list: "text-[--color-link]",
					root: "py-2 text-right",
					selectedItem: "font-bold text-[--color-link-active]",
					showMore: "text-sm pb-4 text-[--color-link]",
				}}
				showMore={true}
				showMoreLimit={50}
				sortBy={["isRefined", "count", "name"]}
				translations={{
					showMoreButtonText({ isShowingMore }) {
						return t(isShowingMore ? "show less" : "show more");
					},
				}}
			/>
		</>
	);
}

export default function SearchPage() {
	return (
		<MainContent className="mx-auto w-screen max-w-screen-lg p-6">
			<InstantSearchView
				queryArgsToMenuFields={{
					// the order of elements here determines the order of refinement lists in the UI
					language: "language" as const,
					category: "contains.work.category" as const,
					work: "contains.work.short_title" as const,
					translator: "contains.translators.name" as const,
				}}
			>
				<FilterMenu attribute="contains.work.short_title" />

				<FilterMenu attribute="language" />

				{
					// FIXME when changing the query removes a refinement from the list, that refinement
					// should become inactive!? otherwise it's not clear that it's still toggled...
					// TODO pass transform
					// <FilterMenu attribute="contains.work.category" />
				}

				<FilterMenu attribute="contains.translators.name" />
			</InstantSearchView>
		</MainContent>
	);
}
