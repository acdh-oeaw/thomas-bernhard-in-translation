import { getFaceted } from "@/lib/data";

import { AppNavLink } from "./app-nav-link";
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
		<MainContent className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
			{counts?.map((c) => {
				return (
					<div key={c.value} className="px-2">
						<AppNavLink href={`/search?${props.path}=${c.value}`}>
							{c.value}&nbsp;({c.count})
						</AppNavLink>
					</div>
				);
			})}
		</MainContent>
	);
}
