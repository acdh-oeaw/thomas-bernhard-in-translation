"use client";

import type { UiState } from "instantsearch.js";
// eslint-disable-next-line no-restricted-imports
import singletonRouter from "next/router";
import type { ReactNode } from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { createInstantSearchRouterNext } from "react-instantsearch-router-nextjs";
import type { SearchClient } from "typesense-instantsearch-adapter";

export interface InstantSearchProviderProps {
	children?: ReactNode;
	collectionName: string;
	pageName?: string;
	pathnameField?: string;
	queryArgsToMenuFields?: Record<string, string>;
	defaultSort?: string;
	filters?: string;
	searchClient: SearchClient;
}

type RouteState = Record<string, string | undefined>;

export function InstantSearchProvider(props: InstantSearchProviderProps): ReactNode {
	const {
		children,
		collectionName,
		filters,
		defaultSort,
		pageName,
		pathnameField,
		queryArgsToMenuFields,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		searchClient,
	} = props;
	const filter = filters
		? // '&&' is typesense convention, not instantsearch!
			`erstpublikation:true && ${filters}`
		: "erstpublikation:true";
	return (
		<InstantSearchNext
			indexName={collectionName}
			routing={{
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				router: createInstantSearchRouterNext({
					// https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch-router-nextjs
					singletonRouter,
					routerOptions: {
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						createURL({ location }) {
							// this function doesn't get called for some reason
							return `/en/languages/dummy`;
						},
						parseURL({ qsModule, location }) {
							const queryArgs = qsModule.parse(location.search.slice(1));

							if (queryArgs.query) {
								queryArgs.query = decodeURIComponent(queryArgs.query as string);
							}

							if (pageName) {
								// trim leading and trailing slashes
								const parts = location.pathname.replace(/^\/+|\/+$/gm, "").split("/");
								if (parts.at(-1) !== pageName) {
									// the last element is not the expected page name, assume it's the value of the
									// pathnameField
									queryArgs[pathnameField ?? pageName] = parts.at(-1);
								}
							}
							return queryArgs as UiState;
						},
					},
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				}) as any,
				stateMapping: {
					routeToState(routeState: RouteState) {
						if (!("sort" in routeState)) {
							routeState.sort = defaultSort;
						}
						const uiState = {
							[collectionName]: {
								query: routeState.q && decodeURI(routeState.q),
								menu: {},
								// refinementList: {},
								sortBy: routeState.sort && `${collectionName}/sort/${routeState.sort}`,
							},
						} as UiState;
						if (queryArgsToMenuFields) {
							Object.entries(queryArgsToMenuFields).forEach(([queryArg, field]) => {
								if (routeState[queryArg]) {
									uiState[collectionName]!.menu![field] = decodeURI(routeState[queryArg]);
								}
							});
						}
						if (pathnameField && routeState[pathnameField]) {
							uiState[collectionName]!.menu![pathnameField] = routeState[pathnameField];
						}
						return uiState;
					},
					stateToRoute: (uiState: UiState) => {
						const indexUiState = uiState[collectionName]!;
						const route = {} as RouteState;
						if (indexUiState.query) {
							route.q = encodeURI(indexUiState.query);
						}
						if (indexUiState.sortBy) {
							const sortBy = indexUiState.sortBy.split("/").at(-1);
							if (sortBy !== defaultSort) {
								route.sort = sortBy;
							}
						}
						if (indexUiState.menu) {
							if (queryArgsToMenuFields) {
								for (const [field, value] of Object.entries(indexUiState.menu)) {
									const queryarg = Object.entries(queryArgsToMenuFields).find(([_k, v]) => {
										return v === field;
									})?.[0];
									route[queryarg!] = encodeURI(value);
								}
							}
							if (pathnameField && pathnameField in indexUiState.menu) {
								route[pathnameField] = indexUiState.menu[pathnameField];
							}
						}
						return route;
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
