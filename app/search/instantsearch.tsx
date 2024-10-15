"use client";

import type { StateMapping, UiState } from "instantsearch.js";
import { type MessageKeys, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Configure, Hits, RefinementList, SearchBox, SortBy } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import { env } from "@/config/env.config";
import { collectionName } from "@/lib/data";
import type { Publication } from "@/lib/model";

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
	server: {
		apiKey: env.NEXT_PUBLIC_TYPESENSE_API_KEY,
		nodes: [
			{
				host: env.NEXT_PUBLIC_TYPESENSE_HOST,
				port: env.NEXT_PUBLIC_TYPESENSE_PORT,
				protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
			},
		],
	},
	// The following parameters are directly passed to Typesense's search API endpoint.
	//  So you can pass any parameters supported by the search endpoint below.
	//  queryBy is required.
	additionalSearchParameters: {
		query_by: "title",
	},
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const searchClient = typesenseInstantsearchAdapter.searchClient as unknown as SearchClient;

const queryArgToRefinementField = {
	// the order of elements here determines the order of refinement lists in the UI
	language: "language" as const,
	category: "contains.work.category" as const,
	work: "contains.work.title" as const,
	translator: "contains.translators.name" as const,
};

type RefinementState = {
	[Property in keyof typeof queryArgToRefinementField]: string | undefined;
};

interface SearchState {
	q?: string;
	sort?: string;
}

type RouteState = RefinementState & SearchState;

const stateMapping: StateMapping<UiState, RouteState> = {
	stateToRoute(uiState) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const indexUiState = uiState[collectionName]!;
		const route = {} as RouteState;
		route.q = indexUiState.query;
		route.sort = indexUiState.sortBy?.split("/").at(-1);
		if (indexUiState.refinementList) {
			for (const [field, values] of Object.entries(indexUiState.refinementList)) {
				const queryarg = Object.entries(queryArgToRefinementField).find(([_k, v]) => {
					return v === field;
				})?.[0];
				route[queryarg as unknown as keyof RefinementState] = values.join(";");
			}
		}
		return route;
	},

	routeToState(routeState: RouteState) {
		const uiState = {
			[collectionName]: {
				query: routeState.q,
				refinementList: {},
				sortBy: routeState.sort ? `${collectionName}/sort/${routeState.sort}` : undefined,
			},
		} as UiState;
		for (const queryarg in queryArgToRefinementField) {
			if (queryarg in routeState) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				uiState[collectionName]!.refinementList![
					queryArgToRefinementField[queryarg as keyof RefinementState]
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				] = routeState[queryarg as keyof RefinementState]!.split(";");
			}
		}
		return uiState;
	},
};

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
			searchable={true}
			searchablePlaceholder={placeholder}
			showMore={true}
			showMoreLimit={100}
		/>
	);
}

export function InstantSearch() {
	const t = useTranslations("SearchPage");

	return (
		<InstantSearchNext
			indexName={collectionName}
			routing={{ stateMapping }}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			searchClient={searchClient}
		>
			<Configure hitsPerPage={12} />
			<div>
				{Object.entries(queryArgToRefinementField).map<ReactNode>(([queryarg, attribute]) => {
					return (
						<DefaultRefinementList
							key={attribute}
							attribute={attribute}
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							placeholder={`${t("filter")} ${t(("filter_by." + queryarg) as MessageKeys<any, any>)}`}
						/>
					);
				})}
			</div>
			<div>
				<div className="flex place-content-between">
					<SearchBox placeholder={t("query_placeholder")} />
					<div>
						{t("sort_by")}
						<SortBy
							items={[
								{ label: t("sort.year:desc"), value: `${collectionName}/sort/year:desc` },
								{ label: t("sort.year:asc"), value: `${collectionName}/sort/year:asc` },
								{ label: t("sort.title:asc"), value: `${collectionName}/sort/title:asc` },
							]}
						/>
					</div>
				</div>
				<Hits
					classNames={{
						list: "m-2 grid grid-cols-1 md:grid-cols-4",
					}}
					hitComponent={({ hit }) => {
						return (
							<li className="block size-44 p-2">
								<ClickablePublicationThumbnail publication={hit as unknown as Publication} />
							</li>
						);
					}}
				/>
			</div>
		</InstantSearchNext>
	);
}
