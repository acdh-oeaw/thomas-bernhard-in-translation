import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { Publication } from "@/types/model";

import { Link } from "./link";

interface PublicationProps {
	publication: Publication;
}

export function PublicationCover(props: PublicationProps): ReactNode {
	const t = useTranslations("PublicationCover");
	return (
		<Image
			alt={`${t("alt_text")} ${props.publication.title}`}
			fill={true}
			src={`/covers/${props.publication.signatur}.jpg`}
			style={{ objectFit: "contain" }}
		/>
	);
}

export function ClickablePublicationThumbnail(props: PublicationProps) {
	return (
		<Link href={`/publication/${props.publication.signatur}`}>
			<div className="relative size-44 p-3">
				<PublicationCover publication={props.publication} />
			</div>
		</Link>
	);
}
