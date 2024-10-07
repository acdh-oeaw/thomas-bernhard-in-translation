import type { ReactNode } from "react";
import { useStats } from "react-instantsearch";

export function InstantSearchStats(): ReactNode {
	const stats = useStats();
	// https://www.algolia.com/doc/api-reference/widgets/stats/react/#hook
	return <>{stats.nbHits} results</>;
}
