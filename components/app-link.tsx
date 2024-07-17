"use client";

import type { ReactNode } from "react";

import { Link, type LinkProps } from "@/components/link";
import { cn } from "@/lib/styles";

interface AppLinkProps extends LinkProps {}

export function AppLink(props: AppLinkProps): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<Link
			{...rest}
			className={cn(
				"text-on-background/60 transition aria-[current]:font-medium aria-[current]:text-on-background/80 hover:text-on-background/80 focus-visible:text-on-background/80",
				className,
			)}
		>
			{children}
		</Link>
	);
}
