import { notFound } from "next/navigation";

import { getWorks } from "@/lib/data";
import type { Category } from "@/lib/model";

import { WorksPage } from "./WorksPage";

interface RefinedWorksPageProps {
	params: {
		// static param validation happens one route level higher
		category: Category;
		id: string;
	};
}

export default async function RefinedWorksPage(props: RefinedWorksPageProps) {
	const { category, id } = props.params;
	const works = await getWorks(category);
	if (!(id in works)) {
		notFound();
	}
	return <WorksPage category={category} works={works} />;
}
