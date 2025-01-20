"use client";

import type { ReactNode } from "react";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import type { SearchClient } from "typesense-instantsearch-adapter";

import {
	instantSearchNextAbbreviatedStateMapping,
	instantSearchNextRefinementInPathnameRouterConfig,
} from "@/lib/utils/instantsearch-urls";

export interface InstantSearchProviderProps {
	children?: ReactNode;
	// TODO refactor by referring to arguments of the config functions below
	searchClient: SearchClient;
	collectionName: string;
	queryArgsToMenuFields?: Record<string, string>;
	defaultSort?: string;
	pageName?: string;
	pathnameField?: string;
}

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
				router: instantSearchNextRefinementInPathnameRouterConfig(pageName, pathnameField),
				stateMapping: instantSearchNextAbbreviatedStateMapping(
					collectionName,
					defaultSort,
					queryArgsToMenuFields,
					pathnameField,
				),
			}}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			searchClient={searchClient}
		>
			{children}
		</InstantSearchNext>
	);
}
