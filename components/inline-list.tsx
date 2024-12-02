import type { ReactNode } from "react";

interface InlineListProps {
	children: Array<ReactNode>;
	separator: string;
	limit?: number;
}

export function InlineList(props: InlineListProps): ReactNode {
	const { children, limit, separator } = props;

	const andMore = limit && children.length > limit;
	if (andMore) {
		const overhead = 1 + children.length - limit;
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		children.splice(limit - 1, overhead, `+ ${overhead.toString()} more`);
	}

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
