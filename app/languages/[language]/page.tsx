import { SimpleListing } from "@/components/simple-listing";

interface LanguagesPageProps {
	params?: {
		language: string;
	};
}

export default function LanguagesPage(props: LanguagesPageProps) {
	return (
		<SimpleListing
			facetingField="language"
			facetingValue={props.params?.language}
			path="language"
		/>
	);
}
