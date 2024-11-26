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
	return (
		<MainContent>
			<InstantSearchView
				queryArgsToMenuFields={{ language: "language" }}
				// refinementDropdowns={{ language: `${t("all")} ${t("filter_by.language")}` }}
			>
				<SingleRefinementList allLabel={t("all languages")} attribute={"language"} />
			</InstantSearchView>
		</MainContent>
	);
}
