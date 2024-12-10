"use client";

import { useTranslations } from "next-intl";
import { Menu, type MenuProps } from "react-instantsearch";

import { InstantSearchView } from "@/components/instantsearch-view";
import { MainContent } from "@/components/main-content";

function FilterMenu(props: {
	attribute: string;
	className?: string;
	transformItems?: MenuProps["transformItems"];
}) {
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
					item: "leading-tight py-1",
					label: `px-1 ${props.className ? props.className : ""}`,
					list: "text-[--color-link]",
					root: "py-2 text-right",
					selectedItem: "font-bold text-[--color-link-active]",
					showMore: "text-sm pb-4 text-[--color-link]",
				}}
				showMore={true}
				showMoreLimit={25}
				sortBy={["isRefined", "count", "name"]}
				transformItems={props.transformItems}
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
	const tl = useTranslations("Languages");
	return (
		<MainContent className="mx-auto h-full w-screen max-w-screen-lg p-6">
			<InstantSearchView
				queryArgsToMenuFields={{
					// the order of elements here determines the order of refinement lists in the UI
					language: "language" as const,
					category: "contains.work.category" as const,
					work: "contains.work.short_title" as const,
					translator: "contains.translators.name" as const,
				}}
			>
				<div className="absolute h-full overflow-y-auto pr-5">
					<FilterMenu attribute="contains.work.short_title" />

					<FilterMenu
						attribute="language"
						className="lowercase"
						transformItems={(items) => {
							return items.map((item) => {
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								item.label = tl(item.label as any);
								return item;
							});
						}}
					/>

					{
						// FIXME when changing the query removes a refinement from the list, that refinement
						// should become inactive!? otherwise it's not clear that it's still toggled...
						// TODO pass transform
						// <FilterMenu attribute="contains.work.category" />
					}

					<FilterMenu attribute="contains.translators.name" />
				</div>
			</InstantSearchView>
		</MainContent>
	);
}
