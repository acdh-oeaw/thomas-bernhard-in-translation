import { cn } from "@acdh-oeaw/style-variants";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Image } from "@/components/image";
import type { Publication } from "@/lib/model";

import { PublicationLink } from "./publication-link";

interface PublicationCoverProps {
	className?: string;
	publication: Publication;
}

export function PublicationCover(props: PublicationCoverProps): ReactNode {
	const t = useTranslations("PublicationCover");
	return (
		<Image
			alt={props.publication.has_image ? `${t("alt_text")} ${props.publication.title}` : ""}
			className={cn(
				"m-auto h-full w-auto max-w-full border border-gray-400 object-contain",
				props.className,
			)}
			height={0}
			sizes="100vw"
			src={
				props.publication.has_image
					? `/covers/${props.publication.images[0]!.id.toString()}.jpg`
					: "/covers/cover_missing.jpg"
			}
			width={0}
		/>
	);
}

export function ClickablePublicationThumbnail(props: PublicationCoverProps) {
	return (
		<PublicationLink
			className="relative block size-full object-contain hover:outline"
			publication={props.publication}
		>
			<PublicationCover publication={props.publication} />
			<span className="sr-only">
				{props.publication.title} ({props.publication.year})
			</span>
		</PublicationLink>
	);
}
