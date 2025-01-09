"use client";

import { useTranslations } from "next-intl";

import { Results } from "@/components/instantsearch/results";
import { SingleRefinementList } from "@/components/instantsearch/single-refinement-list";
import { MainContent } from "@/components/main-content";

export default function LanguagesPage() {
	const t = useTranslations("LanguagesPage");
	const tl = useTranslations("Languages");
	// TODO validate 'language' param?
	return (
		<MainContent>
			<div className="grid h-full grid-cols-[25%_75%] gap-6 px-2">
				<div className="relative h-full">
					<SingleRefinementList
						allLabel={t("all languages")}
						attribute={"language"}
						className="lowercase"
						pathname="languages"
						refinementArgs={{
							transformItems: (items) => {
								return items
									.map((item) => {
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										item.label = tl(item.label as any);
										return item;
									})
									.sort((a, b) => {
										return a.label.localeCompare(b.label);
									});
							},
						}}
					/>
				</div>
				<Results />
			</div>
		</MainContent>
	);
}
