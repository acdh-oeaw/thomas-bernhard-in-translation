import { Client } from "typesense";

const client = new Client({
	nodes: [
		{
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			host: process.env.TYPESENSE_HOST!,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			port: Number(process.env.TYPESENSE_PORT!),
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			protocol: process.env.TYPESENSE_PROTOCOL!,
		},
	],
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	apiKey: process.env.TYPESENSE_API_KEY!,
	connectionTimeoutSeconds: 2,
});

const collection = client.collections("thomas-bernhard");

function getDistinct(field: string): Promise<Array<string>> {
	return (
		collection
			.documents()
			// this does not work as expected when grouping by an array field (or a nested field which has
			// an object[] anywhere in its path) because grouping then happens by the array of values, not
			// by individual values. for example: await getDistinct("contains.work.title")
			.search({
				q: "",
				query_by: field,
				group_by: field,
				per_page: 250, // 250 is the hard maximum for typesense
				group_limit: 1, // we're not interested in the actual documents, but gotta retrieve at least 1..
			})
			.then((r) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return r
					.grouped_hits!.map((l) => {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						return l.group_key[0]!;
					})
					.sort();
			})
	);
}

export function getLanguages(): Promise<Array<string>> {
	return getDistinct("language");
}
