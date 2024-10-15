"use client";

import type { UiState } from "instantsearch.js";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef } from "react";
import { Configure, SearchBox, useInfiniteHits } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

import { collectionName } from "@/lib/data";
import type { Publication } from "@/lib/model";

import { InstantSearchSortBy } from "./instantsearch-sortby";
import { InstantSearchStats } from "./instantsearch-stats";
import { PublicationGrid } from "./publication-grid";
import { SingleRefinementDropdown } from "./single-refinement-dropdown";
import { Button } from "./ui/button";

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

function InfiniteScroll(): ReactNode {
	const { items, isLastPage, showMore } = useInfiniteHits<Publication>();
	const sentinelRef = useRef(null);
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (sentinelRef.current !== null) {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !isLastPage) {
						showMore();
						// showMore && showMore();
					}
				});
			});

			observer.observe(sentinelRef.current);

			return () => {
				observer.disconnect();
			};
		}
		return () => {
			return null;
		};
	}, [isLastPage, showMore]);

	return (
		<>
			<PublicationGrid publications={items} />
			{isLastPage ? (
				<hr className="m-auto mt-8 w-1/3" />
			) : (
				<div ref={sentinelRef} className="text-center">
					<Button
						onPress={() => {
							showMore();
						}}
					>
						load more results
					</Button>
				</div>
			)}
		</>
	);
}

type RouteState = Record<string, string | undefined>;

export function InstantSearch(props: InstantSearchProps): ReactNode {
	const t = useTranslations("SearchPage");
	const { children, filters, queryArgsToMenuFields } = props;
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
				</div>
				<InfiniteScroll />
			</div>
		</InstantSearchNext>
	);
}
