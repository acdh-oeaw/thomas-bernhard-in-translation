// import { useTranslations } from "next-intl";

import { useTranslations } from "next-intl";

import { SimpleListing } from "@/components/simple-listing";

interface WorksPageProps {
	params?: {
		category: string;
		work?: string;
	};
}

export default function WorksPage(props: WorksPageProps) {
	const catt = useTranslations("BernhardCategories");
	const _t = useTranslations("WorkPage");
	return (
		<SimpleListing
			facetingField="contains.work.title"
			// FIXME ugly
			facetingValue={props.params?.work ? decodeURI(props.params.work) : undefined}
			filter_by={
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				`contains.work.category := ${catt(props.params?.category as any)}`
			}
			path={`work`}
		/>
	);
}
