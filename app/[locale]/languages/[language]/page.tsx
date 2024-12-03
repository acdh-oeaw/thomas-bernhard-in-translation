"use client";

import { useTranslations } from "next-intl";

import { InstantSearchView } from "@/components/instantsearch-view";
import { MainContent } from "@/components/main-content";
import { SingleRefinementList } from "@/components/single-refinement-list";

interface LanguagesPageProps {
	params?: {
		language: string;
	};
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LanguagesPage(props: LanguagesPageProps) {
	const t = useTranslations("LanguagesPage");
	const tl = useTranslations("Languages");
	return (
		<MainContent>
			<InstantSearchView queryArgsToMenuFields={{ language: "language" }}>
				<SingleRefinementList
					allLabel={t("all languages")}
					attribute={"language"}
					className="lowercase"
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
			</InstantSearchView>
		</MainContent>
	);
}
