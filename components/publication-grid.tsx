import type { ReactNode } from "react";

interface PublicationGridProps {
	children: ReactNode;
}

export function PublicationGrid(props: PublicationGridProps): ReactNode {
	return <div className="m-2 grid grid-cols-1 md:grid-cols-4">{props.children}</div>;
}
