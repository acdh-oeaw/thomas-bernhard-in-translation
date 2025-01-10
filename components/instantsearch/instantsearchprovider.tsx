"use client";

import type { UiState } from "instantsearch.js";
import type { ReactNode } from "react";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import type { SearchClient } from "typesense-instantsearch-adapter";

export interface InstantSearchProviderProps {
	children?: ReactNode;
	collectionName: string;
	pageName?: string;
	pathnameField?: string;
	queryArgsToMenuFields?: Record<string, string>;
	defaultSort?: string;
	searchClient: SearchClient;
}

type RouteState = Record<string, string | undefined>;

export function InstantSearchProvider(props: InstantSearchProviderProps): ReactNode {
	const {
		children,
		collectionName,
		defaultSort,
		pageName,
		pathnameField,
		queryArgsToMenuFields,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		searchClient,
	} = props;
	return (
		<InstantSearchNext
			indexName={collectionName}
			routing={{
				router: {
					// "The difference here is that routing.router takes the same options as the historyRouter."
					createURL({ location, routeState, qsModule }) {
						const parts = location.pathname.split("/");
						if (pageName) {
							const splitPageName = pageName.split("/");
							if (parts.at(-1) !== splitPageName.at(-1)) {
								parts.pop();
							}
							// don't add value if it is undefined
							if (pathnameField && routeState[pathnameField]) {
								parts.push(routeState[pathnameField]);

								// remove field from state so it isn't also added to queryargs
								// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
								delete routeState[pathnameField];
							}
						}
						const qa = qsModule.stringify(routeState);
						return parts.join("/") + (qa && `?${qa}`);
					},
					parseURL({ qsModule, location }) {
						const queryArgs = qsModule.parse(location.search.slice(1));

						if (queryArgs.query) {
							queryArgs.query = decodeURIComponent(queryArgs.query as string);
						}

						if (pageName) {
							// trim leading and trailing slashes
							const parts = location.pathname.replace(/^\/+|\/+$/gm, "").split("/");
							const splitPageName = pageName.split("/");
							if (parts.at(-1) !== splitPageName.at(-1)) {
								// the last element is not the expected page name, assume it's the value of the
								// pathnameField
								queryArgs[pathnameField ?? pageName] = parts.at(-1);
							}
						}
						return queryArgs as RouteState;
					},
				},
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
						// if (pathnameField) {
						// 	route[pathnameField] = undefined;
						// }
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
									if (queryarg) {
										route[queryarg] = encodeURI(value);
									}
								}
							}
							if (pathnameField) {
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
			{children}
		</InstantSearchNext>
	);
}
