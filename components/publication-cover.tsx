import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { Publication } from "@/lib/model";

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
				alt={
					`${t("alt_text")} ${props.publication.title}` // TODO adjust alt if cover is missing
				}
				fill={true}
				src={
					props.publication.images[0]
						? `/covers/${props.publication.images[0].id}.jpg`
						: "/covers/slw_013.jpg" // TODO create proper 'cover missing' asset
				}
				style={{ objectFit: "contain" }}
			/>
		</div>
	);
}

export function ClickablePublicationThumbnail(props: PublicationProps) {
	return (
		<AppLink href={`/publication/${props.publication.id}`}>
			<PublicationCover
				className="m-2 size-44 border-2 border-solid border-transparent hover:border-black"
				publication={props.publication}
			/>
		</AppLink>
	);
}
