"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import { Link, type LinkProps } from "@/components/link";

interface AppLinkProps extends LinkProps {}

export function AppLink(props: AppLinkProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<Link
			{...rest}
			className={cn(
				"text-[--color-link] transition aria-[current]:font-medium aria-[current]:text-[--color-link-active] hover:text-[--color-link-hover] focus-visible:text-[--color-link-hover]",
				className,
			)}
		>
			{children}
		</Link>
	);
}
