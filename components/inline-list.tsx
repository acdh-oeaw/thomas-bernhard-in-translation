import type { ReactNode } from "react";

interface InlineListProps {
	children: Array<ReactNode>;
	separator?: string;
}

export function InlineList(props: InlineListProps): ReactNode {
	const { children, separator } = props;

	return (
		<>
			{children.flatMap((e, i) => {
				return [i === 0 ? null : (separator ?? ", "), e];
			})}
		</>
	);
}
