import { Client } from "typesense";

import { env } from "@/config/env.config";
import type { Publication } from "@/lib/model";

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

const collection = client.collections(env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME);

export async function getPublication(id: string) {
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
// children (because they will already be listed separately anyway)
export async function getSameLanguagePublications(pub: Publication) {
	return (
		await collection.documents().search({
			q: "*",
			per_page: 4,
			filter_by: `language: \`${pub.language}\` && id :!= [ ${[pub.id, ...(pub.later ?? [])].join()} ]`,
		})
	).hits?.map((r) => {
		return r.document;
	}) as unknown as Array<Publication>;
}
