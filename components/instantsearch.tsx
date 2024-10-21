"use client";

import type { UiState } from "instantsearch.js";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { Configure, SearchBox } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

import { collectionName } from "@/lib/data";

import { InfiniteScroll } from "./instantsearch-infinitescroll";
import { PaginatedTable } from "./instantsearch-paginated-table";
import { InstantSearchSortBy } from "./instantsearch-sortby";
import { InstantSearchStats } from "./instantsearch-stats";
import { SingleRefinementDropdown } from "./single-refinement-dropdown";

interface InstantSearchProps {
	queryArgsToMenuFields: Record<string, string>;
	refinementDropdowns?: Record<string, string>;
	children?: ReactNode;
	filters?: Record<string, string>; // ugly
}

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
	server: {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY!,
		nodes: [
			{
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				host: process.env.NEXT_PUBLIC_TYPESENSE_HOST!,
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				port: Number(process.env.NEXT_PUBLIC_TYPESENSE_PORT!),
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL!,
			},
		],
	},
	additionalSearchParameters: {
		query_by: "title",
	},
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const searchClient = typesenseInstantsearchAdapter.searchClient as unknown as SearchClient;

type RouteState = Record<string, string | undefined>;

export function InstantSearch(props: InstantSearchProps): ReactNode {
	const t = useTranslations("SearchPage");
	const { children, filters, queryArgsToMenuFields } = props;

	const [view, setView] = useState<"covers" | "table">("covers");
	return (
		<InstantSearchNext
			indexName={collectionName}
			routing={{
				stateMapping: {
					stateToRoute(uiState) {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						const indexUiState = uiState[collectionName]!;
						const route = {} as RouteState;
						route.q = indexUiState.query && encodeURI(indexUiState.query);
						route.sort = indexUiState.sortBy?.split("/").at(-1);
						if (indexUiState.menu) {
							for (const [field, value] of Object.entries(indexUiState.menu)) {
								const queryarg = Object.entries(queryArgsToMenuFields).find(([_k, v]) => {
									return v === field;
								})?.[0];
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								route[queryarg!] = encodeURI(value);
							}
						}
						return route;
					},

					routeToState(routeState: RouteState) {
						const uiState = {
							[collectionName]: {
								query: routeState.q && decodeURI(routeState.q),
								menu: {},
								refinementList: {},
								sortBy: routeState.sort ? `${collectionName}/sort/${routeState.sort}` : undefined,
							},
						} as UiState;
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						queryArgsToMenuFields &&
							Object.entries(queryArgsToMenuFields).forEach(([queryArg, field]) => {
								if (routeState[queryArg]) {
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									uiState[collectionName]!.menu![field] = decodeURI(routeState[queryArg]);
								}
							});
						return uiState;
					},
				},
			}}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			searchClient={searchClient}
		>
			<Configure
				filters={[
					"erstpublikation:true",
					...Object.entries(filters ?? {}).map(([k, v]) => {
						return `(${k}:=\`${v}\`)`;
					}),
				].join(" && ")} // typesense convention, not instantsearch!
				hitsPerPage={30}
			/>
			<div className="p-2">{children}</div>
			<div>
				<div className="flex place-content-between p-2">
					<InstantSearchStats />
					<SearchBox placeholder={t("query_placeholder")} />
					{props.refinementDropdowns
						? Object.keys(props.refinementDropdowns).map((attribute) => {
								return (
									<SingleRefinementDropdown
										key={attribute}
										// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
										allLabel={props.refinementDropdowns![attribute]!}
										attribute={attribute}
									/>
								);
							})
						: null}
					<InstantSearchSortBy sortOptions={["year:desc", "year:asc", "title:asc"]} />
					<label>
						<input
							checked={view === "table"}
							onChange={(e) => {
								setView(e.target.checked ? "table" : "covers");
							}}
							type="checkbox"
						/>{" "}
						<span>{t("view.table")}</span>
					</label>
				</div>
				{view === "covers" ? <InfiniteScroll /> : <PaginatedTable />}
			</div>
		</InstantSearchNext>
	);
}
