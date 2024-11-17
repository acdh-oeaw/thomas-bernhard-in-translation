import type { ReactNode } from "react";

interface InlineListProps {
	children: Array<ReactNode>;
	separator: string;
}

export function InlineList(props: InlineListProps): ReactNode {
	const { children, separator } = props;

	return (
		<ol>
			{children.map((e, i) => {
				return (
					<li
						key={i}
						className="inline before:content-[attr(data-before)]"
						data-before={i === 0 ? null : separator}
					>
						{e}
					</li>
				);
			})}
		</ol>
	);
}
