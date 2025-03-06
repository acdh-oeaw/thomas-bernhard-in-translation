import { Client } from "typesense";

import { env } from "@/config/env.config";
import type { BernhardWork, Category, Publication } from "@/lib/model";

export const client = new Client({
	nodes: [
		{
			host: env.NEXT_PUBLIC_TYPESENSE_HOST,
			port: env.NEXT_PUBLIC_TYPESENSE_PORT,
			protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
		},
	],
	apiKey: env.NEXT_PUBLIC_TYPESENSE_API_KEY,
	connectionTimeoutSeconds: 2,
});

export const collectionName = env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME;
const collection = client.collections(env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME);

export async function getPublication(id: string): Promise<Publication | null> {
	if (Number.isNaN(Number(id))) {
		// signatur
		const result = await collection.documents().search({
			q: "*",
			filter_by: `signatur := ${id}`,
		});
		return result.hits ? (result.hits[0]?.document as Promise<Publication>) : null;
	} else {
		// numeric id
		return collection.documents(id).retrieve() as Promise<Publication>;
	}
}

// get 4 publications, ideally in the same language but excluding the publication itself *and* its
// children (because they already appear under their own sections on the publication details page)
export async function getSameLanguagePublications(pub: Publication) {
	return (
		await collection.documents().search({
			q: "*",
			per_page: 4,
			filter_by: `language: \`${pub.language}\` && id :!= [ ${[
				pub.id,
				...(pub.later ?? []),
				...(pub.parents ?? []),
			].join()} ]`,
			sort_by: "_rand:asc",
		})
	).hits?.map((r) => {
		return r.document;
	}) as unknown as Array<Publication>;
}

export async function getPublications({
	q = "*",
	filter_by = "",
	query_by = "title, contains.title",
	page = 1,
	per_page = 12,
	sort_by = undefined,
}: {
	q: string;
	filter_by: string;
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
			filter_by: filter_by,
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

export async function getWorks(category: Category): Promise<Record<number, BernhardWork>> {
	const x = await collection.documents().search({
		q: "*",
		filter_by: `contains.work.category:${category}`,
		per_page: 250, // hard maximum
		include_fields: "contains.work",
	});
	const works = x.hits?.reduce((accumulator: Record<number, BernhardWork>, hit) => {
		const pub = hit.document as Publication;
		pub.contains
			.filter((translation) => {
				return translation.work.category === category;
			})
			.forEach((translation) => {
				if (!(translation.work.id in accumulator)) {
					accumulator[translation.work.id] = translation.work;
				}
			});
		return accumulator;
	}, {});
	return works!;
}
