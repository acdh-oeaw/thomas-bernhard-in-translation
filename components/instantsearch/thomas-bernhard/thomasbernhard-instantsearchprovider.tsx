"use client";

import type { ReactNode } from "react";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

import { env } from "@/config/env.config";
import { collectionName } from "@/lib/data";

import { InstantSearchProvider, type InstantSearchProviderProps } from "../instantsearchprovider";

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

export interface ThomasBernhardInstantSearchProviderProps
	extends Partial<InstantSearchProviderProps> {}

export function ThomasBernhardInstantSearchProvider(
	props: ThomasBernhardInstantSearchProviderProps,
): ReactNode {
	const { children, filters } = props;
	const _filter = filters
		? // '&&' is typesense convention, not instantsearch!
			`erstpublikation:true && ${filters}`
		: "erstpublikation:true";
	return (
		<InstantSearchProvider
			collectionName={collectionName}
			defaultSort="year:asc"
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			searchClient={searchClient}
			{...props}
		>
			{children}
		</InstantSearchProvider>
	);
}
