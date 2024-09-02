"use client";
import { useTranslations } from "next-intl";
import { Configure, Hits, Pagination, RefinementList, SearchBox } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { type SearchClient } from "typesense-instantsearch-adapter";

import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import type { Publication } from "@/types/model";

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

function DefaultRefinementList({
	attribute,
	placeholder,
}: {
	attribute: string;
	placeholder: string;
}) {
	return (
		<RefinementList
			attribute={attribute}
			classNames={{
				count: 'before:content-["("] after:content-[")"]',
				labelText: "px-1",
			}}
			searchable={true}
			searchablePlaceholder={placeholder}
			showMore={true}
			showMoreLimit={100}
		/>
	);
}

export function InstantSearch() {
	const t = useTranslations("SearchPage");

	return (
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		<InstantSearchNext indexName="thomas-bernhard" searchClient={searchClient}>
			<Configure hitsPerPage={12} />
			<div>
				<DefaultRefinementList attribute="language" placeholder={`${t("filter")} languages`} />
				<DefaultRefinementList
					attribute="contains.work.title"
					placeholder={`${t("filter")} works`}
				/>
				<DefaultRefinementList
					attribute="contains.translators.name"
					placeholder={`${t("filter")} translators`}
				/>
			</div>
			<div>
				<div className="flex place-content-between">
					<SearchBox placeholder={t("filter_publications")} />
					<Pagination
						classNames={{
							root: "float-right",
							list: "flex gap-1",
							noRefinementRoot: "hidden",
						}}
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
			</div>
		</InstantSearchNext>
	);
}
