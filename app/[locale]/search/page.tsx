"use client";

import { useTranslations } from "next-intl";
import { Menu } from "react-instantsearch";

import { InstantSearchView } from "@/components/instantsearch-view";
import { MainContent } from "@/components/main-content";

function FilterMenu(props: { attribute: string }) {
	const t = useTranslations("SearchPage");
	return (
		<>
			<span className="text-lg font-medium">
				{
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					t(props.attribute.replaceAll(".", "_") as any)
				}
			</span>
			<Menu
				attribute={props.attribute}
				classNames={{
					count: 'before:content-["("] after:content-[")"]',
					disabledShowMore: "hidden",
					label: "px-1",
					root: "py-2 text-right",
					selectedItem: "font-bold",
					showMore: "text-sm pb-4",
				}}
				showMore={true}
				showMoreLimit={100}
				sortBy={["count", "name"]}
				// TODO pass translations
				// translations={{
				// showMoreButtonText({ isShowingMore }) {
				// return t(isShowingMore ? 'show less' : 'show more')
				// },
				// }}
			/>
		</>
	);
}

export default function InstantSearchPage() {
	return (
		<MainContent>
			<InstantSearchView
				queryArgsToMenuFields={{
					// the order of elements here determines the order of refinement lists in the UI
					language: "language" as const,
					category: "contains.work.category" as const,
					work: "contains.work.short_title" as const,
					translator: "contains.translators.name" as const,
				}}
			>
				<FilterMenu attribute="language" />
				<FilterMenu attribute="contains.work.short_title" />

				{
					// TODO pass transform
				}
				<FilterMenu attribute="contains.work.category" />

				<FilterMenu attribute="contains.translators.name" />
			</InstantSearchView>
		</MainContent>
	);
}
