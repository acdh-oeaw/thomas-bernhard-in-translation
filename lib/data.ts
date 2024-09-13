import { Client } from "typesense";
import type { SearchResponse } from "typesense/lib/Typesense/Documents";

import type { Publication } from "@/lib/model";

const perPage = 16;

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

const searchDefaults = {
	q: "*",
	filter: {} as Partial<Publication>,
	query_by: "title, contains.title",
	page: 1,
	per_page: 12,
	sort_by: "title:desc", //"_rand:asc", // requires typesense 0.28 !
};

type SearchArgs = Partial<typeof searchDefaults>;

export async function getFaceted(
	facetFields: Array<string>,
	search = "*",
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

export async function getPublication(id: string) {
	return collection.documents(id).retrieve() as Promise<Publication>;
}

export async function getPublications(
	args: SearchArgs = searchDefaults,
): Promise<Array<Publication>> {
	return collection
		.documents()
		.search({
			q: args.q,
			query_by: args.query_by,
			sort_by: args.sort_by,
			page: args.page,
			per_page: args.per_page,
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
