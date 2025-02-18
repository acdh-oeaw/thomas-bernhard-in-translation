import type { StateMapping, UiState } from "instantsearch.js";
import type { BrowserHistoryArgs } from "instantsearch.js/es/lib/routers/history";

type RouteState = Record<string, string | undefined>;

// "The difference here is that routing.router takes the same options as the historyRouter."
export function instantSearchNextRefinementInPathnameRouterConfig(
	pageName?: string,
	pathnameField?: string,
): Partial<BrowserHistoryArgs<RouteState>> {
	return {
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
			return location.origin + parts.join("/") + (qa && `?${qa}`);
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
	};
}

export function instantSearchNextAbbreviatedStateMapping(
	collectionName: string,
	defaultSort?: string,
	queryArgsToMenuFields?: Record<string, string>,
	pathnameField?: string,
): StateMapping<UiState, RouteState> {
	return {
		routeToState(routeToState: RouteState) {
			if (!("sort" in routeToState)) {
				routeToState.sort = defaultSort;
			}
			const uiState = {
				[collectionName]: {
					menu: {},
					page: routeToState.page && decodeURI(routeToState.page),
					query: routeToState.q && decodeURI(routeToState.q),
					// refinementList: {},
					sortBy: routeToState.sort && `${collectionName}/sort/${routeToState.sort}`,
				},
			} as UiState;
			if (queryArgsToMenuFields) {
				Object.entries(queryArgsToMenuFields).forEach(([queryArg, field]) => {
					if (routeToState[queryArg]) {
						uiState[collectionName]!.menu![field] = decodeURI(routeToState[queryArg]);
					}
				});
			}
			if (pathnameField && routeToState[pathnameField]) {
				uiState[collectionName]!.menu![pathnameField] = routeToState[pathnameField];
			}
			return uiState;
		},
		stateToRoute: (uiState: UiState) => {
			const indexUiState = uiState[collectionName]!;
			const route = {} as RouteState;
			if (pathnameField) {
				route[pathnameField] = undefined;
			}
			if (indexUiState.query) {
				route.q = encodeURI(indexUiState.query);
			}
			if (indexUiState.page) {
				route.page = encodeURI(indexUiState.page.toString());
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
	};
}
