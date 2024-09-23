"use client";

import type { StateMapping, UiState } from "instantsearch.js";
import { type MessageKeys, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
	Configure,
	Hits,
	Pagination,
	RefinementList,
	SearchBox,
	SortBy,
	Stats,
} from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import { collectionName } from "@/lib/data";
import type { Publication } from "@/lib/model";

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
	category: "contains.work.category" as const,
	language: "language" as const,
	work: "contains.work.title" as const,
	translator: "contains.translators.name" as const,
};

type RefinementState = {
	[Property in keyof typeof queryArgToRefinementField]: string | undefined;
};

interface SearchState {
	q?: string;
	page?: number;
}

type RouteState = RefinementState & SearchState;

const stateMapping: StateMapping<UiState, RouteState> = {
	stateToRoute(uiState) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const indexUiState = uiState[collectionName]!;
		const route = {} as RouteState;
		route.q = indexUiState.query;
		route.page = indexUiState.page;
		if (indexUiState.refinementList) {
			for (const [field, values] of Object.entries(indexUiState.refinementList)) {
				const queryarg = Object.entries(queryArgToRefinementField).find(([_k, v]) => {
					return v === field;
				})?.[0];
				route[queryarg as unknown as keyof RefinementState] = values.join(",");
			}
		}
		return route;
	},

	routeToState(routeState: RouteState) {
		const uiState = {
			[collectionName]: {
				query: routeState.q,
				page: routeState.page,
				refinementList: {},
			},
		} as UiState;
		for (const queryarg in queryArgToRefinementField) {
			if (queryarg in routeState) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				uiState[collectionName]!.refinementList![
					queryArgToRefinementField[queryarg as keyof RefinementState]
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				] = routeState[queryarg as keyof RefinementState]!.split(",");
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
							placeholder={`${t("filter")} ${t(queryarg as MessageKeys<any, any>)}`}
						/>
					);
				})}
			</div>
			<div>
				<div className="flex place-content-between">
					<SearchBox placeholder={t("filter_publications")} />
					<div>
						sort by
						<SortBy
							items={[
								{ label: "title", value: `${collectionName}/sort/title:asc` },
								{ label: "publication (newest first)", value: `${collectionName}/sort/year:desc` },
								{ label: "publication (oldest first)", value: `${collectionName}/sort/year:asc` },
							]}
						/>
					</div>
				</div>
				<Hits
					classNames={{
						list: "m-2 grid grid-cols-1 md:grid-cols-4",
					}}
					hitComponent={({ hit }) => {
						return <ClickablePublicationThumbnail publication={hit as unknown as Publication} />;
					}}
				/>
				<div className="flex place-content-between">
					<Stats />
					<Pagination
						classNames={{
							root: "float-right",
							list: "flex gap-1",
							noRefinementRoot: "hidden",
							selectedItem: "font-bold",
						}}
					/>
				</div>
			</div>
		</InstantSearchNext>
	);
}
