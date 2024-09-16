import { Client } from "typesense";
import type { SearchResponse } from "typesense/lib/Typesense/Documents";

import type { Publication } from "@/lib/model";

export const client = new Client({
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
export const collectionName = "thomas-bernhard";

const collection = client.collections(collectionName);

// TODO rename 'getcounts' as this is only used in SimpleListing
export async function getFaceted(
	facetField: string,
	filter_by?: string,
): Promise<SearchResponse<Publication>> {
	return collection.documents().search({
		q: "*",
		query_by: "*",
		facet_by: `${facetField}(sort_by: _alpha:asc)`,
		filter_by: filter_by,
		max_facet_values: 500,
		per_page: 1, // don't really need the data
	}) as unknown as Promise<SearchResponse<Publication>>;
}

export async function getPublication(id: string) {
	return collection.documents(id).retrieve() as Promise<Publication>;
}

export async function getPublications({
	q = "*",
	_filter = {},
	query_by = "title, contains.title",
	page = 1,
	per_page = 12,
	sort_by = undefined,
}: {
	q: string;
	_filter?: Partial<Publication>;
	query_by?: string;
	page?: number;
	per_page?: number;
	sort_by?: string;
}): Promise<Array<Publication>> {
	return collection
		.documents()
		.search({
			q: q,
			query_by: query_by,
			sort_by: sort_by,
			page: page,
			per_page: per_page,
		})
		.then((r) => {
			return r.hits?.map((h) => {
				return h.document;
			}) as unknown as Array<Publication>;
		});
}

// get 4 publications, ideally in the same language but excluding the publication itself *and* its
// children (because they will already be listed separately anyway)
export async function getSameLanguagePublications(pub: Publication) {
	return (
		await collection.documents().search({
			q: "*",
			per_page: 4,
			filter_by: `language: ${pub.language} && id :!= [ ${[pub.id, ...(pub.later ?? [])].join()} ]`,
		})
	).hits?.map((r) => {
		return r.document;
	}) as unknown as Array<Publication>;
}
