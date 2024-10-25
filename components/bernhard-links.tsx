import type { BernhardWork } from "@/lib/model";

interface BernhardWorkProps {
	work: BernhardWork;
	display_title?: string;
	className?: string;
}

export function BernhardWorkLink(props: BernhardWorkProps) {
	return props.display_title ?? props.work.title;
	// return (
	// 	<AppNavLink href={`/works/${props.work.id}`}>
	// 		{props.display_title ?? props.work.title}
	// 	</AppNavLink>
	// );
}
