import type { ReactNode } from "react";

import { ThomasBernhardInstantSearchProvider } from "@/components/instantsearch/thomas-bernhard/thomasbernhard-instantsearchprovider";

interface LanguagesLayoutProps {
	children: ReactNode;
	params: {
		category: string;
	};
}

export default function LanguagesLayout(props: LanguagesLayoutProps): ReactNode {
	const { children, params } = props;

	return (
		<ThomasBernhardInstantSearchProvider
			filters={`contains.work.category:=${params.category}`}
			pageName={`works/${params.category}`}
			pathnameField="contains.work.id"
			queryArgsToMenuFields={{ language: "language" }}
		>
			{children}
		</ThomasBernhardInstantSearchProvider>
	);
}
