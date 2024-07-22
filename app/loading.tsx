import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { LoadingIndicator } from "@/components/loading-indicator";
import { MainContent } from "@/components/main-content";

export default function Loading(): ReactNode {
	const t = useTranslations("Loading");

	return (
		<MainContent className="container py-8">
			<LoadingIndicator aria-label={t("loading")} />
		</MainContent>
	);
}
