import type { Publication } from "@/lib/model";

import { AppLink } from "./app-link";

interface PublicationLinkProps {
	publication: Publication;
}

export function PublicationLink(props: PublicationLinkProps) {
	return (
		<AppLink href={`/publications/${props.publication.id}`}>{props.publication.title}</AppLink>
	);
}
