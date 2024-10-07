import { getTranslations } from "next-intl/server";

import { FacetedListing } from "@/components/faceted-listing";

interface WorksPageProps {
	params: {
		category: string;
	};
}

export default async function WorksPage(props: WorksPageProps) {
	const t = await getTranslations("BernhardCategories");
	return (
		<FacetedListing
			// 'category' values in the database are stored as the english category strings, not the URL slugs
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			filters={{ "contains.work.category": t(props.params.category as any) }}
			queryArgsToRefinementFields={{ work: "contains.work.title" }}
		/>
	);
}
