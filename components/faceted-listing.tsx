import { MainContent } from "@/components/main-content";

import { InstantSearch } from "./instantsearch";
import { SingleRefinementList } from "./single-refinement-list";

export interface FacetedListingProps {
	queryArgsToRefinementFields: Record<string, string>;
	filters?: Record<string, string>;
}

export function FacetedListing(props: FacetedListingProps) {
	return (
		<MainContent>
			<InstantSearch
				filters={props.filters}
				queryArgsToRefinementFields={props.queryArgsToRefinementFields}
			>
				{Object.values(props.queryArgsToRefinementFields).map((attribute) => {
					return <SingleRefinementList key={attribute} attribute={attribute} />;
				})}
			</InstantSearch>
		</MainContent>
	);
}
