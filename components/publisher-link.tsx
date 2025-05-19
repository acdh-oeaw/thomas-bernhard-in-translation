import { getTranslations } from "next-intl/server";

interface PublisherLinkProps {
	publisher?: string;
}

export async function PublisherLink(props: PublisherLinkProps) {
	const t = await getTranslations("PublicationPage");
	return props.publisher ?? t("publisher_unknown");
}
