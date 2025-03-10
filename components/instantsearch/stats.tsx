import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useStats } from "react-instantsearch";

export function InstantSearchStats(): ReactNode {
	const t = useTranslations("InstantSearch");
	const stats = useStats();
	// https://www.algolia.com/doc/api-reference/widgets/stats/react/#hook
	return <>{t("result", { count: stats.nbHits })}</>;
}
