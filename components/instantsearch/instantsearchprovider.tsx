"use client";

import type { UiState } from "instantsearch.js";
import type { ReactNode } from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

import { env } from "@/config/env.config";
import { collectionName } from "@/lib/data";

interface InstantSearchProviderProps {
	queryArgsToMenuFields: Record<string, string>;
	children?: ReactNode;
	filters?: string;
}

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
	additionalSearchParameters: {
		query_by: "title,contains.title,contains.work.title,contains.translators.name,publisher",
	},
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const searchClient = typesenseInstantsearchAdapter.searchClient as unknown as SearchClient;

type RouteState = Record<string, string | undefined>;

export function InstantSearchProvider(props: InstantSearchProviderProps): ReactNode {
	const { children, filters, queryArgsToMenuFields } = props;
	const filter = filters
		? // '&&' is typesense convention, not instantsearch!
			`erstpublikation:true && ${filters}`
		: "erstpublikation:true";
	return (
		<InstantSearchNext
			indexName={collectionName}
			routing={{
				stateMapping: {
					stateToRoute(uiState: UiState) {
						const indexUiState = uiState[collectionName]!;
						const route = {} as RouteState;
						route.q = indexUiState.query && encodeURI(indexUiState.query);
						route.sort = indexUiState.sortBy?.split("/").at(-1);
						if (indexUiState.menu) {
							for (const [field, value] of Object.entries(indexUiState.menu)) {
								const queryarg = Object.entries(queryArgsToMenuFields).find(([_k, v]) => {
									return v === field;
								})?.[0];

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

						Object.entries(queryArgsToMenuFields).forEach(([queryArg, field]) => {
							if (routeState[queryArg]) {
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
			<Configure filters={filter} hitsPerPage={30} />
			{children}
		</InstantSearchNext>
	);
}
