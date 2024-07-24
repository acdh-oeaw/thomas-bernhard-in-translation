import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ClickablePublicationThumbnail } from "@/components/publication-cover";

import { getPublications } from "../data";

interface IndexPageProps extends EmptyObject {}

export async function generateMetadata(
	_props: IndexPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const _t = await getTranslations("IndexPage");

	const metadata: Metadata = {
		/**
		 * Fall back to `title.default` from `layout.tsx`.
		 *
		 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#title
		 */
		// title: undefined,
	};

	return metadata;
}

export default function IndexPage(_props: IndexPageProps): ReactNode {
	// const t = useTranslations("IndexPage");

	const pubs = getPublications({ erstpublikation: true }, undefined, "RANDOM()", 0, 12);

	return (
		<section className="mx-auto grid w-full max-w-screen-lg items-start justify-items-center gap-3 px-4 py-8 text-center md:py-12">
			<div className="mx-auto w-full max-w-screen-md text-pretty text-lg text-on-muted sm:text-xl">
				<div className="grid grid-cols-3 gap-4 lg:grid-cols-4">
					{pubs.map((p) => {
						return <ClickablePublicationThumbnail key={p.signatur} publication={p} />;
					})}
				</div>
			</div>
		</section>
	);
}
