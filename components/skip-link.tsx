"use client";

import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { createHref } from "@/lib/create-href";

interface SkipLinkProps {
	children: ReactNode;
	id?: string;
	targetId: string;
}

export function SkipLink(props: SkipLinkProps): ReactNode {
	const { children, id, targetId } = props;

	/**
	 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=308064
	 */
	function onClick() {
		document.getElementById(targetId)?.focus();
	}

	return (
		<Link
			className="fixed z-50 -translate-y-full rounded bg-background px-4 py-3 text-on-background transition focus:translate-y-0"
			href={createHref({ hash: targetId })}
			id={id}
			onClick={onClick}
		>
			{children}
		</Link>
	);
}
