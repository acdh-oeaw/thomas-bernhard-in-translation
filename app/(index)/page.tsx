import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";

import { MainContent } from "@/components/main-content";
import { PublicationGrid } from "@/components/publication-grid";
import { getPublications } from "@/lib/data";

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

export default async function IndexPage(_props: IndexPageProps) {
	// const t = useTranslations("IndexPage");

	const pubs = await getPublications({
		// filter non-erstpublikationen and missing cover assets
		filter_by: "erstpublikation:true && has_image:true",

		// TODO workaround until upgrade to typesense 0.28, afterwards can just use: "_rand:asc"
		// just look for a single random letter a-w (ASCII 65-87)
		q: String.fromCharCode(Math.floor(65 + 22 * Math.random())),
		sort_by: "_text_match:" + (Math.random() > 0.5 ? "asc" : "desc"),
	});

	// <section className="mx-auto grid w-full max-w-screen-lg items-start justify-items-center gap-3 px-4 py-8 text-center md:py-12">
	return (
		<MainContent className="">
			<h1 className="sr-only">A random sample of Thomas Bernhard translations</h1>
			<PublicationGrid publications={pubs} />
		</MainContent>
	);
}
