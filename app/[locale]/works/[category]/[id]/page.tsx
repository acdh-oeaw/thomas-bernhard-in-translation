import { getWorks } from "@/lib/data";
import type { Category } from "@/lib/model";

import { WorksPage } from "./WorksPage";

interface RefinedWorksPageProps {
	params: {
		category: string;
		id: string;
	};
}

export default async function RefinedWorksPage(props: RefinedWorksPageProps) {
	const category = props.params.category as Category;
	// pre-fetch work info on the server
	const works = await getWorks(category);
	return <WorksPage category={category} works={works} />;
}
