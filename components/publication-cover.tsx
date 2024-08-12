import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { Publication } from "@/types/model";

import { AppLink } from "./app-link";

interface PublicationProps {
	publication: Publication;
	className?: string;
}

export function PublicationCover(props: PublicationProps): ReactNode {
	const t = useTranslations("PublicationCover");
	return (
		<div className={`${props.className ?? "m-2 size-44"} relative`}>
			<Image
				alt={`${t("alt_text")} ${props.publication.title}`}
				fill={true}
				src={
					props.publication.images
						? `/covers/${props.publication.id}.jpg`
						: "/assets/images/logo.svg"
				}
				style={{ objectFit: "contain" }}
			/>
		</div>
	);
}

export function ClickablePublicationThumbnail(props: PublicationProps) {
	return (
		<AppLink href={`/publication/${props.publication.id}`}>
			<PublicationCover className={props.className} publication={props.publication} />
		</AppLink>
	);
}
