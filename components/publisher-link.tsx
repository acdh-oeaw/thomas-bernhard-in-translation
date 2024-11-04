import type { Publisher } from "@/lib/model";

interface PublisherLinkProps {
	publisher: Publisher;
}

export function PublisherLink(props: PublisherLinkProps) {
	return props.publisher.name;
}
