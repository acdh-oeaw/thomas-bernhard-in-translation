import { getWorks } from "@/lib/data";
import { bernhardCategories, type Category } from "@/lib/model";

import { WorksPage } from "./[id]/WorksPage";

interface UnrefinedWorksPageProps {
	params: {
		category: Category;
	};
}

export const dynamicParams = false;

export function generateStaticParams() {
	return bernhardCategories.map((c) => {
		return { category: c };
	});
}

export default async function UnrefinedWorksPage(props: UnrefinedWorksPageProps) {
	const category = props.params.category;
	// fetching the work names on the client with useEffect triggers a re-render of the refinement list which also wipes the
	// current refinement from its state...
	// https://github.com/algolia/react-instantsearch/issues/3541
	// workaround like https://github.com/algolia/instantsearch/issues/2568
	const works = await getWorks(category);
	return <WorksPage category={category} works={works} />;
}
