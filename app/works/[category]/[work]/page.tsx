// import { useTranslations } from "next-intl";

import { useTranslations } from "next-intl";

import { AppNavLink } from "@/components/app-nav-link";
import { SimpleListing } from "@/components/simple-listing";
import { otherCategories, proseCategories } from "@/lib/model";

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
		<div>
			<div className="flex justify-center">
				{otherCategories.map((c) => {
					return (
						<AppNavLink key={c} className="p-4" href={`/works/${c}`}>
							{
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								catt(c as any)
							}
						</AppNavLink>
					);
				})}
			</div>
			<div className="flex justify-center">
				{props.params?.category === "prose" ||
				(proseCategories as unknown as Array<string>).includes(
					props.params?.category as unknown as string,
				)
					? proseCategories.map((c) => {
							return (
								<AppNavLink key={c} className="p-4" href={`/works/${c}`}>
									{
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										catt(c as any)
									}
								</AppNavLink>
							);
						})
					: null}
			</div>
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
		</div>
	);
}
