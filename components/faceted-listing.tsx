import { MainContent } from "@/components/main-content";

import { InstantSearch } from "./instantsearch";

export interface FacetedListingProps {
	queryArgToRefinementFields: Record<string, string>;
}

export function FacetedListing(props: FacetedListingProps) {
	// const data = await getFaceted(props.facet, safeParams.facetValue);
	// const publications = data.hits?.map((h) => {
	// return h.document;
	// });

	return (
		<MainContent>
			<InstantSearch queryArgToRefinementFields={props.queryArgToRefinementFields}></InstantSearch>
		</MainContent>
	);
}
