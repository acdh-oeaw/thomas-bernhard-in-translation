import { Client } from "typesense";
import type { SearchResponse } from "typesense/lib/Typesense/Documents";

import type { Publication } from "@/types/model";

const perPage = 16;

const client = new Client({
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
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY!,
	connectionTimeoutSeconds: 2,
});

// needs to match the collection name in scripts/typesense-schema.json
const collection = client.collections("thomas-bernhard");

export async function getCounts(field: string): Promise<Record<string, number>> {
	const r = await collection
		.documents()
		// this does not work as expected when grouping by an array field (or a nested field which has
		// an object[] anywhere in its path) because grouping then happens by the array of values, not
		// by individual values. for example: await getDistinct("contains.work.title")
		.search({
			q: "*",
			// query_by: field,
			group_by: field,
			sort_by: `${field}:asc`,
			per_page: 250, // limit for the number of groups (250 is the hard maximum for typesense)
			group_limit: 1, // we're not interested in the actual documents, but gotta retrieve at least 1 per group..
		});

	return Object.fromEntries<number>(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		r.grouped_hits!.map((group) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return [group.group_key[0]!, group.found!];
		}),
	);
}

export function getFaceted(
	facetFields: Array<string>,
	search?: string,
	page = 1,
	sortAlphabetic = false,
): Promise<SearchResponse<Publication>> {
	return collection.documents().search({
		q: search,
		query_by: "*",
		facet_by: facetFields
			.map((name) => {
				return sortAlphabetic ? `${name}(sort_by: _alpha:asc)` : name;
			})
			.join(),
		// filter_by: facetValue && `${facet}: \`${facetValue}\``,
		max_facet_values: 100,
		page: page,
		per_page: perPage,
	}) as unknown as Promise<SearchResponse<Publication>>;
}

export async function getPublications(
	search = "*",
	filter?: { [key in keyof Publication]?: Publication[key] },
	page = 1,
): Promise<Array<Publication>> {
	return collection
		.documents()
		.search({
			q: search,
			query_by: "title, contains.title",
			// sort_by: sort,
			page: page,
			per_page: perPage,
		})
		.then((r) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return r.hits!.map((h) => {
				return h.document;
			}) as unknown as Array<Publication>;
		});
}
