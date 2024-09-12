import type { ReactNode } from "react";

export const id = "main-content";

interface MainContentProps {
	children: ReactNode;
	className?: string;
}

export function MainContent(props: MainContentProps): ReactNode {
	const { children, className = "bernhard-grid" } = props;

	return (
		<main className="container max-w-screen-lg p-8" id={id} tabIndex={-1}>
			<div className={className}>{children}</div>
		</main>
	);
}
// <MainContent className="container flex justify-center py-8">
// 	<div className="mx-auto max-w-screen-lg">{children}</div>
// </MainContent>
