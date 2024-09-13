import { createUrlSearchParams } from "@acdh-oeaw/lib";
import * as v from "valibot";

import { MainContent } from "@/components/main-content";
import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import { PublicationGrid } from "@/components/publication-grid";
import { getFaceted } from "@/lib/data";

import { AppNavLink } from "./app-nav-link";

export interface FacetedListingProps {
	searchParams: Record<string, Array<string> | string>;
	facet: string;
}

// v.fallback: does not raise any issues, success: true
// v.optional does not accept null (which is what urlsearchparams.get() returns)
// v.nullable: obscure type error
const searchParamsSchema = v.object({
	limit: v.fallback(
		v.pipe(
			v.string(),
			v.transform(Number),
			v.number(),
			v.integer(),
			v.minValue(1),
			v.maxValue(100),
		),
		10,
	),
	page: v.fallback(
		v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1)),
		1,
	),
	// searchParams.get() gives null but typescript wants undefined
	facetValue: v.nullish(v.string(), undefined),
});

export async function FacetedListing(props: FacetedListingProps) {
	const searchParams = createUrlSearchParams(props.searchParams);
	const safeParams = v.parse(searchParamsSchema, {
		page: searchParams.get("page"),
		facetValue: searchParams.get(props.facet),
	});

	const data = await getFaceted(props.facet, safeParams.facetValue);
	const publications = data.hits?.map((h) => {
		return h.document;
	});

	return (
		<MainContent>
			<div>
				{data.facet_counts?.[0]?.counts.map(({ count, value }) => {
					// ugly but only way to overwrite rather than append?
					searchParams.set(props.facet, value);
					return (
						<li key={value}>
							<AppNavLink
								href={
									// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
									`?${searchParams}`
								}
							>
								{value}
							</AppNavLink>{" "}
							({count})
						</li>
					);
				})}
			</div>
			<PublicationGrid>
				{publications?.map((p) => {
					return <ClickablePublicationThumbnail key={p.id} publication={p} />;
				})}
			</PublicationGrid>
		</MainContent>
	);
}
