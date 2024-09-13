import type { BernhardWork } from "@/lib/model";

interface BernhardWorkProps {
	work: BernhardWork;
	className?: string;
}

export function BernhardWorkLink(props: BernhardWorkProps) {
	// return <AppNavLink href={`/work/${props.work.id}`}>{props.work.title}</AppNavLink>;
	return props.work.title;
}
