"use client";

import type { StateMapping, UiState } from "instantsearch.js";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Configure, Hits, Pagination, RefinementList, SearchBox, Stats } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import type { Publication } from "@/types/model";

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

// FIXME should this also go in an env var?
const index = "thomas-bernhard";

const refinementFieldToQueryArg = {
	language: "language",
	"contains.work.title": "work",
	"contains.translators.name": "translator",
};

interface RouteState {
	q?: string;
	page?: number;
	language?: string;
	work?: string;
	translator?: string;
}

const stateMapping: StateMapping<UiState, RouteState> = {
	stateToRoute(uiState) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const indexUiState = uiState[index]!;
		const route = {} as RouteState;
		route.q = indexUiState.query;
		route.page = indexUiState.page;
		if (indexUiState.refinementList) {
			for (const [field, value] of Object.entries(indexUiState.refinementList)) {
				if (field in refinementFieldToQueryArg) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					route[refinementFieldToQueryArg[field]] = value.join(",");
				}
			}
		}
		return route;
	},

	routeToState(routeState) {
		const uiState = {
			[index]: {
				query: routeState.q,
				page: routeState.page,
				refinementList: {},
			},
		} as UiState;
		for (const [_field, queryarg] of Object.entries(refinementFieldToQueryArg)) {
			if (queryarg in routeState) {
				uiState[index].refinementList[_field] = routeState[queryarg]?.split(",");
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
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		<InstantSearchNext indexName={index} routing={{ stateMapping }} searchClient={searchClient}>
			<Configure hitsPerPage={12} />

			<div>
				{Object.entries(refinementFieldToQueryArg).map<ReactNode>(([attribute, queryarg]) => {
					return (
						<DefaultRefinementList
							key={attribute}
							attribute={attribute}
							placeholder={`${t("filter")} ${t(queryarg)}`}
						/>
					);
				})}
			</div>

			<div>
				<div className="flex place-content-between">
					<SearchBox placeholder={t("filter_publications")} />
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
						}}
					/>
				</div>
			</div>
		</InstantSearchNext>
	);
}
