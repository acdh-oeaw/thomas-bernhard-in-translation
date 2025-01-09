import type { ReactNode } from "react";

import { ThomasBernhardInstantSearchProvider } from "@/components/instantsearch/thomas-bernhard/thomasbernhard-instantsearchprovider";

interface SearchLayoutProps {
	children: ReactNode;
}

export default function SearchLayout(props: SearchLayoutProps): ReactNode {
	const { children } = props;

	return (
		<ThomasBernhardInstantSearchProvider
			queryArgsToMenuFields={{
				language: "language" as const,
				category: "contains.work.category" as const,
				work: "contains.work.short_title" as const,
				translator: "contains.translators.name" as const,
			}}
		>
			{children}
		</ThomasBernhardInstantSearchProvider>
	);
}
