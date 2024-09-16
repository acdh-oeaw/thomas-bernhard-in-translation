import { getFaceted } from "@/lib/data";

import { AppNavLink } from "./app-nav-link";
import { InstantSearch } from "./instantsearch";
import { MainContent } from "./main-content";

export interface SimpleListingProps {
	path: string;
	filter_by?: string;
	facetingField: string;
	facetingValue?: string;
}

export async function SimpleListing(props: SimpleListingProps) {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const counts = (await getFaceted(props.facetingField, props.filter_by)).facet_counts?.[0]!.counts;
	return (
		<MainContent>
			<div>
				{counts?.map((c) => {
					return (
						<li key={c.value}>
							<AppNavLink href={`/${props.path}/${c.value}`}>
								{c.value}&nbsp;({c.count})
							</AppNavLink>
						</li>
					);
				})}
			</div>
			<div>{props.facetingValue ? <InstantSearch faceting={props} /> : null}</div>
		</MainContent>
	);
}
