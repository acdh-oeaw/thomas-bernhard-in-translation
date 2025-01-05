"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { Switch } from "react-aria-components";
import { SearchBox } from "react-instantsearch";

import { InfiniteScroll } from "./instantsearch/infinitescroll";
import { PaginatedTable } from "./instantsearch/paginated-table";
import { SingleRefinementDropdown } from "./instantsearch/single-refinement-dropdown";
import { InstantSearchSortBy } from "./instantsearch/sortby";
import { InstantSearchStats } from "./instantsearch/stats";
import {
	ThomasBernhardInstantSearchProvider,
	type ThomasBernhardInstantSearchProviderProps,
} from "./instantsearch/thomas-bernhard/thomasbernhard-instantsearchprovider";

interface InstantSearchViewProps extends Partial<ThomasBernhardInstantSearchProviderProps> {
	refinementDropdowns?: Record<string, string>;
}

export function InstantSearchView(props: InstantSearchViewProps): ReactNode {
	const t = useTranslations("InstantSearch");

	// TODO encode current state in URL
	const [view, setView] = useState<"covers" | "detail">("covers");

	return (
		<ThomasBernhardInstantSearchProvider {...props}>
			<div className="grid h-full grid-cols-[12rem_1fr] gap-6 px-2">
				<div className="relative h-full">{props.children}</div>
				<div className="h-full">
					<div className="flex place-content-between items-center gap-6">
						<SearchBox placeholder={t("query_placeholder")} />
						<span className="grow">
							<InstantSearchStats />
						</span>
						{props.refinementDropdowns
							? Object.keys(props.refinementDropdowns).map((attribute) => {
									return (
										<SingleRefinementDropdown
											key={attribute}
											allLabel={props.refinementDropdowns![attribute]!}
											attribute={attribute}
										/>
									);
								})
							: null}
						<InstantSearchSortBy sortOptions={["year:asc", "year:desc", "title:asc"]} />
						<Switch
							isSelected={view === "detail"}
							onChange={(isSelected) => {
								setView(isSelected ? "detail" : "covers");
							}}
						>
							<LayoutGrid size={18} />
							<div className="indicator" />
							<LayoutList size={18} />
							<span className="sr-only">{t("view.table")}</span>
						</Switch>
					</div>
					<div className="relative size-full">
						{view === "covers" ? <InfiniteScroll /> : <PaginatedTable />}
					</div>
				</div>
			</div>
		</ThomasBernhardInstantSearchProvider>
	);
}
