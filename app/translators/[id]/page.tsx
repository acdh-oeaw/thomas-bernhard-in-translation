import { SimpleListing } from "@/components/simple-listing";

interface TranslatorsPageProps {
	params?: {
		id: string;
	};
}

export default function TranslatorsPage(props: TranslatorsPageProps) {
	return (
		<SimpleListing
			facetingField="contains.translators.name"
			// FIXME ugly
			facetingValue={props.params ? decodeURI(props.params.id) : undefined}
			path="translator"
		/>
	);
}
