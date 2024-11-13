import type { ReactNode } from "react";

import { InstantSearch } from "@/components/instantsearch";
import { MainContent } from "@/components/main-content";

interface PublicationsPageProps {}

export default function PublicationsPage(props: PublicationsPageProps): ReactNode {
	return (
		<MainContent>
			<InstantSearch queryArgsToMenuFields={{}}>
				<div>foo</div>
			</InstantSearch>
		</MainContent>
	);
}
