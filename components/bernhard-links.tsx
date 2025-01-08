import type { BernhardWork } from "@/lib/model";

import { AppNavLink } from "./app-nav-link";

interface BernhardWorkProps {
	work: BernhardWork;
	display_title?: string;
	className?: string;
}

export function BernhardWorkLink(props: BernhardWorkProps) {
	return (
		<AppNavLink href={encodeURI(`/works/${props.work.category!}/${props.work.id.toString()}`)}>
			{props.display_title ?? props.work.title}
		</AppNavLink>
	);
}
