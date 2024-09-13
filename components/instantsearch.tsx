"use client";

import type { ReactNode } from "react";
import { Configure, Hits, Pagination, SortBy, Stats } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import { collectionName } from "@/lib/data";
import type { Publication } from "@/lib/model";

import type { SimpleListingProps } from "./simple-listing";

interface InstantSearchProps {
	faceting: SimpleListingProps;
	// children: ReactNode;
}

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
	additionalSearchParameters: {
		query_by: "title",
	},
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const searchClient = typesenseInstantsearchAdapter.searchClient as unknown as SearchClient;

export function InstantSearch(props: InstantSearchProps): ReactNode {
	// const { children } = props;
	return (
		<InstantSearchNext
			indexName={collectionName}
			routing={true} // TODO encode just page and sort nicely
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			searchClient={searchClient}
		>
			<Configure
				// when the facetingValue is undefined the search will return nothing, which is fine
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				filters={`${props.faceting.facetingField} := ${props.faceting.facetingValue}`}
				hitsPerPage={12}
			/>
			<div className="flex">
				sort by{" "}
				<SortBy
					items={[
						{ label: "title", value: "title" },
						{ label: "year", value: "year" },
					]}
				/>
			</div>
			<Hits
				classNames={{
					list: "m-2 grid grid-cols-1 md:grid-cols-4",
				}}
				hitComponent={({ hit }) => {
					return <ClickablePublicationThumbnail publication={hit as unknown as Publication} />;
				}}
			/>
			<div className="flex place-content-between">
				<Stats />
				<Pagination
					classNames={{
						root: "float-right",
						list: "flex gap-1",
						noRefinementRoot: "hidden",
						selectedItem: "font-bold",
					}}
				/>
			</div>
		</InstantSearchNext>
	);
}
