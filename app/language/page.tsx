import { FacetedListing, type FacetedListingProps } from "@/components/faceted-listing";

export default function LanguagesPage(props: FacetedListingProps) {
	return <FacetedListing facet="language" searchParams={props.searchParams} />;
}
