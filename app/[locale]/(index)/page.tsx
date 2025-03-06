import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MainContent } from "@/components/main-content";
import { PublicationGrid } from "@/components/publication-grid";
import type { Locale } from "@/config/i18n.config";
import { getPublications } from "@/lib/data";

interface IndexPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: IndexPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const _t = await getTranslations({ locale, namespace: "IndexPage" });

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

export default async function IndexPage(props: IndexPageProps) {
	const { params } = props;

	const { locale } = params;
	setRequestLocale(locale);

	const t = await getTranslations("IndexPage");

	const pubs = await getPublications({
		// filter non-erstpublikationen and missing cover assets
		filter_by: "erstpublikation:true && has_image:true",
		q: "*",
		sort_by: "_rand:asc",
	});
	return (
		<MainContent>
			<section className="mx-auto grid w-full max-w-screen-lg items-start justify-items-center gap-3 px-4 py-8 text-center md:py-12">
				<h1 className="sr-only">{t("title")}</h1>
				<div className="mx-auto w-full max-w-screen-md text-pretty text-lg text-on-muted sm:text-xl">
					{t("lead-in")}
				</div>
				<PublicationGrid publications={pubs} />
			</section>
		</MainContent>
	);
}
