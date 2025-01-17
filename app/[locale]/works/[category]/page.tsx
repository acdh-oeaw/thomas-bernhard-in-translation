import { getWorks } from "@/lib/data";
import type { Category } from "@/lib/model";

import { WorksPage } from "./[id]/WorksPage";

interface UnrefinedWorksPageProps {
	params: {
		category: string;
	};
}
export default async function UnrefinedWorksPage(props: UnrefinedWorksPageProps) {
	const category = props.params.category as Category;
	// fetching the work names on the client with useEffect triggers a re-render of the refinement list which also wipes the
	// current refinement from its state...
	// https://github.com/algolia/react-instantsearch/issues/3541
	// workaround like https://github.com/algolia/instantsearch/issues/2568
	const works = await getWorks(category);
	return <WorksPage category={category} works={works} />;
}
