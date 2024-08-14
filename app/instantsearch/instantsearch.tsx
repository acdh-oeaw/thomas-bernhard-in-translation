"use client";
import { Hits, SearchBox } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

export function InstantSearch() {
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

	return (
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		<InstantSearchNext indexName="thomas-bernhard" searchClient={searchClient}>
			<SearchBox />
			<Hits />
		</InstantSearchNext>
	);
}
