import { FacetedListing, type FacetedListingProps } from "@/components/faceted-listing";

export default function TranslatorPage(props: FacetedListingProps) {
	return <FacetedListing facet="contains.translators.name" searchParams={props.searchParams} />;
}
