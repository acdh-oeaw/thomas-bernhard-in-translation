import type { ReactNode } from "react";

import { ThomasBernhardInstantSearchProvider } from "@/components/instantsearch/thomas-bernhard/thomasbernhard-instantsearchprovider";

interface LanguagesLayoutProps {
	children: ReactNode;
}

export default function LanguagesLayout(props: LanguagesLayoutProps): ReactNode {
	const { children } = props;

	return (
		<ThomasBernhardInstantSearchProvider pageName="languages" pathnameField="language">
			{children}
		</ThomasBernhardInstantSearchProvider>
	);
}
