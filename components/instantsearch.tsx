"use client";

import type { UiState } from "instantsearch.js";
import { type MessageKeys, useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef } from "react";
import { Configure, RefinementList, SearchBox, SortBy, useInfiniteHits } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import { collectionName } from "@/lib/data";
import type { Publication } from "@/lib/model";

import { PublicationGrid } from "./publication-grid";

// TODO put into props
const sortOptions = ["year:desc", "year:asc", "title:asc"];

interface InstantSearchProps {
	queryArgToRefinementFields: Record<string, string>;
	children?: ReactNode;
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
		<PublicationGrid>
			{items.map((pub) => {
				return <ClickablePublicationThumbnail key={pub.id} publication={pub} />;
			})}
			<div ref={sentinelRef} aria-hidden="true" />
		</PublicationGrid>
	);
}

function DefaultRefinementList({
	attribute,
	placeholder,
}: {
	attribute: string;
	placeholder: string;
}) {
	return (
		<RefinementList
			attribute={attribute}
			classNames={{
				count: 'before:content-["("] after:content-[")"]',
				disabledShowMore: "hidden",
				labelText: "px-1",
				root: "p-2",
			}}
			limit={1000}
			searchable={true}
			searchablePlaceholder={placeholder}
			// showMore={true}
			// showMoreLimit={Infinity}
			sortBy={["name"]}
		/>
	);
}

type RouteState = Record<string, string | undefined>;

export function InstantSearch(props: InstantSearchProps): ReactNode {
	const t = useTranslations("SearchPage");
	const { children, queryArgToRefinementFields } = props;
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
						if (indexUiState.refinementList) {
							for (const [field, values] of Object.entries(indexUiState.refinementList)) {
								const queryarg = Object.entries(queryArgToRefinementFields).find(([_k, v]) => {
									return v === field;
								})?.[0];
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								route[queryarg!] = values.map(encodeURI).join(";");
							}
						}
						return route;
					},

					routeToState(routeState: RouteState) {
						const uiState = {
							[collectionName]: {
								query: routeState.q && decodeURI(routeState.q),
								refinementList: {},
								sortBy: routeState.sort ? `${collectionName}/sort/${routeState.sort}` : undefined,
							},
						} as UiState;
						Object.entries(queryArgToRefinementFields).forEach(([queryArg, field]) => {
							if (routeState[queryArg]) {
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								uiState[collectionName]!.refinementList![field] = routeState[queryArg]
									.split(";")
									.map(decodeURI);
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
				// when the facetingValue is undefined the search will return nothing, which is fine
				// filters={`${props.faceting.facetingField} := ${props.faceting.facetingValue}`}
				hitsPerPage={24}
			/>
			<div>
				{Object.keys(queryArgToRefinementFields).map((attribute) => {
					return (
						<DefaultRefinementList
							key={attribute}
							attribute={attribute}
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							placeholder={`${t("filter")} ${t(("filter_by." + attribute) as MessageKeys<any, any>)}`}
						/>
					);
				})}
				{children}
			</div>
			<div>
				<div className="flex place-content-between">
					<SearchBox placeholder={t("query_placeholder")} />
					sort by{" "}
					<SortBy
						items={sortOptions.map((field) => {
							return {
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								label: t(`sort.${field}` as MessageKeys<any, any>),
								value: `${collectionName}/sort/${field}`,
							};
						})}
					/>
				</div>
				<InfiniteScroll />
			</div>
		</InstantSearchNext>
	);
}
