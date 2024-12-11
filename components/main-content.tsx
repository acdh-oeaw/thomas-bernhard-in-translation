import type { ReactNode } from "react";

export const id = "main-content";

interface MainContentProps {
	children: ReactNode;
	className?: string;
}

export function MainContent(props: MainContentProps): ReactNode {
	const { children, className } = props;

	return (
		<main className={className ?? "mx-auto w-screen max-w-screen-xl p-6"} id={id} tabIndex={-1}>
			{children}
		</main>
	);
}
